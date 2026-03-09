# CampusFlow

CampusFlow is an AI-powered academic collaboration platform designed to improve how students access and interact with study materials. In many academic environments, knowledge is fragmented across messaging groups, outdated notes, and generic AI tools that often produce irrelevant answers.

CampusFlow addresses this problem by creating a **closed-loop knowledge network** where students can upload verified academic materials and query them using AI. The system retrieves answers directly from syllabus-aligned documents such as lecture notes and previous year questions, ensuring responses remain accurate and relevant.

The platform integrates **cloud infrastructure, AI-powered document retrieval, and collaborative hubs** to provide an efficient knowledge-sharing ecosystem for academic institutions.

---

# Prototype Deployment

The working prototype is deployed on a cloud server and can be accessed at:

http://54.227.118.150/

---

# Key Features

### AI-Powered Document Question Answering
Students can ask questions about uploaded study materials and receive contextual answers generated using AI.

### Document Storage and Retrieval
Users can upload and manage PDF documents which are stored securely in cloud storage.

### Smart Study Hub
Study materials are organized by category (such as subject or hub) for easier navigation and retrieval.

### Citation-Based Responses
AI responses are generated using the document context, helping ensure answers remain aligned with the source material.

### Community Collaboration
Users can contribute documents and share resources through community hubs.

### Scalable Cloud Deployment
The prototype uses cloud services to ensure reliable access and scalable storage.

---

# System Architecture

CampusFlow follows a **cloud-based client–server architecture** that integrates AI processing with document storage.

Architecture Flow

User → Frontend Interface → Backend API →  
Cloud Storage → Document Processing → AI Model → Response to User

---

# Technology Stack

| Component | Technology | Description |
|-----------|------------|-------------|
Frontend | React + Vite | Client-side UI |
Styling | Tailwind CSS | Responsive styling |
Backend | FastAPI (Python) | API services and AI orchestration |
AI Model | Google Gemini API | AI text generation |
Document Processing | PyMuPDF | Extracts text from PDFs |
Cloud Compute | AWS EC2 | Hosts backend server |
Cloud Storage | Amazon S3 | Stores uploaded documents |
Communication | REST APIs | Client–server communication |

---

# Cloud Infrastructure

The prototype uses AWS services for deployment.

| Service | Purpose |
|-------|---------|
Amazon EC2 | Hosts the FastAPI backend |
Amazon S3 | Stores uploaded PDF documents |
Public IP | Allows external access to the application |

---

# Project Structure

```
CampusFlow
│
├── backend
│   ├── main.py
│   ├── routes
│   ├── services
│   └── utils
│
├── frontend
│   ├── src
│   ├── components
│   └── pages
│
├── requirements.txt
└── README.md
```

---

# Installation & Setup

## Prerequisites

Node.js (v18 or higher)  
Python (v3.9 or higher)  
Git

---

## 1. Clone the Repository

```bash
git clone https://github.com/124-wq/CampusFlow.git
cd CampusFlow
```

---

## 2. Backend Setup

Install Python dependencies

```bash
pip install -r requirements.txt
```

Run the FastAPI server

```bash
uvicorn main:app --reload
```

---

## 3. Frontend Setup

Navigate to the frontend directory

```bash
cd frontend
```

Install dependencies

```bash
npm install
```

Start the development server

```bash
npm run dev
```

---

# Environment Variables

Create a `.env` file in the backend directory with the following variables:

```
AWS_BUCKET_NAME=your-s3-bucket-name
AWS_REGION=your-region
GEMINI_API_KEY=your-api-key
```

---

# Performance Metrics (Prototype)

| Operation | Average Response Time |
|-----------|----------------------|
Document Upload | ~2 seconds |
Document Retrieval | ~1 second |
AI Query Response | ~3 – 5 seconds |

---

# Prototype Cost Estimate

| Service | Estimated Monthly Cost |
|---------|------------------------|
AWS EC2 | $10 – $12 |
Amazon S3 | ~$0.25 |
Data Transfer | $1 – $2 |
Public IP | $3 – $4 |
AI API Usage | $0 – $5 |

**Total Estimated Monthly Cost:** ~$15 – $23

---


# Future Improvements

- Vector database integration for semantic search
- Improved document indexing and faster retrieval
- User authentication and role-based access control
- Real-time collaboration features
- Optimization for large-scale campus deployment

---

# Contributors

CampusFlow Development Team

---

# License

This project is developed for academic and research purposes.
