const { GoogleGenerativeAI } = require("@google/generative-ai");
const Resume = require("../models/Resume");

// Initialise Gemini – use stable models
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const PRIMARY_MODEL = "gemini-flash-lite-latest";
const FALLBACK_MODEL = "gemini-flash-latest";

// ─── Helpers ────────────────────────────────────────────────────────────────────

/** Call Gemini with automatic retry and model fallback on rate-limit (429) or overload (503) */
const callGemini = async (prompt, retries = 2) => {
  const modelNames = [PRIMARY_MODEL, FALLBACK_MODEL];
  for (const modelName of modelNames) {
    const model = genAI.getGenerativeModel({ model: modelName });
    for (let i = 0; i <= retries; i++) {
      try {
        const result = await model.generateContent(prompt);
        return result.response.text();
      } catch (err) {
        const isTransient = err.message && (
          err.message.includes("429") || 
          err.message.includes("RESOURCE_EXHAUSTED") ||
          err.message.includes("503") ||
          err.message.includes("500")
        );
        
        if (i < retries && isTransient) {
          await new Promise((r) => setTimeout(r, 2000 * (i + 1)));
        } else if (isTransient && i === retries) {
          // Break inner loop to try fallback model
          break;
        } else {
          // Not a transient error, or we exhausted all options
          throw err;
        }
      }
    }
  }
  throw new Error("AI service temporarily unavailable due to high demand. Please try again in a moment.");
};



/**
 * Robustly extract JSON from a Gemini response.
 * Handles: raw JSON, ```json ... ```, ``` ... ```, stray text around JSON.
 */
const extractJSON = (raw) => {
  if (!raw) throw new Error("Empty response from AI");

  // Strip markdown code fences (```json ... ``` or ``` ... ```)
  let cleaned = raw
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();

  // Try direct parse first
  try {
    return JSON.parse(cleaned);
  } catch (_) {}

  // Try to find the first JSON object or array
  const objMatch = cleaned.match(/\{[\s\S]*\}/);
  if (objMatch) {
    try {
      return JSON.parse(objMatch[0]);
    } catch (_) {}
  }

  const arrMatch = cleaned.match(/\[[\s\S]*\]/);
  if (arrMatch) {
    try {
      return JSON.parse(arrMatch[0]);
    } catch (_) {}
  }

  throw new Error("Could not parse AI response as JSON");
};

/** Get resume text for a user from DB */
const getUserResume = async (userId) => {
  const resume = await Resume.findOne({ user: userId });
  return resume ? (resume.extractedText || "").trim() : "";
};

// ─── 1. AI Career Copilot ─────────────────────────────────────────────────────

