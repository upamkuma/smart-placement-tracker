import axios from "axios";

// Production API base URL — set VITE_PROD_API_URL in client/.env for production deployments.
// In development the Vite proxy rewrites /api → http://localhost:5001/api automatically.
const PROD_API_URL =
  import.meta.env.VITE_PROD_API_URL ||
  "https://smart-placement-tracker-2.onrender.com/api";

// Create axios instance with the appropriate base URL
const api = axios.create({
  baseURL: import.meta.env.DEV ? "/api" : PROD_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor — attach JWT token to every outgoing request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle expired/invalid tokens globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear local storage and redirect to login
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (!window.location.pathname.endsWith("/login")) {
        window.location.href = `${import.meta.env.BASE_URL}login`;
      }
    }
    return Promise.reject(error);
  }
);

// ─── Job API ─────────────────────────────────────────────────────────────────

export const jobAPI = {
  /** Get all jobs for the logged-in user */
  getAll: () => api.get("/jobs"),

  /** Get only interview-stage jobs */
  getInterviews: () => api.get("/jobs/interviews"),

  /** Create a new job application */
  create: (jobData) => api.post("/jobs", jobData),

  /** Update a job application */
  update: (id, jobData) => api.put(`/jobs/${id}`, jobData),

  /** Delete a job application */
  delete: (id) => api.delete(`/jobs/${id}`),

  /** Update only the status (used for Kanban drag & drop) */
  updateStatus: (id, status) => api.patch(`/jobs/${id}/status`, { status }),
};

// ─── Notification API ─────────────────────────────────────────────────────────

export const notificationAPI = {
  /** Get all notifications for the current user */
  getAll: () => api.get("/notifications"),

  /** Mark a single notification as read */
  markAsRead: (id) => api.put(`/notifications/${id}/read`),

  /** Mark all notifications as read */
  markAllAsRead: () => api.put("/notifications/read-all"),

  /** Delete a notification */
  delete: (id) => api.delete(`/notifications/${id}`),
};

// ─── Resume API ───────────────────────────────────────────────────────────────

export const resumeAPI = {
  /** Upload a resume file (stored on the server) */
  upload: (file) => {
    const formData = new FormData();
    formData.append("resume", file);
    return api.post("/resume/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 30000,
    });
  },

  /** Get current user's resume metadata */
  getInfo: () => api.get("/resume"),

  /**
   * Returns the direct URL to download/view the stored resume.
   * Uses a query-param token because browser-initiated downloads
   * cannot set Authorization headers.
   */
  getDownloadUrl: () => {
    const token = localStorage.getItem("token");
    const baseURL = import.meta.env.DEV
      ? "http://localhost:5001/api"
      : PROD_API_URL;
    return `${baseURL}/resume/download?token=${token}`;
  },

  /** Delete the stored resume */
  delete: () => api.delete("/resume"),
};

export default api;
