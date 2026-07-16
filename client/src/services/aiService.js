import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const aiAPI = {
  // Career Copilot
  chat: (message, history = [], jobDescription = "") =>
    axios.post(
      `${API_BASE}/ai/copilot`,
      { message, history, jobDescription },
      { headers: getAuthHeader() }
    ),

  // ATS Analyzer V2
  analyzeATS: (jobDescription, resumeText = "") =>
    axios.post(
      `${API_BASE}/ai/ats-analyze`,
      { jobDescription, resumeText },
      { headers: getAuthHeader() }
    ),

  // Resume Optimizer
  optimizeResume: (resumeText = "", targetRole = "Software Engineer") =>
    axios.post(
      `${API_BASE}/ai/optimize-resume`,
      { resumeText, targetRole },
      { headers: getAuthHeader() }
    ),

  // Cover Letter Generator
  generateCoverLetter: (jobDescription, companyName, roleName, resumeText = "") =>
    axios.post(
      `${API_BASE}/ai/cover-letter`,
      { jobDescription, companyName, roleName, resumeText },
      { headers: getAuthHeader() }
    ),

  // Job Matcher
  jobMatch: (resumeText = "") =>
    axios.post(
      `${API_BASE}/ai/job-match`,
      { resumeText },
      { headers: getAuthHeader() }
    ),

  // Learning Roadmap
  generateRoadmap: (goal, currentLevel = "Beginner", timeframe = "8 weeks") =>
    axios.post(
      `${API_BASE}/ai/roadmap`,
      { goal, currentLevel, timeframe },
      { headers: getAuthHeader() }
    ),

  // GitHub Analyzer
  analyzeGitHub: (githubUrl) =>
    axios.post(
      `${API_BASE}/ai/github-analyze`,
      { githubUrl },
      { headers: getAuthHeader() }
    ),

  // Interview Evaluator
  evaluateAnswer: (question, answer, domain = "Software Engineering") =>
    axios.post(
      `${API_BASE}/ai/interview-evaluate`,
      { question, answer, domain },
      { headers: getAuthHeader() }
    ),

  // Generate Interview Questions
  generateQuestions: (role, difficulty, domain, resumeText = "") =>
    axios.post(
      `${API_BASE}/ai/interview-questions`,
      { role, difficulty, domain, resumeText },
      { headers: getAuthHeader() }
    ),
};

export default aiAPI;
