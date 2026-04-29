const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  upload,
  uploadResume,
  getResume,
  downloadResume,
  deleteResume,
  parseResume,
} = require("../controllers/resumeController");

// POST /api/resume/upload - Upload full resume file (stores on server)
router.post("/upload", protect, upload.single("resume"), uploadResume);

// GET /api/resume - Get current user's resume info
router.get("/", protect, getResume);

// GET /api/resume/download - Download/view resume file
router.get("/download", protect, downloadResume);

// DELETE /api/resume - Delete resume
router.delete("/", protect, deleteResume);

// POST /api/resume/parse - Upload and parse resume text only (legacy)
router.post("/parse", protect, upload.single("resume"), parseResume);

module.exports = router;
