const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  careerCopilot,
  atsAnalyzeV2,
  optimizeResume,
  generateCoverLetter,
  jobMatcher,
  learningRoadmap,
  githubAnalyzer,
  interviewEvaluate,
  generateInterviewQuestions,
} = require("../controllers/aiController");

// All AI routes require authentication
router.use(protect);

// Career Copilot
router.post("/copilot", careerCopilot);

// ATS Analyzer V2
router.post("/ats-analyze", atsAnalyzeV2);

// Resume Optimizer
router.post("/optimize-resume", optimizeResume);

// Cover Letter Generator
router.post("/cover-letter", generateCoverLetter);

// Job Matcher
router.post("/job-match", jobMatcher);

// Learning Roadmap
router.post("/roadmap", learningRoadmap);

// GitHub Analyzer
router.post("/github-analyze", githubAnalyzer);

// Interview Evaluator
router.post("/interview-evaluate", interviewEvaluate);

// Interview Question Generator
router.post("/interview-questions", generateInterviewQuestions);

module.exports = router;
