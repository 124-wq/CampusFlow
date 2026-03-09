import os, io, boto3, fitz, json
from fastapi import FastAPI, UploadFile, File, HTTPException, Query
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from pydantic import BaseModel
from dotenv import load_dotenv
import google.generativeai as genai
from boto3.dynamodb.conditions import Key # Required for message queries
from fastapi.middleware.cors import CORSMiddleware
load_dotenv()

# --- Google Gemini/Gemma Configuration ---
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel('models/gemma-3-1b-it')

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add your Amplify URL here once Step 2 of the deployment is done
origins = ["*"]


# --- AWS Configuration ---
REGION = "us-east-1"
s3 = boto3.client('s3', region_name=REGION)
dynamodb = boto3.resource('dynamodb', region_name=REGION)

user_table = dynamodb.Table('CampusFlow_Users')
metadata_table = dynamodb.Table('CampusFlow_Metadata')
groups_table = dynamodb.Table('CampusFlow_Groups') 
# 1️⃣ NEW: MESSAGES TABLE REFERENCE
messages_table = dynamodb.Table('CampusFlow_Messages') 

BUCKET_NAME = os.getenv("AWS_BUCKET_NAME")

# --- Persistent Chat Functionality ---

# 2️⃣ NEW: SEND MESSAGE TO DATABASE
@app.post("/send-message")
async def send_message(invite_code: str, sender: str, text: str):
    try:
        messages_table.put_item(Item={
            'hub_id': invite_code,
            'timestamp': str(datetime.now().timestamp()),
            'sender': sender,
            'text': text
        })
        return {"status": "success"}
    except Exception as e:
        return {"error": str(e)}

# 3️⃣ NEW: FETCH HUB HISTORY
@app.get("/get-messages/{invite_code}")
def get_messages(invite_code: str):
    try:
        # Queries DynamoDB for all messages linked to this hub's invite code
        res = messages_table.query(
            KeyConditionExpression=Key('hub_id').eq(invite_code)
        )
        # Returns messages sorted by time so the conversation flows correctly
        return sorted(res.get('Items', []), key=lambda x: x['timestamp'])
    except Exception as e:
        return []

# --- Existing Functionalities (Maintained Strictly) ---

@app.post("/verify-group-access")
async def verify_group_access(invite_code: str = Query(...), password: str = Query(...)):
    try:
        res = groups_table.get_item(Key={'invite_code': invite_code})
        if 'Item' in res:
            group = res['Item']
            stored_password = str(group['password']).strip()
            provided_password = str(password).strip()
            if stored_password == provided_password:
                return {"authorized": True, "branch": group['branch']}
        return {"authorized": False, "error": "Incorrect Credentials"}
    except Exception as e:
        return {"authorized": False, "error": str(e)}

@app.get("/list-branch-groups/{branch}")
def list_groups(branch: str):
    try:
        response = groups_table.scan()
        items = response.get('Items', [])
        
        # Logic: If branch is "ALL", return every hub in the DB
        if branch.upper() == "ALL":
            return {"groups": items}
            
        filtered = [i for i in items if i.get('branch') == branch]
        return {"groups": filtered}
    except Exception as e:
        return {"groups": [], "error": str(e)}

@app.get("/download/{filename}")
async def download_file(filename: str):
    try:
        s3_object = s3.get_object(Bucket=BUCKET_NAME, Key=filename)
        return StreamingResponse(
            s3_object['Body'],
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except Exception as e:
        raise HTTPException(status_code=404, detail="File not found")

@app.get("/user-profile/{email}")
def get_profile(email: str):
    try:
        res = user_table.get_item(Key={'email': email})
        return res.get('Item', {'email': email, 'karma': 0})
    except:
        return {'email': email, 'karma': 0}

@app.post("/create-group")
async def create_group(name: str, branch: str, password: str, creator: str):
    try:
        invite_code = f"{name.lower().replace(' ', '-')}-{int(datetime.now().timestamp())}"
        groups_table.put_item(Item={
            'invite_code': invite_code,
            'group_name': name,
            'branch': branch,
            'password': password,
            'creator': creator,
            'created_at': str(datetime.now())
        })
        return {"invite_link": f"http://localhost:5173/join/{invite_code}"}
    except Exception as e: return {"error": str(e)}

@app.post("/upload")
async def upload_file(file: UploadFile = File(...), email: str = None, degree: str = "B.Tech", branch: str = "IT"):
    try:
        # 1. Read and Save to S3
        content = await file.read()
        s3.put_object(Bucket=BUCKET_NAME, Key=file.filename, Body=content)
        
        # 2. Log metadata
        metadata_table.put_item(Item={
            'filename': file.filename, 
            'degree': degree, 
            'branch': branch,
            'uploader': email, 
            'timestamp': str(datetime.now())
        })
        
        # 3. CRITICAL: The XP Sync 
        user_table.update_item(
            Key={'email': email},
            UpdateExpression="set karma = if_not_exists(karma, :zero) + :val",
            ExpressionAttributeValues={
                ':val': 50,
                ':zero': 0
            }
        )
        
        # 4. Return success so the frontend knows to refresh
        return {"new_karma": True}
        
    except Exception as e:
        print(f"Update Failed: {str(e)}")
        return {"error": str(e)}

@app.get("/list-files")
def list_files(degree: str = None, branch: str = None):
    try:
        response = metadata_table.scan()
        items = response.get('Items', [])
        filtered = [i for i in items if (not degree or i.get('degree') == degree) and (not branch or i.get('branch') == branch)]
        return {"files": filtered}
    except Exception as e: return {"files": []}

@app.get("/ask-campus")
async def ask_campus(question: str, filename: str):
    try:
        response = s3.get_object(Bucket=BUCKET_NAME, Key=filename)
        file_content = response['Body'].read()
        doc = fitz.open(stream=file_content, filetype="pdf")
        full_text = "".join([page.get_text() for page in doc])
        
        prompt = f"Use this context to answer: {question}\n\nCONTENT:\n{full_text[:8000]}"
        ai_response = model.generate_content(prompt)
        return {"answer": ai_response.text}
    except Exception as e:
        return {"error": str(e)}

@app.get("/leaderboard")
def get_leaderboard():
    try:
        items = user_table.scan().get('Items', [])
        return sorted(items, key=lambda x: x.get('karma', 0), reverse=True)[:5]
    except Exception as e: return []

@app.get("/smart-search")
async def smart_search(query: str, branch: str = None):
    try:
        files = metadata_table.scan().get("Items", [])

        # Filter by branch if requested, otherwise check all
        if branch and branch.upper() != "ALL":
            files = [f for f in files if f.get("branch") == branch]

        results = []

        for file in files:
            filename = file["filename"]
            try:
                # download pdf from S3
                response = s3.get_object(Bucket=BUCKET_NAME, Key=filename)
                content = response['Body'].read()

                # read pdf text
                doc = fitz.open(stream=content, filetype="pdf")
                text = "".join([page.get_text() for page in doc]).lower()

                # Basic keyword matching within extracted text
                if query.lower() in text:
                    results.append({
                        "filename": filename,
                        "branch": file.get("branch"),
                        "degree": file.get("degree")
                    })
            except Exception as inner_e:
                print(f"Skipping {filename} due to error: {inner_e}")
                continue

        return {"results": results}

    except Exception as e:
        return {"error": str(e)}


from fastapi.staticfiles import StaticFiles

app.mount("/", StaticFiles(directory="frontend/dist", html=True), name="frontend")