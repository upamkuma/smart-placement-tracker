const multer = require("multer");
const { PDFParse } = require("pdf-parse");
const mammoth = require("mammoth");
const path = require("path");
const fs = require("fs");
const Resume = require("../models/Resume");

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "..", "uploads", "resumes");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads - save to disk
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Create unique filename: userId_timestamp_originalname
    const uniqueName = `${req.user._id}_${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [".pdf", ".docx", ".doc", ".txt"];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${ext}. Allowed: PDF, DOCX, TXT`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// @desc    Upload resume file (stores the full file + extracts text)
// @route   POST /api/resume/upload
// @access  Private
const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const ext = path.extname(req.file.originalname).toLowerCase().replace(".", "");
    const filePath = req.file.path;
    const fileBuffer = fs.readFileSync(filePath);

    // Extract text from the file
    let extractedText = "";
    try {
      switch ("." + ext) {
        case ".pdf":
          extractedText = await parsePDF(fileBuffer);
          break;
        case ".docx":
        case ".doc":
          extractedText = await parseDOCX(fileBuffer);
          break;
        case ".txt":
          extractedText = fileBuffer.toString("utf-8").trim();
          break;
      }
      extractedText = cleanText(extractedText);
    } catch (parseError) {
      console.warn("Text extraction failed:", parseError.message);
      // Don't fail the upload if text extraction fails
    }

    const wordCount = extractedText
      ? extractedText.split(/\s+/).filter(Boolean).length
      : 0;

    // Delete any existing resume for this user
    const existingResume = await Resume.findOne({ user: req.user._id });
    if (existingResume) {
      // Delete old file from disk
      try {
        if (fs.existsSync(existingResume.filePath)) {
          fs.unlinkSync(existingResume.filePath);
        }
      } catch (e) {
        console.warn("Could not delete old file:", e.message);
      }
      await Resume.deleteOne({ _id: existingResume._id });
    }

    // Save new resume record
    const resume = await Resume.create({
      user: req.user._id,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      fileType: ext,
      fileSize: req.file.size,
      filePath: filePath,
      extractedText,
      wordCount,
    });

    res.status(201).json({
      _id: resume._id,
      fileName: resume.fileName,
      originalName: resume.originalName,
      fileType: resume.fileType,
      fileSize: resume.fileSize,
      wordCount: resume.wordCount,
      extractedText: resume.extractedText,
      createdAt: resume.createdAt,
    });
  } catch (error) {
    console.error("Resume upload error:", error);
    // Clean up uploaded file on error
    if (req.file?.path) {
      try { fs.unlinkSync(req.file.path); } catch (e) { /* ignore */ }
    }
    res.status(500).json({
      message: error.message || "Failed to upload resume",
    });
  }
};

// @desc    Get current user's resume info
// @route   GET /api/resume
// @access  Private
const getResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ user: req.user._id });
    if (!resume) {
      return res.status(404).json({ message: "No resume uploaded yet" });
    }

    // Auto re-extract text if it was empty (e.g. from before parser fix)
    if ((!resume.extractedText || resume.extractedText.trim().length < 10) && fs.existsSync(resume.filePath)) {
      try {
        const fileBuffer = fs.readFileSync(resume.filePath);
        let text = "";
        switch (resume.fileType) {
          case "pdf": text = await parsePDF(fileBuffer); break;
          case "docx": case "doc": text = await parseDOCX(fileBuffer); break;
          case "txt": text = fileBuffer.toString("utf-8").trim(); break;
        }
        if (text && text.trim().length >= 10) {
          text = cleanText(text);
          resume.extractedText = text;
          resume.wordCount = text.split(/\s+/).filter(Boolean).length;
          await resume.save();
        }
      } catch (e) {
        console.warn("Auto re-extraction failed:", e.message);
      }
    }

    res.json({
      _id: resume._id,
      fileName: resume.fileName,
      originalName: resume.originalName,
      fileType: resume.fileType,
      fileSize: resume.fileSize,
      wordCount: resume.wordCount,
      extractedText: resume.extractedText,
      createdAt: resume.createdAt,
    });
  } catch (error) {
    console.error("Get resume error:", error);
    res.status(500).json({ message: "Failed to get resume" });
  }
};

