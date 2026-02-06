# Software Requirements Specification (SRS) - CampusFlow

## 1. Project Overview
**CampusFlow** is an AI-powered Knowledge Network designed to eliminate academic misinformation. It uses **RAG (Retrieval-Augmented Generation)** to allow students to chat with a verified database of lecture notes, syllabus copies, and previous year questions (PYQs). Unlike generic AI (ChatGPT), CampusFlow provides answers with **clickable citations** pointing to the exact page in the source PDF.

## 2. User Personas
* **The Learner:** A student who needs quick, syllabus-verified answers for exam prep.
* **The Contributor:** A senior/topper who uploads notes to earn community reputation (Karma).
* **The Admin (System):** Automated processes that categorize and vectorise content.

## 3. Functional Requirements

### 3.1 Authentication & Profile
* Users must log in using institutional email or social login (via Clerk).
* System must track user metadata: Branch, Semester, and College.

### 3.2 The Knowledge Engine (RAG)
* **Ingestion:** System must accept PDF/PPT uploads.
* **Processing:** System must OCR, chunk, and embed text using `all-MiniLM-L6-v2`.
* **Storage:** Vectors must be stored in Pinecone (Serverless).
* **Retrieval:** The AI Chat must strictly answer based *only* on retrieved context chunks.
* **Citation:** Every answer must append a "Source Verification" link.

### 3.3 Study Hub & Organization
* Materials must be automatically or manually tagged by:
    * Branch (CSE, ECE, MECH)
    * Subject Code
    * Semester (1-8)

### 3.4 Gamification (The "Hook")
* **Karma Points:** Awarded for uploads (e.g., +50) and verified upvotes.
* **Leaderboard:** Display top contributors by branch/semester.

## 4. Non-Functional Requirements (Constraints)
* **Accuracy:** "Zero Hallucination" policy. If the answer isn't in the docs, the AI must state "Information not found in course material."
* **Latency:** Chat response time must be under 3 seconds.
* **Cost Efficiency:** The architecture must utilize Free Tier services (Gemini Flash, Pinecone Starter) to ensure sustainability.
* **Privacy:** Student data and notes must be isolated (Logical separation).

## 5. MVP Scope (Hackathon Deliverables)
* [x] Functional User Auth.
* [x] PDF Upload & Vectorization Pipeline.
* [x] Chat Interface with Streaming Responses.
* [x] Basic Leaderboard.