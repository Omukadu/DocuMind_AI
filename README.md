# DocuMind AI

DocuMind AI is a modern AI-powered document management platform built with the MERN stack. It enables teams to securely organize, search, summarize, and interact with documents using Google Gemini AI.

## Features

### Authentication

* JWT Authentication
* Secure Login & Registration
* Protected Routes
* Role-Based Access Control

### Workspace Management

* Create Multiple Workspaces
* Folder Organization
* Team Collaboration
* Member Management

### Document Management

* PDF, DOCX and TXT Upload
* Document Processing
* Text Extraction
* Search & Filtering
* Version Tracking
* Document Sharing

### AI Features

* AI Document Summaries
* Context-Aware Document Chat
* Workspace-Level AI Assistant
* Folder-Level AI Queries
* Google Gemini Integration

### Collaboration

* Notifications
* Audit Logs
* Activity Timeline
* Secure Document Sharing

## Tech Stack

### Frontend

* React
* Vite
* Tailwind CSS
* React Router DOM
* Axios

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication
* Multer

### AI

* Google Gemini API

## Project Structure

```text
client/
server/
```

## Installation

### Backend

```bash
cd server
npm install
npm run dev
```

### Frontend

```bash
cd client
npm install
npm run dev
```

### Seed Database

```bash
npm run seed
```

## Environment Variables

Backend:

```env
PORT=
MONGODB_URI=
JWT_SECRET=
JWT_REFRESH_SECRET=
AI_PROVIDER=gemini
GEMINI_API_KEY=
EMAIL_USER=
EMAIL_PASS=
```

## Future Improvements

* Semantic vector search
* Advanced RAG pipeline
* Multi-file knowledge retrieval
* OCR support
* Cloud storage integration
* Real-time collaboration

## License

This project is built for portfolio and learning purposes.
