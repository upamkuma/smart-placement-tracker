// Resume File Parser - Client-side parsing with server fallback
// Supports: PDF, DOCX, DOC, TXT
import api from "./api";

/**
 * Parse a resume file entirely on the client side
 * Falls back to server-side parsing if client parsing fails
 */
export const parseResumeFile = async (file) => {
  const ext = "." + file.name.split(".").pop().toLowerCase();

  try {
    // Try client-side parsing first (works without server)
    let text = "";

    switch (ext) {
      case ".pdf":
        text = await parsePDFClient(file);
        break;
      case ".docx":
      case ".doc":
        text = await parseDOCXClient(file);
        break;
      case ".txt":
        text = await parseTXTClient(file);
        break;
      default:
        throw new Error(`Unsupported file type: ${ext}`);
    }

    if (text && text.trim().length >= 10) {
      return cleanText(text);
    }

    // If client-side extraction returned too little text, try server
    throw new Error("Client parsing returned insufficient text");
  } catch (clientError) {
    console.warn("Client-side parsing failed, trying server:", clientError.message);

    // Fallback: try server-side parsing
    try {
      return await parseResumeServer(file);
    } catch (serverError) {
      // If both fail, throw a helpful error
      throw new Error(
        ext === ".pdf"
          ? "Could not extract text from this PDF. It may be image-based (scanned). Please copy-paste the text manually."
          : `Failed to parse ${ext.toUpperCase()} file. Please try pasting the text manually.`
      );
    }
  }
};

/**
 * Parse PDF using pdfjs-dist (client-side)
 */
const parsePDFClient = async (file) => {
  // Dynamic import to avoid issues with SSR/initial load
  const pdfjsLib = await import("pdfjs-dist/build/pdf.mjs");

  // Set the worker source
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.mjs",
    import.meta.url
  ).toString();

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const textParts = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => item.str)
      .join(" ");
    textParts.push(pageText);
  }

  return textParts.join("\n\n");
};

/**
 * Parse DOCX using mammoth (client-side)
 */
const parseDOCXClient = async (file) => {
  const mammoth = await import("mammoth/mammoth.browser.js");
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value || "";
};

/**
 * Parse TXT file (client-side)
 */
const parseTXTClient = async (file) => {
  return await file.text();
};

/**
 * Server-side parsing fallback
 */
const parseResumeServer = async (file) => {
  const formData = new FormData();
  formData.append("resume", file);

  const response = await api.post("/resume/parse", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    timeout: 30000,
  });

  return response.data.text;
};

/**
 * Clean extracted text
 */
const cleanText = (text) => {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{4,}/g, "\n\n\n")
    .replace(/^ +/gm, "")
    .replace(/ +$/gm, "")
    .trim();
};

/**
 * Validate file before uploading
 */
export const validateFile = (file) => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedExtensions = [".pdf", ".docx", ".doc", ".txt"];

  if (!file) {
    return { valid: false, error: "No file selected" };
  }

  if (file.size > maxSize) {
    return { valid: false, error: "File size must be less than 10MB" };
  }

  if (file.size === 0) {
    return { valid: false, error: "The file appears to be empty" };
  }

  const ext = "." + file.name.split(".").pop().toLowerCase();
  if (!allowedExtensions.includes(ext)) {
    return {
      valid: false,
      error: `Unsupported file type "${ext}". Allowed: PDF, DOCX, TXT`,
    };
  }

  return { valid: true };
};

/**
 * Get a human-readable file size
 */
export const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
};
