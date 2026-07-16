# Smart Placement Tracker

A full-stack MERN application for students to track job applications, prepare for interviews, and collaborate with peers during placement season.

## 🚀 Features

- **Authentication** — Secure Register/Login with JWT
- **Kanban Dashboard** — Drag & drop job cards between Applied / Interview / Offer / Rejected columns
- **Job CRUD** — Add, edit, and delete job applications with detailed notes
- **Interview Tracker** — Dedicated view for upcoming interviews with dates, types, and notes
- **ATS Resume Scorer** — Upload your resume and match it against a job description
- **Real-time Chat** — Room-based group chat powered by Socket.IO with an SPT Bot assistant
- **Mock Tests** — Practice aptitude, technical, and HR questions
- **Notifications** — In-app notifications for status changes
- **Search & Filter** — Find jobs by company/role, filter by status
- **Responsive Design** — Fully functional on mobile and desktop

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, React Router v6 |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Real-time | Socket.IO |
| Auth | JWT, bcryptjs |
| File Parsing | pdf-parse, mammoth |
| HTTP Client | Axios |

---

## 📁 Project Structure

```
Smart Placement Tracker/
├── client/                       # React + Vite frontend
│   ├── src/
│   │   ├── components/           # Reusable UI components
│   │   │   ├── Navbar.jsx
│   │   │   ├── NotificationBell.jsx
│   │   │   ├── JobCard.jsx
│   │   │   ├── JobModal.jsx
│   │   │   ├── KanbanColumn.jsx
│   │   │   ├── Toast.jsx
│   │   │   └── Loader.jsx
│   │   ├── context/              # React context providers
│   │   │   └── AuthContext.jsx
│   │   ├── pages/                # Route-level page components
│   │   │   ├── Landing.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Interviews.jsx
│   │   │   ├── ResumeATS.jsx
│   │   │   ├── MockTests.jsx
│   │   │   └── Chat.jsx
│   │   └── services/             # API & Socket.IO client helpers
│   │       ├── api.js
│   │       ├── socket.js
│   │       ├── atsAnalyzer.js
│   │       ├── fileParser.js
│   │       └── placementContent.js
│   ├── .env.example
│   └── vite.config.js
│
├── server/                       # Express + MongoDB backend
│   ├── config/
│   │   ├── db.js                 # MongoDB connection
│   │   ├── socket.js             # Socket.IO setup & event handlers
│   │   ├── botData.js            # SPT Bot replies & keyword data
│   │   └── upload.js             # Multer file upload configuration
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── jobController.js
│   │   ├── chatController.js
│   │   ├── notificationController.js
│   │   └── resumeController.js
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT protection middleware
│   │   └── errorMiddleware.js    # Global error handler
│   ├── models/
│   │   ├── User.js
│   │   ├── Job.js
│   │   ├── Message.js
│   │   ├── Notification.js
│   │   └── Resume.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── jobRoutes.js
│   │   ├── chatRoutes.js
│   │   ├── notificationRoutes.js
│   │   └── resumeRoutes.js
│   ├── uploads/                  # Stored resume files (gitignored)
│   ├── .env.example
│   └── server.js                 # App entry point
│
└── README.md
```

---

## 🏃 How to Run Locally

### Prerequisites
- Node.js v18+
- MongoDB (local instance or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))

### 1. Clone the repository
```bash
git clone https://github.com/upamkuma/smart-placement-tracker.git
cd smart-placement-tracker
```

### 2. Set up the backend
```bash
cd server
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm run dev
```

The server starts at **http://localhost:5001**

### 3. Set up the frontend
```bash
cd client
npm install
cp .env.example .env
npm run dev
```

The client starts at **http://localhost:5173**

---

## ⚙️ Environment Variables

### `server/.env`
```env
MONGO_URI=mongodb://localhost:27017/placement-tracker
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
PORT=5001
NODE_ENV=development
```

### `client/.env`
```env
# Production API base URL (used in production builds)
VITE_PROD_API_URL=https://your-backend.onrender.com/api

# Production Socket.IO URL (used in production builds)
VITE_SOCKET_URL=https://your-backend.onrender.com
```

> **Note**: In development, the Vite dev server proxies `/api` requests to `localhost:5001` automatically. You only need the `VITE_PROD_*` variables for production deployments.

---

## 📡 API Endpoints

### Auth
| Method | Route | Description | Auth Required |
|--------|-------|-------------|:---:|
| POST | `/api/auth/register` | Register a new user | ❌ |
| POST | `/api/auth/login` | Login and receive JWT | ❌ |
| GET | `/api/auth/me` | Get current user profile | ✅ |

### Jobs
| Method | Route | Description | Auth Required |
|--------|-------|-------------|:---:|
| GET | `/api/jobs` | Get all jobs for logged-in user | ✅ |
| POST | `/api/jobs` | Create a new job application | ✅ |
| PUT | `/api/jobs/:id` | Update a job application | ✅ |
| DELETE | `/api/jobs/:id` | Delete a job application | ✅ |
| PATCH | `/api/jobs/:id/status` | Update job status (Kanban drag & drop) | ✅ |
| GET | `/api/jobs/interviews` | Get only interview-stage jobs | ✅ |

### Resume
| Method | Route | Description | Auth Required |
|--------|-------|-------------|:---:|
| POST | `/api/resume/upload` | Upload and store a resume file | ✅ |
| GET | `/api/resume` | Get current user's resume info | ✅ |
| GET | `/api/resume/download` | Download/view stored resume | ✅ |
| DELETE | `/api/resume` | Delete stored resume | ✅ |

### Notifications
| Method | Route | Description | Auth Required |
|--------|-------|-------------|:---:|
| GET | `/api/notifications` | Get all notifications | ✅ |
| PUT | `/api/notifications/read-all` | Mark all as read | ✅ |
| PUT | `/api/notifications/:id/read` | Mark one as read | ✅ |
| DELETE | `/api/notifications/:id` | Delete a notification | ✅ |

### Chat
| Method | Route | Description | Auth Required |
|--------|-------|-------------|:---:|
| GET | `/api/chat/rooms/list` | List available chat rooms | ✅ |
| GET | `/api/chat/:room` | Get messages for a room | ✅ |

### Health
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/health` | Server health check |

---

## 🚀 Deployment

| Service | Recommendation |
|---------|---------------|
| Frontend | [Vercel](https://vercel.com) or [Netlify](https://netlify.com) |
| Backend | [Render](https://render.com) or [Railway](https://railway.app) |
| Database | [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) |
| File Storage | Migrate `uploads/` to AWS S3 or Cloudinary for production |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request
