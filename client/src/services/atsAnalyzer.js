// ===== ATS Resume Analyzer Engine =====
// Analyzes a resume against a job description using keyword matching,
// skill extraction, and provides actionable improvement suggestions.

// Common technical skills to look for
const TECH_SKILLS = [
  "javascript", "typescript", "python", "java", "c\\+\\+", "c#", "ruby", "go", "golang", "rust", "swift", "kotlin",
  "react", "angular", "vue", "next\\.js", "node\\.js", "express", "django", "flask", "spring", "laravel",
  "html", "css", "sass", "tailwind", "bootstrap", "jquery",
  "mongodb", "postgresql", "mysql", "redis", "firebase", "dynamodb", "sql", "nosql", "graphql",
  "aws", "azure", "gcp", "docker", "kubernetes", "jenkins", "ci/cd", "terraform", "ansible",
  "git", "github", "gitlab", "bitbucket", "jira", "agile", "scrum",
  "rest api", "restful", "microservices", "serverless", "api",
  "machine learning", "deep learning", "nlp", "ai", "artificial intelligence", "data science",
  "tensorflow", "pytorch", "pandas", "numpy", "scikit-learn",
  "figma", "sketch", "adobe", "photoshop",
  "linux", "unix", "bash", "powershell",
  "testing", "jest", "mocha", "selenium", "cypress", "unit testing",
  "oauth", "jwt", "authentication", "security",
  "webpack", "vite", "rollup", "babel",
  "responsive design", "mobile", "ios", "android", "react native", "flutter",
  "blockchain", "web3", "solidity",
  "data structures", "algorithms", "oop", "design patterns",
  "excel", "power bi", "tableau", "analytics",
];

// Common soft skills
const SOFT_SKILLS = [
  "communication", "leadership", "teamwork", "collaboration", "problem solving",
  "problem-solving", "analytical", "critical thinking", "creative", "innovative",
  "detail-oriented", "organized", "self-motivated", "adaptable", "flexible",
  "presentation", "mentoring", "management", "strategic", "decision making",
  "time management", "multitasking", "customer service", "negotiation",
  "project management", "stakeholder", "cross-functional",
];

// Common action verbs that ATS systems look for
const ACTION_VERBS = [
  "achieved", "built", "created", "delivered", "developed", "designed",
  "engineered", "established", "executed", "generated", "implemented",
  "improved", "increased", "launched", "led", "managed", "optimized",
  "reduced", "resolved", "spearheaded", "streamlined", "transformed",
];

// Education-related keywords
const EDUCATION_KEYWORDS = [
  "bachelor", "master", "phd", "degree", "b\\.tech", "b\\.e", "m\\.tech", "m\\.e",
  "mba", "bca", "mca", "b\\.sc", "m\\.sc", "diploma", "certification",
  "certified", "university", "college", "gpa", "cgpa",
];

