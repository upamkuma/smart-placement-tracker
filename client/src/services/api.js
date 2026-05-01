import axios from "axios";

// Create axios instance with base URL from env
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5001/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - attach token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle auth errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear storage
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Redirect to login if not already there
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// ===== Job API functions =====

export const jobAPI = {
  // Get all jobs for the logged-in user
  getAll: () => api.get("/jobs"),

  // Get only interview jobs
  getInterviews: () => api.get("/jobs/interviews"),

  // Create a new job
  create: (jobData) => api.post("/jobs", jobData),

  // Update a job
  update: (id, jobData) => api.put(`/jobs/${id}`, jobData),

  // Delete a job
  delete: (id) => api.delete(`/jobs/${id}`),

  // Update only the status (for drag & drop)
  updateStatus: (id, status) => api.patch(`/jobs/${id}/status`, { status }),
};

// ===== Notification API functions =====

export const notificationAPI = {
  // Get all notifications
  getAll: () => api.get("/notifications"),

  // Mark one as read
  markAsRead: (id) => api.put(`/notifications/${id}/read`),

  // Mark all as read
  markAllAsRead: () => api.put("/notifications/read-all"),

  // Delete a notification
  delete: (id) => api.delete(`/notifications/${id}`),
};

// ===== Resume API functions =====

export const resumeAPI = {
  // Upload a resume file (stores full file on server)
  upload: (file) => {
    const formData = new FormData();
    formData.append("resume", file);
    return api.post("/resume/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 30000,
    });
  },

  // Get current user's resume info
  getInfo: () => api.get("/resume"),

  // Get the download/view URL for the resume
  getDownloadUrl: () => {
    const token = localStorage.getItem("token");
    const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
    return `${baseURL}/resume/download?token=${token}`;
  },

  // Delete resume
  delete: () => api.delete("/resume"),
};

export default api;