// @desc    Download/view resume file
// @route   GET /api/resume/download
// @access  Private
const downloadResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ user: req.user._id });
    if (!resume) {
      return res.status(404).json({ message: "No resume found" });
    }

    if (!fs.existsSync(resume.filePath)) {
      return res.status(404).json({ message: "Resume file not found on server" });
    }

    // Set content type based on file type
    const contentTypes = {
      pdf: "application/pdf",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      doc: "application/msword",
      txt: "text/plain",
    };

    const contentType = contentTypes[resume.fileType] || "application/octet-stream";

    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Disposition", `inline; filename="${resume.originalName}"`);

    const fileStream = fs.createReadStream(resume.filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error("Download resume error:", error);
    res.status(500).json({ message: "Failed to download resume" });
  }
};

// @desc    Delete resume
// @route   DELETE /api/resume
// @access  Private
const deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ user: req.user._id });
    if (!resume) {
      return res.status(404).json({ message: "No resume found" });
    }

    // Delete file from disk
    try {
      if (fs.existsSync(resume.filePath)) {
        fs.unlinkSync(resume.filePath);
      }
    } catch (e) {
      console.warn("Could not delete file:", e.message);
    }

    await Resume.deleteOne({ _id: resume._id });
    res.json({ message: "Resume deleted successfully" });
  } catch (error) {
    console.error("Delete resume error:", error);
    res.status(500).json({ message: "Failed to delete resume" });
  }
};

// @desc    Parse resume text only (legacy endpoint)
// @route   POST /api/resume/parse
// @access  Private
const parseResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const ext = path.extname(req.file.originalname).toLowerCase();
    const fileBuffer = fs.readFileSync(req.file.path);
    let extractedText = "";

    switch (ext) {
      case ".pdf":
        extractedText = await parsePDF(fileBuffer);
        break;
      case ".docx":
      case ".doc":
        extractedText = await parseDOCX(fileBuffer);
        break;
      case ".txt":
        extractedText = fileBuffer.toString("utf-8").trim();
        break;
      default:
        return res.status(400).json({ message: "Unsupported file type" });
    }

    if (!extractedText || extractedText.trim().length < 10) {
      return res.status(400).json({
        message: "Could not extract text from this file. It may be image-based or empty.",
      });
    }

    extractedText = cleanText(extractedText);
    const wordCount = extractedText.split(/\s+/).filter(Boolean).length;

    // Clean up temp file
    try { fs.unlinkSync(req.file.path); } catch (e) { /* ignore */ }

    res.json({
      text: extractedText,
      wordCount,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      fileType: ext.replace(".", "").toUpperCase(),
    });
  } catch (error) {
    console.error("Resume parse error:", error);
    // Clean up temp file
    if (req.file?.path) {
      try { fs.unlinkSync(req.file.path); } catch (e) { /* ignore */ }
    }
    res.status(500).json({
      message: error.message || "Failed to parse the uploaded file",
    });
  }
};

// Parse PDF using pdf-parse v2
const parsePDF = async (buffer) => {
  try {
    const parser = new PDFParse({ data: new Uint8Array(buffer) });
    const result = await parser.getText();
    return result.text || "";
  } catch (error) {
    console.error("PDF parse error:", error);
    throw new Error("Failed to parse PDF file. Ensure it contains text (not scanned images).");
  }
};

// Parse DOCX using mammoth
const parseDOCX = async (buffer) => {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value || "";
  } catch (error) {
    console.error("DOCX parse error:", error);
    throw new Error("Failed to parse DOCX file.");
  }
};

// Clean extracted text
const cleanText = (text) => {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{4,}/g, "\n\n\n")
    .replace(/^ +/gm, "")
    .replace(/ +$/gm, "")
    .trim();
};

module.exports = { upload, uploadResume, getResume, downloadResume, deleteResume, parseResume };
