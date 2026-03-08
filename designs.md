# System Design Document - CampusFlow

## 1. High-Level Architecture
CampusFlow follows a **Client-Server Architecture** with a specialized **RAG Pipeline**.

`[Client (React)] <--> [API Gateway (FastAPI)] <--> [AI Services (Vector DB + LLM)]`

## 2. Tech Stack Selection (Zero-Cost Optimization)

| Component | Technology | Reasoning |
| :--- | :--- | :--- |
| **Frontend** | React + Vite + Tailwind | Fast load times, modular component structure. |
| **Backend** | FastAPI (Python) | Native Async support for handling AI streams. |
| **Auth** | Clerk | Secure, pre-built components for user management. |
| **Vector DB** | Pinecone | Serverless, fast similarity search (Top-K retrieval). |
| **LLM** | Google Gemini 1.5 Flash | 1M Context Window, high speed, free tier. |
| **Embeddings** | HuggingFace (`all-MiniLM`) | Runs on CPU, no API cost, high semantic accuracy. |
| **Storage** | Firebase Storage | Reliable storage for raw PDF blobs. |

## 3. Data Flow Architecture

### 3.1 The Ingestion Pipeline (Write Path)
1.  User uploads PDF via Frontend.
2.  Backend receives file -> Uploads to **Firebase Storage** (Generates URL).
3.  Backend uses `LangChain` to:
    * Extract text (PDF parsing).
    * Split text into chunks (Size: 500 tokens, Overlap: 50).
    * Generate Embeddings via **HuggingFace**.
4.  Vectors + Metadata (File URL, Page Number, Uploader ID) pushed to **Pinecone**.

### 3.2 The Retrieval Pipeline (Read Path)
1.  User sends Query: *"Explain Unit 3 graph theory"*.
2.  Backend converts query to vector embedding.
3.  **Pinecone** performs Similarity Search -> Returns Top 3 relevant chunks.
4.  **Prompt Engineering:** Backend constructs a strict prompt:
    > "You are a university tutor. Answer ONLY using the context below. If answer is not present, say so."
    > Context: {Chunk 1, Chunk 2, Chunk 3}
5.  **Gemini 1.5** generates response.
6.  Backend appends metadata links (Page 12) and streams response to UI.

## 4. Database Schema (Supabase/PostgreSQL)

**Table: Users**
* `id` (UUID, Primary Key)
* `email` (String)
* `karma_points` (Int)
* `branch` (String)

**Table: Documents**
* `id` (UUID)
* `uploader_id` (FK -> Users)
* `file_url` (String - Firebase Link)
* `subject_tag` (String)
* `pinecone_vector_id` (String)

## 5. API Endpoints (FastAPI)

* `POST /api/upload`: Handles file ingestion and vectorization.
* `POST /api/chat`: Handles RAG query and context retrieval.
* `GET /api/leaderboard`: Fetches top users by Karma.
* `GET /api/documents/{subject}`: Fetches study material list.

## 6. Security & Scalability
* **Rate Limiting:** Implemented via Redis (optional) or basic in-memory counter to prevent API abuse.
* **CORS:** Restricted to Frontend domain.
* **Environment Variables:** All API keys (Gemini, Pinecone, Firebase) stored in `.env`, never committed to Git.