// @desc    AI Career Copilot chat with memory and resume context
// @route   POST /api/ai/copilot
// @access  Private
const careerCopilot = async (req, res) => {
  try {
    const { message, history = [], jobDescription = "" } = req.body;
    if (!message) return res.status(400).json({ message: "Message is required" });

    const resumeText = await getUserResume(req.user._id);

    const systemContext = `You are an expert AI Career Copilot for students preparing for tech placements. 
You have access to the user's resume and can answer career, technical, and placement-related questions.
Be encouraging, specific, and actionable in your responses. Use bullet points for clarity.
Format important terms with **bold**. Keep responses focused and practical.

${resumeText ? `USER'S RESUME:\n${resumeText.substring(0, 3000)}\n` : ""}
${jobDescription ? `JOB DESCRIPTION CONTEXT:\n${jobDescription.substring(0, 1500)}\n` : ""}

You can help with:
- Resume improvements and feedback
- Missing skills identification  
- Interview question generation
- Career roadmap planning
- Company-specific preparation
- Technical concept explanations`;

    // Build conversation history for context
    const historyText = history
      .slice(-6)
      .map((h) => `${h.role === "user" ? "User" : "Copilot"}: ${h.content}`)
      .join("\n");

    const fullPrompt = `${systemContext}

${historyText ? `CONVERSATION HISTORY:\n${historyText}\n` : ""}
User: ${message}
Copilot:`;

    const response = await callGemini(fullPrompt);

    res.json({
      response,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Career Copilot error:", error);
    res.status(500).json({ message: "AI Copilot temporarily unavailable. Please try again." });
  }
};

// ─── 2. ATS Analyzer V2 (LLM-powered) ────────────────────────────────────────

// @desc    Semantic ATS analysis using Gemini
// @route   POST /api/ai/ats-analyze
// @access  Private
const atsAnalyzeV2 = async (req, res) => {
  try {
    const { jobDescription, resumeText: bodyResume } = req.body;

    const resumeText = bodyResume || (await getUserResume(req.user._id));

    if (!resumeText || resumeText.length < 50) {
      return res.status(400).json({ message: "Please upload your resume first." });
    }
    if (!jobDescription || jobDescription.length < 30) {
      return res.status(400).json({ message: "Please provide a job description." });
    }

    const prompt = `You are an expert ATS (Applicant Tracking System) and recruiter with 15 years of experience.
Analyze this resume against the job description and return a detailed JSON evaluation.

RESUME:
${resumeText.substring(0, 3000)}

JOB DESCRIPTION:
${jobDescription.substring(0, 2000)}

Return ONLY valid JSON (no markdown, no explanation) in this exact format:
{
  "overallScore": 85,
  "grades": {
    "technical": 90,
    "projects": 82,
    "communication": 78,
    "experience": 88,
    "education": 85,
    "keywords": 80
  },
  "matchedSkills": ["JavaScript", "React", "Node.js"],
  "missingSkills": ["Docker", "Redis", "AWS", "Kafka"],
  "strengths": ["Strong full-stack skills", "Relevant project experience", "Good educational background"],
  "improvements": ["Add Docker and Kubernetes experience", "Include quantifiable achievements", "Add AWS certifications"],
  "verdict": "Strong candidate with minor gaps. Focus on cloud technologies.",
  "hiringChance": "High"
}`;

    const raw = await callGemini(prompt);
    const analysis = extractJSON(raw);
    res.json({ success: true, analysis });
  } catch (error) {
    console.error("ATS V2 error:", error);
    res.status(500).json({ message: "ATS analysis failed. Please try again." });
  }
};

// ─── 3. Resume Optimizer ──────────────────────────────────────────────────────

// @desc    Rewrite resume bullet points using Gemini
// @route   POST /api/ai/optimize-resume
// @access  Private
const optimizeResume = async (req, res) => {
  try {
    const { resumeText: bodyResume, targetRole = "Software Engineer" } = req.body;

    const resumeText = bodyResume || (await getUserResume(req.user._id));

    if (!resumeText || resumeText.length < 50) {
      return res.status(400).json({ message: "Please upload your resume first." });
    }

    const prompt = `You are a professional resume writer and career coach specializing in tech roles.
Transform this resume's bullet points to be more impactful, quantifiable, and ATS-optimized for a ${targetRole} role.

Rules:
- Use strong action verbs (Developed, Architected, Led, Optimized, etc.)
- Add quantifiable metrics where reasonable (e.g., "reduced load time by 40%")
- Include specific technologies and methodologies
- Make each bullet point result-oriented
- Keep the original structure but enhance every bullet point

ORIGINAL RESUME:
${resumeText.substring(0, 3000)}

Return ONLY valid JSON (no markdown):
{
  "optimizedSections": [
    {
      "section": "Experience",
      "original": "Built CRUD app",
      "optimized": "Architected scalable MERN application with JWT authentication, MongoDB aggregation pipelines, and real-time Socket.IO notifications serving 500+ concurrent users"
    }
  ],
  "keyImprovements": ["Added quantifiable metrics", "Stronger action verbs", "Technology specifics added"],
  "overallScore": { "before": 45, "after": 88 },
  "summary": "Resume upgraded with 3 high-impact improvements"
}`;

    const raw = await callGemini(prompt);
    const result = extractJSON(raw);
    res.json({ success: true, result });
  } catch (error) {
    console.error("Resume optimizer error:", error);
    res.status(500).json({ message: "Resume optimization failed. Please try again." });
  }
};

// ─── 4. Cover Letter Generator ────────────────────────────────────────────────

// @desc    Generate cover letter from resume + JD
// @route   POST /api/ai/cover-letter
// @access  Private
const generateCoverLetter = async (req, res) => {
  try {
    const { jobDescription, companyName = "the company", roleName = "Software Engineer", resumeText: bodyResume } = req.body;

    if (!jobDescription) return res.status(400).json({ message: "Job description is required." });

    const resumeText = bodyResume || (await getUserResume(req.user._id));
    if (!resumeText || resumeText.length < 50) {
      return res.status(400).json({ message: "Please upload your resume first." });
    }

    const prompt = `You are a professional career counselor. Write a compelling, personalized cover letter.

CANDIDATE'S RESUME:
${resumeText.substring(0, 2500)}

JOB DESCRIPTION FOR ${roleName} at ${companyName}:
${jobDescription.substring(0, 1500)}

Write a professional cover letter that:
- Opens with a strong hook that mentions the specific role and company
- Highlights 2-3 most relevant experiences from the resume that match the JD
- Shows genuine enthusiasm for the company's mission
- Includes specific technical skills that match the JD
- Closes with a confident call to action
- Is 3-4 paragraphs, 250-350 words
- Has a professional but personable tone
- Does NOT use generic phrases like "I am writing to apply"

Format: Write the full letter starting with "Dear Hiring Manager," and ending with "Sincerely, [Your Name]"`;

    const coverLetter = await callGemini(prompt);
    res.json({ success: true, coverLetter });
  } catch (error) {
    console.error("Cover letter error:", error);
    res.status(500).json({ message: "Cover letter generation failed. Please try again." });
  }
};

// ─── 5. AI Job Matcher ────────────────────────────────────────────────────────

// @desc    Match resume skills against company profiles
// @route   POST /api/ai/job-match
// @access  Private
const jobMatcher = async (req, res) => {
  try {
    const { resumeText: bodyResume } = req.body;

    const resumeText = bodyResume || (await getUserResume(req.user._id));
    if (!resumeText || resumeText.length < 50) {
      return res.status(400).json({ message: "Please upload your resume first." });
    }

    const companies = [
      { name: "Google", focus: "algorithms, data structures, system design, Python, Go, distributed systems" },
      { name: "Microsoft", focus: "C#, Azure, .NET, cloud, TypeScript, DevOps, SQL" },
      { name: "Amazon", focus: "AWS, microservices, Java, leadership principles, distributed systems, Python" },
      { name: "Flipkart", focus: "Java, Spring Boot, React, MySQL, Kafka, Redis, microservices" },
      { name: "Razorpay", focus: "Node.js, React, Go, payment systems, APIs, MongoDB, PostgreSQL" },
      { name: "CRED", focus: "React Native, TypeScript, Node.js, fintech, PostgreSQL, Redis" },
      { name: "Meesho", focus: "Python, React, ML, data pipelines, FastAPI, PostgreSQL" },
      { name: "Swiggy", focus: "Go, microservices, Kubernetes, React, MongoDB, Kafka, location services" },
    ];

    const companyList = companies.map((c) => `${c.name}: ${c.focus}`).join("\n");

    const prompt = `You are a technical recruiter with expertise in matching candidates to companies.
Analyze this candidate's resume and calculate match percentages for each company.

CANDIDATE RESUME:
${resumeText.substring(0, 2500)}

COMPANY REQUIREMENTS:
${companyList}

Return ONLY valid JSON (no markdown):
{
  "extractedSkills": ["React", "Node.js", "MongoDB", "JavaScript"],
  "matches": [
    {
      "company": "Razorpay",
      "matchPercentage": 88,
      "matchedSkills": ["Node.js", "React", "MongoDB"],
      "missingSkills": ["Go", "PostgreSQL"],
      "recommendation": "Strong match! Brush up on Go basics and payment system concepts.",
      "difficulty": "Medium"
    }
  ]
}
Sort matches by matchPercentage descending. Include all 8 companies.`;

    const raw = await callGemini(prompt);
    const result = extractJSON(raw);
    res.json({ success: true, result });
  } catch (error) {
    console.error("Job matcher error:", error);
    res.status(500).json({ message: "Job matching failed. Please try again." });
  }
};

// ─── 6. Learning Roadmap Generator ───────────────────────────────────────────

// @desc    Generate personalized learning roadmap from goal
// @route   POST /api/ai/roadmap
// @access  Private
const learningRoadmap = async (req, res) => {
  try {
    const { goal, currentLevel = "Beginner", timeframe = "8 weeks" } = req.body;
    if (!goal) return res.status(400).json({ message: "Learning goal is required." });

    const resumeText = await getUserResume(req.user._id);

    const prompt = `You are a senior engineer and career mentor creating a personalized learning roadmap.

STUDENT'S GOAL: ${goal}
CURRENT LEVEL: ${currentLevel}
TIMEFRAME: ${timeframe}
${resumeText ? `STUDENT'S CURRENT SKILLS (from resume):\n${resumeText.substring(0, 1000)}` : ""}

Create a detailed, actionable week-by-week roadmap. Return ONLY valid JSON (no markdown):
{
  "title": "Amazon SDE Roadmap",
  "totalWeeks": 8,
  "overview": "Comprehensive roadmap to prepare for Amazon SDE role",
  "weeks": [
    {
      "week": 1,
      "theme": "Arrays & Strings",
      "icon": "📊",
      "topics": ["Two Pointers", "Sliding Window", "Binary Search"],
      "resources": ["LeetCode Easy Arrays", "NeetCode Array playlist"],
      "tasks": ["Solve 15 LeetCode easy problems", "Review time complexity"],
      "milestone": "Complete 15 array problems",
      "difficulty": "Beginner"
    }
  ],
  "keyMilestones": ["Week 2: Complete DSA basics", "Week 5: Start system design"],
  "resources": [
    { "name": "NeetCode.io", "type": "DSA Practice", "url": "https://neetcode.io" },
    { "name": "System Design Primer", "type": "System Design", "url": "https://github.com/donnemartin/system-design-primer" }
  ],
  "tips": ["Code every day, even 30 minutes", "Understand patterns not solutions"]
}`;

    const raw = await callGemini(prompt);
    const roadmap = extractJSON(raw);
    res.json({ success: true, roadmap });
  } catch (error) {
    console.error("Roadmap error:", error);
    res.status(500).json({ message: "Roadmap generation failed. Please try again." });
  }
};

// ─── 7. GitHub Analyzer ───────────────────────────────────────────────────────

// @desc    Analyze GitHub profile URL using Gemini
// @route   POST /api/ai/github-analyze
// @access  Private
const githubAnalyzer = async (req, res) => {
  try {
    const { githubUrl, githubUsername } = req.body;

    if (!githubUrl && !githubUsername) {
      return res.status(400).json({ message: "GitHub URL or username is required." });
    }

    // Robustly extract username from URL or use provided username
    let username = githubUsername || "";
    if (!username && githubUrl) {
      // Handle: https://github.com/user, github.com/user, or just 'user'
      username = githubUrl
        .replace(/https?:\/\//gi, "")
        .replace(/^www\./i, "")
        .replace(/^github\.com\/?/i, "")
        .split("/")[0]
        .split("?")[0]
        .trim();
    }

    if (!username || username.length < 1) {
      return res.status(400).json({ message: "Could not extract a valid GitHub username." });
    }

    // Fetch GitHub profile data (best-effort, failures are handled gracefully)
    let profileData = {};
    let reposData = [];

    try {
      const headers = { "User-Agent": "SmartPlacementTracker/1.0" };
      const profileRes = await fetch(`https://api.github.com/users/${username}`, { headers });
      if (profileRes.ok) {
        profileData = await profileRes.json();
      } else {
        console.warn(`GitHub API returned ${profileRes.status} for user: ${username}`);
      }

      const reposRes = await fetch(
        `https://api.github.com/users/${username}/repos?sort=updated&per_page=10`,
        { headers }
      );
      if (reposRes.ok) reposData = await reposRes.json();
    } catch (fetchError) {
      console.warn("GitHub API fetch failed:", fetchError.message);
    }

    const reposSummary = Array.isArray(reposData) && reposData.length > 0
      ? reposData
          .slice(0, 8)
          .map((r) => `- ${r.name}: ${r.description || "No description"} (${r.language || "Unknown"}, ⭐${r.stargazers_count})`)
          .join("\n")
      : "Repository data unavailable (analyze based on profile only)";

    const prompt = `You are a senior tech lead analyzing a developer's GitHub profile for hiring purposes.
Even if some data is unavailable, provide your best professional assessment.

GITHUB PROFILE:
Username: ${username}
Name: ${profileData.name || "Not available"}
Bio: ${profileData.bio || "Not provided"}
Public Repos: ${profileData.public_repos || "Unknown"}
Followers: ${profileData.followers || 0}
Following: ${profileData.following || 0}

TOP REPOSITORIES:
${reposSummary}

Return ONLY valid JSON (no markdown, no explanation text):
{
  "scores": {
    "codeQuality": 8.5,
    "documentation": 7.0,
    "architecture": 8.0,
    "diversity": 7.5,
    "activity": 9.0,
    "overall": 8.0
  },
  "strengths": ["Active contributor", "Diverse tech stack"],
  "improvements": ["Add README files to all repos", "Include live demo links"],
  "techStack": ["JavaScript", "React", "Node.js"],
  "projectHighlights": ["Strong full-stack project portfolio"],
  "recruiterSummary": "Good candidate with active presence.",
  "hiringSuggestion": "Recommend for review"
}`;

    const raw = await callGemini(prompt);
    const analysis = extractJSON(raw);
    res.json({
      success: true,
      analysis,
      profile: {
        username,
        name: profileData.name || username,
        avatar: profileData.avatar_url || null,
        bio: profileData.bio || null,
        repos: profileData.public_repos || 0,
        followers: profileData.followers || 0,
      },
    });
  } catch (error) {
    console.error("GitHub analyzer error:", error.message);
    res.status(500).json({ message: "GitHub analysis failed. Please try again." });
  }
};

