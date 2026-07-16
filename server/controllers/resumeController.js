const PDFParse = require("pdf-parse");
const mammoth = require("mammoth");
const path = require("path");
const fs = require("fs");
const Resume = require("../models/Resume");
const { upload, uploadsDir } = require("../config/upload");

// ─── File Parsing Helpers ────────────────────────────────────────────────────

/**
 * Extracts text from a PDF buffer using pdf-parse.
 * Throws if the file cannot be parsed (e.g. scanned image PDF).
 *
 * @param {Buffer} buffer
 * @returns {Promise<string>}
 */
const parsePDF = async (buffer) => {
  try {
    const result = await PDFParse(buffer);
    return result.text || "";
  } catch (error) {
    console.error("PDF parse error:", error);
    throw new Error("Failed to parse PDF file. Ensure it contains text (not scanned images).");
  }
};

/**
 * Extracts raw text from a DOCX/DOC buffer using mammoth.
 *
 * @param {Buffer} buffer
 * @returns {Promise<string>}
 */
const parseDOCX = async (buffer) => {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value || "";
  } catch (error) {
    console.error("DOCX parse error:", error);
    throw new Error("Failed to parse DOCX file.");
  }
};

/**
 * Normalises whitespace in extracted resume text.
 * Collapses multiple spaces/tabs, trims leading/trailing whitespace per line,
 * and limits consecutive blank lines to 3.
 *
 * @param {string} text
 * @returns {string}
 */
const cleanText = (text) =>
  text
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{4,}/g, "\n\n\n")
    .replace(/^ +/gm, "")
    .replace(/ +$/gm, "")
    .trim();

/**
 * Attempts to extract text from a file buffer based on its extension.
 * Returns an empty string if the extension is unrecognised.
 *
 * @param {Buffer} buffer
 * @param {string} ext - lowercase extension without dot (e.g. "pdf")
 * @returns {Promise<string>}
 */
const extractText = async (buffer, ext) => {
  switch (ext) {
    case "pdf":
      return parsePDF(buffer);
    case "docx":
    case "doc":
      return parseDOCX(buffer);
    case "txt":
      return buffer.toString("utf-8").trim();
    default:
      return "";
  }
};

// ─── Route Handlers ──────────────────────────────────────────────────────────

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

    // Extract text from the uploaded file
    let extractedText = "";
    try {
      extractedText = cleanText(await extractText(fileBuffer, ext));
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
      filePath,
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
      try { fs.unlinkSync(req.file.path); } catch (_) { /* ignore */ }
    }
    res.status(500).json({ message: error.message || "Failed to upload resume" });
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

    // Auto re-extract text if it was empty (e.g. from before a parser fix)
    if (
      (!resume.extractedText || resume.extractedText.trim().length < 10) &&
      fs.existsSync(resume.filePath)
    ) {
      try {
        const fileBuffer = fs.readFileSync(resume.filePath);
        const text = cleanText(await extractText(fileBuffer, resume.fileType));
        if (text && text.trim().length >= 10) {
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

    const contentTypes = {
      pdf: "application/pdf",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      doc: "application/msword",
      txt: "text/plain",
    };

    const contentType = contentTypes[resume.fileType] || "application/octet-stream";
    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Disposition", `inline; filename="${resume.originalName}"`);

    fs.createReadStream(resume.filePath).pipe(res);
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
    const extWithoutDot = ext.replace(".", "");

    if (!["pdf", "docx", "doc", "txt"].includes(extWithoutDot)) {
      return res.status(400).json({ message: "Unsupported file type" });
    }

    let extractedText = await extractText(fileBuffer, extWithoutDot);

    if (!extractedText || extractedText.trim().length < 10) {
      return res.status(400).json({
        message: "Could not extract text from this file. It may be image-based or empty.",
      });
    }

    extractedText = cleanText(extractedText);
    const wordCount = extractedText.split(/\s+/).filter(Boolean).length;

    // Clean up temp file
    try { fs.unlinkSync(req.file.path); } catch (_) { /* ignore */ }

    res.json({
      text: extractedText,
      wordCount,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      fileType: extWithoutDot.toUpperCase(),
    });
  } catch (error) {
    console.error("Resume parse error:", error);
    // Clean up temp file on error
    if (req.file?.path) {
      try { fs.unlinkSync(req.file.path); } catch (_) { /* ignore */ }
    }
    res.status(500).json({ message: error.message || "Failed to parse the uploaded file" });
  }
};

module.exports = { upload, uploadsDir, uploadResume, getResume, downloadResume, deleteResume, parseResume };
