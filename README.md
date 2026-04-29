# Smart Placement Tracker

A full-stack MERN application for students to track job applications with a beautiful Kanban board dashboard.

## 🚀 Features

- **Authentication**: Register, Login with JWT
- **Kanban Dashboard**: Drag & drop job cards between columns
- **Job CRUD**: Add, edit, delete applications
- **Search & Filter**: Find jobs by company/role, filter by status
- **Responsive Design**: Works on mobile and desktop
- **Toast Notifications**: Real-time feedback on actions

## 🛠️ Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Axios, React Router
- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Auth**: JWT, bcryptjs

## 📁 Project Structure

```
Smart Placement Tracker/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── context/        # Auth context
│   │   ├── pages/          # Login, Register, Dashboard
│   │   └── services/       # API service
│   └── ...
├── server/                 # Express backend
│   ├── config/             # Database config
│   ├── controllers/        # Auth & Job controllers
│   ├── middleware/          # Auth & Error middleware
│   ├── models/             # User & Job models
│   ├── routes/             # API routes
│   └── server.js           # Entry point
└── README.md
```

## 🏃 How to Run Locally

### Prerequisites
- Node.js (v18+)
- MongoDB (local or Atlas)

### 1. Clone & setup backend
```bash
cd server
npm install
```

### 2. Configure environment
Create `server/.env`:
```
MONGO_URI=mongodb://localhost:27017/placement-tracker
JWT_SECRET=your_secret_key_here
PORT=5000
```

Create `client/.env`:
```
VITE_API_URL=http://localhost:5000/api
```

### 3. Start backend
```bash
cd server
npm run dev
```

### 4. Setup & start frontend
```bash
cd client
npm install
npm run dev
```

### 5. Open browser
Navigate to `http://localhost:5173`

## 📡 API Endpoints

| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| POST | `/api/auth/register` | Register user | No |
| POST | `/api/auth/login` | Login user | No |
| GET | `/api/auth/me` | Get current user | Yes |
| GET | `/api/jobs` | Get all jobs | Yes |
| POST | `/api/jobs` | Create job | Yes |
| PUT | `/api/jobs/:id` | Update job | Yes |
| POST | `/api/jobs` | Create job application | Yes |
| PATCH | `/api/jobs/:id/status` | Update Kanban status | Yes |
| POST | `/api/resumes/upload` | Upload & parse PDF resume | Yes |
| GET | `/api/resumes/info` | Get saved resume stats | Yes |

## 🚀 Deployment Recommendations
- **Frontend** → Vercel or Netlify
- **Backend** → Render or Railway
- **Database** → MongoDB Atlas
- **Storage** → Migrate local `/uploads` to AWS S3 or Cloudinary before production deployment.