// ─── 8. AI Interview Evaluator ────────────────────────────────────────────────

// @desc    Evaluate interview answer using Gemini
// @route   POST /api/ai/interview-evaluate
// @access  Private
const interviewEvaluate = async (req, res) => {
  try {
    const { question, answer, domain = "Software Engineering" } = req.body;

    if (!question || !answer) {
      return res.status(400).json({ message: "Question and answer are required." });
    }

    const prompt = `You are a senior hiring manager at a top tech company evaluating a ${domain} interview answer.

INTERVIEW QUESTION: ${question}

CANDIDATE'S ANSWER: ${answer}

Evaluate the answer and return ONLY valid JSON (no markdown):
{
  "scores": {
    "technical": 8.5,
    "communication": 7.5,
    "confidence": 8.0,
    "structure": 7.0,
    "overall": 8.0
  },
  "feedback": "Good technical foundation shown. The candidate clearly understands the concept but could improve on explaining the trade-offs.",
  "strengths": ["Clear explanation of core concept", "Good use of examples", "Confident delivery"],
  "improvements": ["Structure answer using STAR method", "Mention edge cases", "Quantify impact where possible"],
  "betterAnswer": "Here's how to strengthen this answer: Start with a brief definition, then walk through your specific experience using the STAR method...",
  "followUpQuestions": ["Can you explain the trade-offs?", "How would you handle edge cases?", "What would you do differently?"],
  "verdict": "Good answer with room for improvement"
}`;

    const raw = await callGemini(prompt);
    const evaluation = extractJSON(raw);
    res.json({ success: true, evaluation });
  } catch (error) {
    console.error("Interview evaluate error:", error);
    res.status(500).json({ message: "Interview evaluation failed. Please try again." });
  }
};

