/**
 * upload.js
 *
 * Multer configuration for resume file uploads.
 * Files are saved to server/uploads/resumes/ with a unique name.
 * Accepted types: PDF, DOCX, DOC, TXT (max 10 MB).
 */

const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure the uploads directory exists on startup
const uploadsDir = path.join(__dirname, "..", "uploads", "resumes");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

/** Allowed resume file extensions */
const ALLOWED_EXTENSIONS = [".pdf", ".docx", ".doc", ".txt"];

/** Maximum file size: 10 MB */
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Save uploaded files to disk with a unique name: userId_timestamp.ext
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${req.user._id}_${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// Reject files with unsupported extensions before they reach the controller
const fileFilter = (_req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ALLOWED_EXTENSIONS.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${ext}. Allowed: PDF, DOCX, TXT`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});

module.exports = { upload, uploadsDir };
