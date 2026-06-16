# Smart Placement Tracker - System Design & Documentation

This document provides a detailed overview of the system architecture, feature checklist, tech stack, database schemas, and API endpoints for the Smart Placement Tracker (SPT) project.

---

## 1. System Architecture & Flow

The application is built on a standard **Client-Server-Database Architecture** using the MERN stack:

*   **Client (Frontend)**: React SPA built with Vite and Tailwind CSS.
*   **Server (Backend)**: Node.js and Express.js REST API with Socket.IO for real-time WebSocket communication.
*   **Database**: MongoDB database using Mongoose ODM for schemas and queries.

### System Architecture Flowchart
```
[Client (React SPA)] 
    │
    ├── (HTTP Requests / JWT Auth) ──> [Express REST APIs] ──> [MongoDB Database]
    │
    └── (WebSockets / JWT Auth)  ──> [Socket.IO Server] ──> [SPT Bot Engine]
```

---

## 2. Core Features & Tech Stack Matrix

Here is how each feature is built and the specific technologies or skills used for it:

| Feature Module | Task Description | File Location References | Tech Stack / Libraries |
| :--- | :--- | :--- | :--- |
| **Authentication** | User register, login, password hashing, and JWT token storage in LocalStorage. | `client/src/context/AuthContext.jsx`<br>`server/controllers/authController.js` | React Context API, Axios, jsonwebtoken, bcryptjs |
| **Kanban Board** | Dynamic drag-and-drop dashboard to track job applications by status (`Applied`, `Interview`, `Offer`, `Rejected`). | `client/src/pages/Dashboard.jsx`<br>`client/src/components/JobCard.jsx`<br>`server/controllers/jobController.js` | React State, Tailwind CSS, Express PATCH routing, Mongoose |
| **Resume ATS Scanner** | Extract text from PDF, DOCX, or TXT resumes and run a matching keyword algorithm against a job description. | `client/src/pages/ResumeATS.jsx`<br>`client/src/services/atsAnalyzer.js`<br>`server/controllers/resumeController.js` | pdfjs-dist, mammoth.js, pdf-parse, multer, JS RegExp |
| **Mock Interview Hub** | Interactive verbal interview prep using voice-to-text transcriptions and audio reading. Includes coding MCQs. | `client/src/pages/MockTests.jsx` | Web Speech API (SpeechRecognition & SpeechSynthesis), canvas-confetti |
| **Real-time Chat & Rooms** | Chat channels with online lists, typing indicators, and a bot that replies to placement questions. | `client/src/pages/Chat.jsx`<br>`client/src/services/socket.js`<br>`server/config/socket.js` | Socket.IO (client & server), WebSockets, Async SetTimeout logic |

---

## 3. Database Schemas (MongoDB)

The project database consists of five collections:

### 1. User (`User.js`)
*   `name` (String): Full name of the student.
*   `email` (String, unique): Login credential.
*   `password` (String): Salted password hash.

### 2. Job (`Job.js`)
*   `user` (ObjectId ref User): Owner of the application.
*   `company` (String): Target organization name.
*   `role` (String): Job title.
*   `status` (String enum): Current stage (`Applied`, `Interview`, `Offer`, `Rejected`).
*   `interviewDate` (Date) / `interviewTime` (String): Interview timing details.
*   `interviewType` (String enum): Mode (`Phone`, `Video`, `On-site`, `Technical`, `HR`, `Other`).
*   `feedbackGood` (String) / `feedbackBad` (String): Strengths and areas to improve.

### 3. Resume (`Resume.js`)
*   `user` (ObjectId ref User): Owner of the resume file.
*   `fileName` (String): Unique name stored on disk.
*   `originalName` (String): Original file name.
*   `fileType` (String): File extension (PDF, DOCX, TXT).
*   `extractedText` (String): Text parsed from the document.
*   `wordCount` (Number): Total words.

### 4. Message (`Message.js`)
*   `room` (String): Topic room name (`general`, `resume-help`, etc.).
*   `sender` (String): Sender ID (or `"bot"`).
*   `senderName` (String): Name display.
*   `text` (String): Message body.

### 5. Notification (`Notification.js`)
*   `user` (ObjectId ref User): Target user receiving alerts.
*   `job` (ObjectId ref Job): Job reference.
*   `title` / `message` (String): Notification text.
*   `read` (Boolean): Read check flag.

---

## 4. Backend Route Directory

All HTTP requests map from the baseline `/api` endpoint:

| Route | HTTP Method | Action / Purpose | Auth Required |
| :--- | :--- | :--- | :--- |
| `/api/auth/register` | `POST` | Create a new user profile. | No |
| `/api/auth/login` | `POST` | Verify credentials and get JWT. | No |
| `/api/auth/me` | `GET` | Get current user's profile info. | **Yes** |
| `/api/jobs` | `GET` | Fetch all job applications for user. | **Yes** |
| `/api/jobs` | `POST` | Create a new job application. | **Yes** |
| `/api/jobs/:id` | `PUT` | Update job/interview fields. | **Yes** |
| `/api/jobs/:id` | `DELETE` | Delete a job application. | **Yes** |
| `/api/jobs/:id/status` | `PATCH` | Update status column only. | **Yes** |
| `/api/resume/upload` | `POST` | Upload and extract resume text. | **Yes** |
| `/api/resume` | `GET` | Get user resume details. | **Yes** |
| `/api/chat/rooms/list` | `GET` | Get public chat rooms list. | **Yes** |
| `/api/chat/:room` | `GET` | Load historical messages for room. | **Yes** |
| `/api/notifications` | `GET` | Get user notifications. | **Yes** |
| `/api/notifications/read-all`| `PUT` | Mark all notifications as read. | **Yes** |

---

## 5. Web Speech Integration

The application integrates browser-native **HTML5 Web Speech APIs** in the Mock Interview component:
1.  **SpeechRecognition**: The browser captures the student's mic input, listens continuously, and transcribes voice into text live on the screen.
2.  **SpeechSynthesis**: The browser converts standard strings into vocal speech using `SpeechSynthesisUtterance`, allowing the virtual recruiter to read out questions.