// ─── 9. Suggest Interview Questions ──────────────────────────────────────────

// @desc    Generate interview questions based on resume + role
// @route   POST /api/ai/interview-questions
// @access  Private
const generateInterviewQuestions = async (req, res) => {
  try {
    const { role = "Software Engineer", difficulty = "Medium", domain = "Full Stack", resumeText: bodyResume } = req.body;

    const resumeText = bodyResume || (await getUserResume(req.user._id));

    const prompt = `You are an interviewer preparing for a ${role} interview. 
Generate 10 targeted interview questions based on the candidate's background.
${resumeText ? `\nCANDIDATE RESUME:\n${resumeText.substring(0, 2000)}` : ""}
Role: ${role}, Difficulty: ${difficulty}, Domain: ${domain}

Return ONLY valid JSON (no markdown):
{
  "questions": [
    {
      "id": 1,
      "question": "Explain how React's virtual DOM works and why it's beneficial.",
      "category": "Technical",
      "difficulty": "Medium",
      "expectedDuration": "2-3 minutes",
      "hint": "Focus on reconciliation and diffing algorithm"
    }
  ]
}`;

    const raw = await callGemini(prompt);
    const result = extractJSON(raw);
    res.json({ success: true, result });
  } catch (error) {
    console.error("Interview questions error:", error);
    res.status(500).json({ message: "Question generation failed. Please try again." });
  }
};

module.exports = {
  careerCopilot,
  atsAnalyzeV2,
  optimizeResume,
  generateCoverLetter,
  jobMatcher,
  learningRoadmap,
  githubAnalyzer,
  interviewEvaluate,
  generateInterviewQuestions,
};