// Extract keywords from text
const extractKeywords = (text) => {
  const lower = text.toLowerCase();
  const words = lower.split(/[\s,;.!?()[\]{}\-_/|\\:"']+/).filter((w) => w.length > 2);
  
  // Also extract multi-word phrases (bigrams)
  const phrases = [];
  const wordArray = lower.split(/\s+/);
  for (let i = 0; i < wordArray.length - 1; i++) {
    phrases.push(`${wordArray[i]} ${wordArray[i + 1]}`);
  }
  for (let i = 0; i < wordArray.length - 2; i++) {
    phrases.push(`${wordArray[i]} ${wordArray[i + 1]} ${wordArray[i + 2]}`);
  }

  return { words, phrases, fullText: lower };
};

// Check if a skill/keyword is found in text
const findInText = (text, keyword) => {
  try {
    const regex = new RegExp(`\\b${keyword}\\b`, "gi");
    return regex.test(text);
  } catch {
    return text.toLowerCase().includes(keyword.toLowerCase());
  }
};

// Main analysis function
export const analyzeResume = (resumeText, jobDescriptionText) => {
  if (!resumeText.trim() || !jobDescriptionText.trim()) {
    return null;
  }

  const resume = extractKeywords(resumeText);
  const jd = extractKeywords(jobDescriptionText);

  // ===== 1. Extract JD Keywords =====
  
  // Find tech skills mentioned in JD
  const jdTechSkills = TECH_SKILLS.filter((skill) => findInText(jd.fullText, skill));
  
  // Find soft skills mentioned in JD
  const jdSoftSkills = SOFT_SKILLS.filter((skill) => findInText(jd.fullText, skill));
  
  // Find education requirements in JD
  const jdEducation = EDUCATION_KEYWORDS.filter((kw) => findInText(jd.fullText, kw));

  // Extract important words from JD (excluding common stopwords)
  const stopwords = new Set([
    "the", "and", "for", "are", "but", "not", "you", "all", "can", "her", "was", "one",
    "our", "out", "are", "has", "have", "had", "been", "will", "with", "this", "that",
    "from", "they", "been", "said", "each", "which", "their", "about", "would", "make",
    "like", "him", "into", "time", "very", "when", "come", "could", "more", "than",
    "other", "its", "also", "back", "after", "work", "first", "well", "way", "even",
    "new", "want", "because", "any", "these", "give", "day", "most", "find", "here",
    "thing", "many", "then", "should", "must", "may", "such", "being", "what",
    "who", "how", "where", "why", "does", "did", "doing", "able", "need", "role",
    "job", "position", "company", "team", "responsibilities", "requirements",
    "experience", "years", "year", "looking", "join", "opportunity", "ideal",
    "candidate", "including", "strong", "working", "knowledge", "understanding",
    "preferred", "required", "minimum", "plus", "etc", "ability",
  ]);

  const jdImportantWords = jd.words
    .filter((w) => !stopwords.has(w) && w.length > 3)
    .reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {});

  // Get top JD keywords by frequency
  const topJdKeywords = Object.entries(jdImportantWords)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30)
    .map(([word]) => word);

  // ===== 2. Match Against Resume =====

  // Tech skills match
  const matchedTechSkills = jdTechSkills.filter((skill) => findInText(resume.fullText, skill));
  const missingTechSkills = jdTechSkills.filter((skill) => !findInText(resume.fullText, skill));

  // Soft skills match
  const matchedSoftSkills = jdSoftSkills.filter((skill) => findInText(resume.fullText, skill));
  const missingSoftSkills = jdSoftSkills.filter((skill) => !findInText(resume.fullText, skill));

  // Education match
  const matchedEducation = jdEducation.filter((kw) => findInText(resume.fullText, kw));
  const missingEducation = jdEducation.filter((kw) => !findInText(resume.fullText, kw));

  // General keyword match
  const matchedKeywords = topJdKeywords.filter((kw) => findInText(resume.fullText, kw));
  const missingKeywords = topJdKeywords.filter((kw) => !findInText(resume.fullText, kw));

  // Action verbs in resume
  const usedActionVerbs = ACTION_VERBS.filter((verb) => findInText(resume.fullText, verb));

  // ===== 3. Calculate Score =====
  
  const techScore = jdTechSkills.length > 0
    ? (matchedTechSkills.length / jdTechSkills.length) * 100 : 100;

  const softScore = jdSoftSkills.length > 0
    ? (matchedSoftSkills.length / jdSoftSkills.length) * 100 : 100;

  const keywordScore = topJdKeywords.length > 0
    ? (matchedKeywords.length / topJdKeywords.length) * 100 : 100;

  const educationScore = jdEducation.length > 0
    ? (matchedEducation.length / jdEducation.length) * 100 : 100;

  const actionVerbBonus = Math.min(usedActionVerbs.length * 2, 10);

  // Weighted overall score
  const overallScore = Math.round(
    techScore * 0.35 +      // Tech skills: 35%
    keywordScore * 0.30 +   // General keywords: 30%
    softScore * 0.15 +      // Soft skills: 15%
    educationScore * 0.10 + // Education: 10%
    actionVerbBonus          // Action verbs bonus: up to 10%
  );

  // ===== 4. Generate Suggestions =====

  const suggestions = [];

  // Missing tech skills
  if (missingTechSkills.length > 0) {
    suggestions.push({
      type: "critical",
      category: "Technical Skills",
      title: "Add missing technical skills",
      description: `The job description mentions these technical skills that are missing from your resume. Add them if you have experience with them.`,
      keywords: missingTechSkills,
    });
  }

  // Missing soft skills
  if (missingSoftSkills.length > 0) {
    suggestions.push({
      type: "important",
      category: "Soft Skills",
      title: "Include these soft skills",
      description: `These soft skills are mentioned in the job description. Incorporate them naturally into your experience descriptions.`,
      keywords: missingSoftSkills,
    });
  }

  // Missing keywords
  if (missingKeywords.length > 0) {
    suggestions.push({
      type: "moderate",
      category: "Keywords",
      title: "Add relevant keywords",
      description: `These keywords from the job description should appear in your resume for better ATS matching.`,
      keywords: missingKeywords.slice(0, 15),
    });
  }

  // Missing education
  if (missingEducation.length > 0) {
    suggestions.push({
      type: "important",
      category: "Education",
      title: "Include education details",
      description: `The JD mentions these education-related terms. Make sure your education section covers them.`,
      keywords: missingEducation,
    });
  }

  // Action verbs suggestion
  if (usedActionVerbs.length < 5) {
    suggestions.push({
      type: "moderate",
      category: "Impact",
      title: "Use more action verbs",
      description: `Strong resumes use action verbs to describe achievements. Consider using verbs like:`,
      keywords: ACTION_VERBS.filter((v) => !usedActionVerbs.includes(v)).slice(0, 10),
    });
  }

  // Resume length check
  const wordCount = resumeText.split(/\s+/).length;
  if (wordCount < 200) {
    suggestions.push({
      type: "critical",
      category: "Length",
      title: "Resume is too short",
      description: `Your resume has only ~${wordCount} words. A good resume typically has 400-800 words. Add more details about your experience and projects.`,
      keywords: [],
    });
  } else if (wordCount > 1200) {
    suggestions.push({
      type: "moderate",
      category: "Length",
      title: "Resume may be too long",
      description: `Your resume has ~${wordCount} words. Consider trimming to 1-2 pages for better readability.`,
      keywords: [],
    });
  }

  // Format suggestions
  const formatIssues = [];
  if (!findInText(resume.fullText, "email") && !resume.fullText.includes("@")) {
    formatIssues.push("Email address");
  }
  if (!findInText(resume.fullText, "phone") && !/\d{10}/.test(resumeText)) {
    formatIssues.push("Phone number");
  }
  if (!findInText(resume.fullText, "linkedin") && !findInText(resume.fullText, "github")) {
    formatIssues.push("LinkedIn/GitHub profile");
  }

  if (formatIssues.length > 0) {
    suggestions.push({
      type: "important",
      category: "Contact Info",
      title: "Add missing contact information",
      description: `ATS systems look for contact details. Consider adding:`,
      keywords: formatIssues,
    });
  }

  // ===== 5. Generate Mock Interview Questions =====
  const mockQuestions = [];
  
  if (jdTechSkills.length > 0) {
    const selectedSkills = [...jdTechSkills].sort(() => 0.5 - Math.random()).slice(0, 3);
    selectedSkills.forEach(skill => {
      const qTypes = [
        `Can you explain your experience working with ${skill.toUpperCase()}?`,
        `Describe a challenging problem you solved using ${skill.toUpperCase()}.`,
        `What are the best practices you follow when developing with ${skill.toUpperCase()}?`
      ];
      mockQuestions.push(qTypes[Math.floor(Math.random() * qTypes.length)]);
    });
  }
  
  // Add behavioral questions based on soft skills
  if (jdSoftSkills.length > 0) {
    const selectedSoft = [...jdSoftSkills].sort(() => 0.5 - Math.random()).slice(0, 2);
    selectedSoft.forEach(skill => {
      mockQuestions.push(`Tell me about a time you had to demonstrate strong ${skill.toLowerCase()}.`);
    });
  } else {
    // Default behavioral
    mockQuestions.push("Why are you interested in this specific role and our company?");
    mockQuestions.push("Tell me about a time you failed and what you learned from it.");
  }

  // ===== 6. Return Results =====

  return {
    overallScore: Math.min(overallScore, 100),
    breakdown: {
      techSkills: { score: Math.round(techScore), matched: matchedTechSkills, missing: missingTechSkills },
      softSkills: { score: Math.round(softScore), matched: matchedSoftSkills, missing: missingSoftSkills },
      keywords: { score: Math.round(keywordScore), matched: matchedKeywords, missing: missingKeywords },
      education: { score: Math.round(educationScore), matched: matchedEducation, missing: missingEducation },
    },
    actionVerbs: { used: usedActionVerbs, count: usedActionVerbs.length },
    suggestions,
    mockQuestions,
    stats: {
      resumeWordCount: wordCount,
      jdKeywordsFound: topJdKeywords.length,
      totalMatched: matchedTechSkills.length + matchedSoftSkills.length + matchedKeywords.length,
      totalMissing: missingTechSkills.length + missingSoftSkills.length + missingKeywords.length,
    },
  };
};

export default analyzeResume;
