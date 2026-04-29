import { useState, useRef, useEffect } from "react";
import { useToast } from "../components/Toast";
import { analyzeResume } from "../services/atsAnalyzer";
import { validateFile, formatFileSize } from "../services/fileParser";
import { resumeAPI } from "../services/api";

const ResumeATS = () => {
  const toast = useToast();
  const fileInputRef = useRef(null);
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [results, setResults] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [inputMode, setInputMode] = useState("upload"); // "upload" or "paste"
  const [serverResumeId, setServerResumeId] = useState(null);

  // Load existing resume on mount
  useEffect(() => {
    const loadExistingResume = async () => {
      try {
        const res = await resumeAPI.getInfo();
        if (res.data) {
          setUploadedFile({
            name: res.data.originalName,
            size: res.data.fileSize,
            type: res.data.fileType.toUpperCase(),
          });
          setResumeText(res.data.extractedText || "");
          setServerResumeId(res.data._id);
        }
      } catch {
        // No resume uploaded yet - that's fine
      }
    };
    loadExistingResume();
  }, []);

  // Handle file selection - uploads full file to server
  const handleFileSelect = async (file) => {
    if (!file) return;

    const validation = validateFile(file);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    setParsing(true);
    setUploadedFile({ name: file.name, size: file.size, type: file.name.split(".").pop().toUpperCase() });

    try {
      const res = await resumeAPI.upload(file);
      const data = res.data;
      setServerResumeId(data._id);
      if (data.extractedText && data.extractedText.trim().length >= 20) {
        setResumeText(data.extractedText);
      }
      toast.success(`Resume uploaded to server! (${data.wordCount} words)`);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Failed to upload file");
      setUploadedFile(null);
    } finally {
      setParsing(false);
    }
  };

  // File input change handler
  const onFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
    // Reset input so same file can be re-selected
    e.target.value = "";
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);

    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  // Remove uploaded file (also deletes from server)
  const handleRemoveFile = async () => {
    try {
      if (serverResumeId) await resumeAPI.delete();
    } catch { /* ignore */ }
    setUploadedFile(null);
    setResumeText("");
    setServerResumeId(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // View/download resume PDF
  const handleViewResume = () => {
    const url = resumeAPI.getDownloadUrl();
    window.open(url, "_blank");
  };

  // Analyze resume
  const handleAnalyze = () => {
    if (!resumeText.trim()) {
      toast.warning("Please upload or paste your resume text");
      return;
    }
    if (!jobDescription.trim()) {
      toast.warning("Please paste the job description");
      return;
    }

    setAnalyzing(true);
    setTimeout(() => {
      const analysis = analyzeResume(resumeText, jobDescription);
      setResults(analysis);
      setAnalyzing(false);
      setActiveTab("overview");
      toast.success("Analysis complete! 📊");
    }, 800);
  };

  // Clear everything
  const handleClear = () => {
    setResumeText("");
    setJobDescription("");
    setResults(null);
    setUploadedFile(null);
    setServerResumeId(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Sample Job Description templates
  const [showTemplates, setShowTemplates] = useState(false);
  const sampleJDs = [
    { title: "Full Stack Developer", jd: "We are looking for a Full Stack Developer proficient in React.js, Node.js, Express.js, and MongoDB (MERN stack). Must have experience building RESTful APIs, implementing JWT authentication, and working with microservices architecture. Experience with TypeScript, Docker, AWS/GCP, CI/CD pipelines, and Git is preferred. Bachelor's degree in Computer Science or related field required. Must have strong problem-solving, communication, and teamwork skills. 2+ years of hands-on development experience." },
    { title: "Frontend Developer", jd: "Seeking a Frontend Developer skilled in React.js, HTML5, CSS3, JavaScript/TypeScript, and responsive web design. Experience with Redux/Context API, REST API integration, Webpack/Vite, and testing frameworks (Jest, Cypress) required. Knowledge of UI/UX best practices, accessibility standards (WCAG), and performance optimization. Familiarity with Figma/Adobe XD, Git version control, and Agile methodologies. Bachelor's degree preferred. Strong attention to detail and communication skills." },
    { title: "Backend Developer", jd: "Looking for a Backend Developer with expertise in Node.js, Express.js, Python, or Java. Must have strong experience with database design (MongoDB, PostgreSQL, MySQL), RESTful API development, authentication (OAuth, JWT), and server deployment. Knowledge of microservices, message queues (RabbitMQ, Kafka), caching (Redis), Docker, Kubernetes, and cloud platforms (AWS, Azure). Bachelor's degree in CS required. Strong analytical and debugging skills." },
    { title: "Data Scientist", jd: "Hiring a Data Scientist proficient in Python, R, SQL, and machine learning frameworks (TensorFlow, PyTorch, scikit-learn). Must have experience with data analysis, statistical modeling, NLP, computer vision, and deep learning. Knowledge of data visualization (Matplotlib, Tableau, Power BI), big data tools (Spark, Hadoop), and cloud ML services (AWS SageMaker, GCP AI). Master's degree in Data Science, Statistics, or related field preferred. Strong mathematical and communication skills." },
    { title: "DevOps Engineer", jd: "Seeking a DevOps Engineer experienced with CI/CD pipelines (Jenkins, GitHub Actions, GitLab CI), containerization (Docker, Kubernetes), and cloud infrastructure (AWS, Azure, GCP). Must have skills in infrastructure as code (Terraform, CloudFormation), monitoring (Prometheus, Grafana, ELK), Linux administration, and scripting (Bash, Python). Knowledge of networking, security best practices, and cost optimization. Bachelor's degree required. Strong troubleshooting skills." },
    { title: "Mobile App Developer", jd: "Looking for a Mobile Developer skilled in React Native or Flutter for cross-platform development, or Swift/Kotlin for native apps. Must have experience with REST API integration, state management, push notifications, and app store deployment. Knowledge of Firebase, GraphQL, offline storage, CI/CD for mobile, and UI/UX principles. Bachelor's degree in CS preferred. Strong creativity, attention to detail, and communication skills." },
  ];

  // Score helpers
  const getScoreColor = (score) => {
    if (score >= 80) return { text: "text-emerald-400", bg: "bg-emerald-500", ring: "ring-emerald-500/30" };
    if (score >= 60) return { text: "text-amber-400", bg: "bg-amber-500", ring: "ring-amber-500/30" };
    return { text: "text-red-400", bg: "bg-red-500", ring: "ring-red-500/30" };
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Needs Work";
    return "Poor";
  };

  const suggestionColors = {
    critical: "border-red-500/30 bg-red-500/5",
    important: "border-amber-500/30 bg-amber-500/5",
    moderate: "border-blue-500/30 bg-blue-500/5",
  };

  const suggestionIcons = {
    critical: "🔴",
    important: "🟡",
    moderate: "🔵",
  };

  // File type icon
  const fileTypeIcon = (type) => {
    switch (type) {
      case "PDF": return "📕";
      case "DOCX": case "DOC": return "📘";
      case "TXT": return "📄";
      default: return "📎";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-6 animate-fade-in">
        <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
          <span className="text-3xl">📄</span>
          Resume ATS Scanner
        </h1>
        <p className="text-dark-400 text-sm mt-1">
          Upload your resume & paste a job description to get your ATS compatibility score
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 animate-fade-in">
        {/* Left: Input Section */}
        <div className="space-y-4">
          {/* Resume Input */}
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <label className="text-white font-semibold text-sm flex items-center gap-2">
                <svg className="w-4 h-4 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Your Resume
              </label>

              {/* Toggle: Upload / Paste */}
              <div className="flex bg-dark-800/60 rounded-lg p-0.5">
                <button
                  onClick={() => setInputMode("upload")}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    inputMode === "upload"
                      ? "bg-primary-500/20 text-primary-300"
                      : "text-dark-500 hover:text-dark-300"
                  }`}
                >
                  Upload
                </button>
                <button
                  onClick={() => setInputMode("paste")}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    inputMode === "paste"
                      ? "bg-primary-500/20 text-primary-300"
                      : "text-dark-500 hover:text-dark-300"
                  }`}
                >
                  Paste
                </button>
              </div>
            </div>

            {inputMode === "upload" ? (
              <>
                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.doc,.txt"
                  onChange={onFileInputChange}
                  className="hidden"
                  id="resume-file-input"
                />

                {!uploadedFile ? (
                  /* Drop Zone */
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer
                      transition-all duration-300 group
                      ${dragOver
                        ? "border-primary-400 bg-primary-500/10 scale-[1.02]"
                        : "border-dark-600/50 hover:border-primary-500/50 hover:bg-dark-800/30"
                      }
                      ${parsing ? "pointer-events-none opacity-60" : ""}
                    `}
                  >
                    {parsing ? (
                      <div className="space-y-3">
                        <div className="w-12 h-12 border-3 border-dark-700 border-t-primary-500 rounded-full animate-spin mx-auto"></div>
                        <p className="text-dark-300 text-sm font-medium">Parsing your resume...</p>
                        <p className="text-dark-500 text-xs">Extracting text content</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className={`w-14 h-14 mx-auto rounded-xl flex items-center justify-center transition-all duration-300
                          ${dragOver
                            ? "bg-primary-500/20 scale-110"
                            : "bg-dark-800/60 group-hover:bg-primary-500/10"
                          }`}
                        >
                          <svg
                            className={`w-7 h-7 transition-colors ${
                              dragOver ? "text-primary-400" : "text-dark-500 group-hover:text-primary-400"
                            }`}
                            fill="none" stroke="currentColor" viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-dark-200 font-medium text-sm">
                            {dragOver ? "Drop your resume here" : "Click to upload or drag & drop"}
                          </p>
                          <p className="text-dark-500 text-xs mt-1">
                            Supports PDF, DOCX, DOC, TXT · Max 10MB
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Uploaded File Info */
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-dark-800/40 border border-dark-700/30 rounded-xl">
                      <span className="text-2xl">{fileTypeIcon(uploadedFile.type)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{uploadedFile.name}</p>
                        <p className="text-dark-500 text-xs">
                          {formatFileSize(uploadedFile.size)} · {resumeText.split(/\s+/).filter(Boolean).length} words extracted
                        </p>
                        {serverResumeId && (
                          <p className="text-emerald-500 text-[10px] mt-0.5 flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            Saved on server
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        {serverResumeId && (
                          <button
                            onClick={handleViewResume}
                            className="p-1.5 text-dark-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-all"
                            title="View / Download Resume"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                        )}
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="p-1.5 text-dark-400 hover:text-primary-400 hover:bg-primary-500/10 rounded-lg transition-all"
                          title="Replace with another file"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        </button>
                        <button
                          onClick={handleRemoveFile}
                          className="p-1.5 text-dark-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                          title="Remove file"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* View Resume Button */}
                    {serverResumeId && (
                      <button
                        onClick={handleViewResume}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 rounded-xl text-sm font-medium transition-all duration-200"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        View / Download Resume
                      </button>
                    )}

                    {/* Preview of extracted text */}
                    <div className="relative">
                      <p className="text-xs text-dark-500 mb-1.5 font-medium">Extracted Text (for ATS Analysis):</p>
                      <div className="bg-dark-900/50 rounded-xl p-3 max-h-[150px] overflow-y-auto border border-dark-700/20">
                        <p className="text-dark-300 text-xs leading-relaxed whitespace-pre-wrap">
                          {resumeText.length > 600 ? resumeText.substring(0, 600) + "..." : resumeText}
                        </p>
                      </div>
                      <button
                        onClick={() => setInputMode("paste")}
                        className="mt-2 text-xs text-primary-400 hover:text-primary-300 transition-colors flex items-center gap-1"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit extracted text
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* Paste Mode */
              <div>
                <textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder={"Paste your complete resume text here...\n\nInclude your skills, experience, education, projects, and achievements."}
                  className="input-field resize-none !h-[280px] text-sm leading-relaxed"
                  id="ats-resume-input"
                />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-dark-500">
                    {resumeText.split(/\s+/).filter(Boolean).length} words
                  </span>
                  {!uploadedFile && (
                    <button
                      onClick={() => setInputMode("upload")}
                      className="text-xs text-primary-400 hover:text-primary-300 transition-colors flex items-center gap-1"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      Or upload a file instead
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Job Description Input */}
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <label className="text-white font-semibold text-sm flex items-center gap-2">
                <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Job Description
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-dark-500">
                  {jobDescription.split(/\s+/).filter(Boolean).length} words
                </span>
                <div className="relative">
                  <button
                    onClick={() => setShowTemplates(!showTemplates)}
                    className="text-xs px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-lg transition-all flex items-center gap-1 border border-amber-500/20"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                    Templates
                  </button>
                  {showTemplates && (
                    <div className="absolute right-0 top-full mt-1 w-64 bg-dark-800 border border-dark-700/50 rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in">
                      <p className="text-[10px] text-dark-500 px-3 pt-2 pb-1 uppercase tracking-wider font-semibold">Select a role template</p>
                      {sampleJDs.map((item, idx) => (
                        <button
                          key={idx}
                          onClick={() => { setJobDescription(item.jd); setShowTemplates(false); toast.success(`Loaded: ${item.title} JD`); }}
                          className="w-full text-left px-3 py-2 text-sm text-dark-300 hover:bg-primary-500/10 hover:text-primary-400 transition-colors flex items-center gap-2"
                        >
                          <span className="text-base">💼</span>
                          {item.title}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder={"Paste the target job description here...\n\nInclude the full JD with requirements, responsibilities, and preferred qualifications."}
              className="input-field resize-none !h-[220px] text-sm leading-relaxed"
              id="ats-jd-input"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              className={`btn-primary flex-1 flex items-center justify-center gap-2 ${
                (!resumeText.trim() || !jobDescription.trim()) && !analyzing
                  ? "opacity-70 hover:opacity-90"
                  : ""
              }`}
              id="ats-analyze-btn"
            >
              {analyzing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Analyzing...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  Analyze Resume
                </>
              )}
            </button>
            {(resumeText || jobDescription) && (
              <button onClick={handleClear} className="btn-secondary" id="ats-clear-btn">
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Right: Results Section */}
        <div>
          {!results && !analyzing ? (
            <div className="glass-card p-8 h-full flex flex-col items-center justify-center text-center min-h-[600px]">
              <div className="w-20 h-20 bg-dark-800/60 rounded-full flex items-center justify-center mb-4">
                <span className="text-4xl">📊</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">ATS Score Analysis</h3>
              <p className="text-dark-400 text-sm max-w-xs mb-6">
                Upload or paste your resume and a job description to see your ATS compatibility score
              </p>
              <div className="space-y-3 text-left w-full max-w-xs">
                {[
                  { icon: "📤", text: "Upload PDF, DOCX, or TXT resume" },
                  { icon: "🎯", text: "Keyword matching analysis" },
                  { icon: "💡", text: "Improvement suggestions" },
                  { icon: "🔧", text: "Missing skills detection" },
                  { icon: "📈", text: "Score breakdown by category" },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-3 text-sm text-dark-300">
                    <span>{item.icon}</span>
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : analyzing ? (
            <div className="glass-card p-8 h-full flex flex-col items-center justify-center min-h-[600px]">
              <div className="relative mb-6">
                <div className="w-20 h-20 rounded-full border-4 border-dark-700"></div>
                <div className="w-20 h-20 rounded-full border-4 border-transparent border-t-primary-500 animate-spin absolute top-0 left-0"></div>
              </div>
              <p className="text-dark-300 font-medium">Analyzing your resume...</p>
              <p className="text-dark-500 text-sm mt-1">Extracting keywords & calculating score</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Score Card */}
              <div className="glass-card p-6 text-center">
                <div className="relative inline-block mb-3">
                  <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="52" fill="none" stroke="#1e293b" strokeWidth="8" />
                    <circle
                      cx="60" cy="60" r="52" fill="none"
                      stroke={results.overallScore >= 80 ? "#10b981" : results.overallScore >= 60 ? "#f59e0b" : "#ef4444"}
                      strokeWidth="8" strokeLinecap="round"
                      strokeDasharray={`${(results.overallScore / 100) * 327} 327`}
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-3xl font-bold ${getScoreColor(results.overallScore).text}`}>
                      {results.overallScore}%
                    </span>
                    <span className="text-xs text-dark-400 font-medium">ATS Score</span>
                  </div>
                </div>
                <p className={`text-sm font-semibold ${getScoreColor(results.overallScore).text}`}>
                  {getScoreLabel(results.overallScore)}
                </p>
                <p className="text-xs text-dark-500 mt-1">
                  {results.stats.totalMatched} matched · {results.stats.totalMissing} missing keywords
                </p>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 bg-dark-800/40 rounded-xl p-1">
                {[
                  { id: "overview", label: "Overview" },
                  { id: "skills", label: "Skills" },
                  { id: "suggestions", label: `Tips (${results.suggestions.length})` },
                  { id: "prep", label: "Prep ✨" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all duration-200
                      ${activeTab === tab.id
                        ? "bg-primary-500/20 text-primary-300 border border-primary-500/30"
                        : "text-dark-400 hover:text-white"
                      }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="glass-card p-5">
                {activeTab === "overview" && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-white text-sm">Score Breakdown</h3>
                    {[
                      { label: "Technical Skills", score: results.breakdown.techSkills.score, weight: "35%", icon: "⚙️" },
                      { label: "Keyword Match", score: results.breakdown.keywords.score, weight: "30%", icon: "🔑" },
                      { label: "Soft Skills", score: results.breakdown.softSkills.score, weight: "15%", icon: "🤝" },
                      { label: "Education", score: results.breakdown.education.score, weight: "10%", icon: "🎓" },
                    ].map((item) => (
                      <div key={item.label}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm text-dark-300 flex items-center gap-2">
                            <span>{item.icon}</span> {item.label}
                            <span className="text-[10px] text-dark-600">({item.weight})</span>
                          </span>
                          <span className={`text-sm font-bold ${getScoreColor(item.score).text}`}>
                            {item.score}%
                          </span>
                        </div>
                        <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${getScoreColor(item.score).bg}`}
                            style={{ width: `${item.score}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}

                    <div className="mt-4 pt-4 border-t border-dark-700/30">
                      <p className="text-sm text-dark-300 mb-2">
                        ✍️ Action Verbs Used: <span className="text-white font-bold">{results.actionVerbs.count}</span>
                      </p>
                      {results.actionVerbs.used.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {results.actionVerbs.used.map((verb) => (
                            <span key={verb} className="px-2 py-0.5 text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                              {verb}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-dark-700/30">
                      <div className="text-center p-3 bg-dark-900/40 rounded-xl">
                        <p className="text-lg font-bold text-white">{results.stats.resumeWordCount}</p>
                        <p className="text-[10px] text-dark-500 uppercase">Resume Words</p>
                      </div>
                      <div className="text-center p-3 bg-dark-900/40 rounded-xl">
                        <p className="text-lg font-bold text-white">{results.stats.jdKeywordsFound}</p>
                        <p className="text-[10px] text-dark-500 uppercase">JD Keywords</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "skills" && (
                  <div className="space-y-5">
                    <div>
                      <h3 className="font-semibold text-emerald-400 text-sm mb-2">
                        ✅ Matched Skills ({results.breakdown.techSkills.matched.length + results.breakdown.softSkills.matched.length})
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {[...results.breakdown.techSkills.matched, ...results.breakdown.softSkills.matched].map((skill) => (
                          <span key={skill} className="px-2.5 py-1 text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg">
                            ✓ {skill}
                          </span>
                        ))}
                        {results.breakdown.techSkills.matched.length + results.breakdown.softSkills.matched.length === 0 && (
                          <p className="text-dark-500 text-xs">No matching skills found</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-red-400 text-sm mb-2">
                        ❌ Missing Skills ({results.breakdown.techSkills.missing.length + results.breakdown.softSkills.missing.length})
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {[...results.breakdown.techSkills.missing, ...results.breakdown.softSkills.missing].map((skill) => (
                          <span key={skill} className="px-2.5 py-1 text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg">
                            ✗ {skill}
                          </span>
                        ))}
                        {results.breakdown.techSkills.missing.length + results.breakdown.softSkills.missing.length === 0 && (
                          <p className="text-emerald-400 text-xs">All JD skills are in your resume! 🎉</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-blue-400 text-sm mb-2">
                        🔑 Keyword Matches ({results.breakdown.keywords.matched.length}/{results.breakdown.keywords.matched.length + results.breakdown.keywords.missing.length})
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {results.breakdown.keywords.matched.map((kw) => (
                          <span key={kw} className="px-2 py-0.5 text-[10px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full">
                            {kw}
                          </span>
                        ))}
                      </div>
                      {results.breakdown.keywords.missing.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs text-dark-500 mb-1.5">Missing keywords to add:</p>
                          <div className="flex flex-wrap gap-1.5">
                            {results.breakdown.keywords.missing.slice(0, 15).map((kw) => (
                              <span key={kw} className="px-2 py-0.5 text-[10px] font-medium bg-dark-700/50 text-dark-400 border border-dark-600/30 rounded-full">
                                + {kw}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === "suggestions" && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-white text-sm mb-1">How to Improve Your Resume</h3>
                    {results.suggestions.length === 0 ? (
                      <div className="text-center py-6">
                        <span className="text-4xl mb-2 block">🎉</span>
                        <p className="text-emerald-400 font-medium">Your resume looks great!</p>
                        <p className="text-dark-500 text-xs mt-1">No major improvements needed</p>
                      </div>
                    ) : (
                      results.suggestions.map((suggestion, idx) => (
                        <div key={idx} className={`p-4 rounded-xl border ${suggestionColors[suggestion.type]}`}>
                          <div className="flex items-start gap-2 mb-2">
                            <span className="text-sm">{suggestionIcons[suggestion.type]}</span>
                            <div>
                              <p className="text-sm font-semibold text-white">{suggestion.title}</p>
                              <p className="text-xs text-dark-400 mt-0.5">{suggestion.category}</p>
                            </div>
                          </div>
                          <p className="text-xs text-dark-300 mb-2">{suggestion.description}</p>
                          {suggestion.keywords.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {suggestion.keywords.map((kw) => (
                                <span key={kw} className="px-2 py-0.5 text-[10px] font-medium bg-dark-800/60 text-dark-200 border border-dark-600/30 rounded-full">
                                  {kw}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}

                {activeTab === "prep" && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-4 rounded-xl border border-purple-500/20">
                      <h3 className="font-semibold text-white text-sm mb-1 flex items-center gap-2">
                        <span className="text-purple-400">🤖</span> AI Mock Interview
                      </h3>
                      <p className="text-xs text-dark-300">
                        Based on your matched skills and the job description, prepare for these tailored interview questions:
                      </p>
                    </div>
                    
                    <div className="space-y-3">
                      {results.mockQuestions?.map((q, idx) => (
                        <div key={idx} className="p-3 bg-dark-800/50 border border-dark-700/50 rounded-lg hover:bg-dark-800 transition-colors">
                          <p className="text-sm text-dark-200 font-medium leading-relaxed">
                            <span className="text-primary-500 mr-2 font-bold">Q{idx + 1}.</span> {q}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeATS;
