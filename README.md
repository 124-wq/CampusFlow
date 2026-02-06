# CampusFlow: The Open Knowledge Network
**Eliminating academic misinformation with a "Zero-Hallucination" RAG engine.**

## Overview
In many academic environments, knowledge is fragmented. Students often rely on unverified messages, outdated notes, or generic AI tools that provide answers irrelevant to their specific syllabus.

**CampusFlow** addresses this by creating a closed-loop Knowledge Network. It is an AI-powered study companion that answers questions exclusively from verified lecture notes, syllabus copies, and previous year questions (PYQs). This ensures every answer is accurate, relevant, and properly cited.

## Key Features

* **Zero-Hallucination RAG:** The AI is constrained to answer only using the provided documents. Every response includes a direct citation to the source page.
* **Smart Study Hub:** Uploaded materials are automatically organized by Branch, Semester, and Subject for easy access.
* **Gamified Contribution:** A reputation system awards "Karma Points" to students who upload high-quality notes, encouraging community contribution.
* **Syllabus Alignment:** By restricting the knowledge base to university-specific documents, the system prevents confusion from out-of-syllabus topics.

## System Architecture

We utilize a Serverless Retrieval-Augmented Generation (RAG) architecture optimized for cost efficiency and scalability.

For a detailed breakdown of the engineering decisions, please refer to our documentation:
* [System Design](docs/design.md) - Architecture and data flow.
* [Requirements & Specs](docs/requirements.md) - Functional specifications.

## Tech Stack

We selected this stack to maximize performance.

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React + Vite | Client-side UI |
| **Styling** | Tailwind CSS | Responsive styling |
| **Backend** | FastAPI (Python) | API & AI orchestration |
| **Auth** | Clerk | User authentication |
| **LLM** | Gemini 1.5 Flash | Text generation (Free tier) |
| **Vector DB** | Pinecone | Semantic search & storage |
| **Embeddings** | HuggingFace | `all-MiniLM-L6-v2` (Local execution) |
| **Storage** | Firebase | PDF file storage |

## Installation & Setup

### Prerequisites
* Node.js (v18 or higher)
* Python (v3.9 or higher)
* Git

### 1. Clone the Repository
```bash
git clone [https://github.com/124-wq/CampusFlow.git](https://github.com/124-wq/CampusFlow.git)
cd CampusFlow
