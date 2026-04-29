import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import { jobAPI, resumeAPI } from "../services/api";
import KanbanColumn from "../components/KanbanColumn";
import JobModal from "../components/JobModal";
import Loader from "../components/Loader";
import { useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";

const STATUSES = ["Applied", "Interview", "Offer", "Rejected"];

const Dashboard = () => {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [resumeInfo, setResumeInfo] = useState(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);

  // Fetch jobs on mount
  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await jobAPI.getAll();
      setJobs(res.data);
    } catch (error) {
      toast.error("Failed to fetch jobs. Please try again.");
      console.error("Fetch jobs error:", error);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchJobs();
    // Fetch resume info
    resumeAPI.getInfo().then(res => setResumeInfo(res.data)).catch(() => {});
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  // Filter and search jobs
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      searchQuery === "" ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.role.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      filterStatus === "All" || job.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  // Role Suggestion Logic based on Resume Text
  const analyzeSkillsFromResume = (text) => {
    if (!text) return null;
    const lowerText = text.toLowerCase();
    
    const roles = [
      { name: "Full Stack Developer", score: 0, mandatory: ["react", "node", "mongodb", "javascript", "git"], keywords: ["full stack", "react", "node", "express", "mongodb", "mern", "api", "database", "backend", "frontend"] },
      { name: "Frontend Developer", score: 0, mandatory: ["react", "css", "html", "javascript", "tailwind"], keywords: ["frontend", "front-end", "react", "vue", "angular", "css", "html", "ui", "ux", "tailwind", "responsive"] },
      { name: "Backend Developer", score: 0, mandatory: ["node", "sql", "api", "docker", "git"], keywords: ["backend", "back-end", "node", "python", "java", "spring", "sql", "postgresql", "api", "microservices", "docker"] },
      { name: "Data Scientist", score: 0, mandatory: ["python", "sql", "pandas", "machine learning"], keywords: ["data", "machine learning", "python", "r", "sql", "tensorflow", "pytorch", "pandas", "analytics", "statistics", "model"] },
      { name: "DevOps Engineer", score: 0, mandatory: ["aws", "docker", "kubernetes", "ci/cd", "linux"], keywords: ["devops", "aws", "docker", "kubernetes", "ci/cd", "jenkins", "terraform", "linux", "cloud", "infrastructure"] },
      { name: "Mobile Developer", score: 0, mandatory: ["react native", "swift", "kotlin", "git"], keywords: ["mobile", "android", "ios", "react native", "flutter", "swift", "kotlin", "app", "ui"] }
    ];

    roles.forEach(role => {
      role.keywords.forEach(kw => {
        if (lowerText.includes(kw)) role.score += 1;
      });
    });

    roles.sort((a, b) => b.score - a.score);
    const topRole = roles[0].score >= 3 ? roles[0] : roles[0]; // fallback
    
    // Find missing mandatory skills
    const missingSkills = topRole.mandatory.filter(skill => !lowerText.includes(skill));

    return {
      role: topRole.score >= 3 ? topRole.name : "Software Engineer",
      missingSkills: missingSkills.length > 0 ? missingSkills : ["System Design", "Cloud Basics"]
    };
  };

  const skillAnalysis = resumeInfo ? analyzeSkillsFromResume(resumeInfo.extractedText) : null;
  const suggestedRole = skillAnalysis ? skillAnalysis.role : null;

  // Group jobs by status for Kanban columns
  const jobsByStatus = STATUSES.reduce((acc, status) => {
    acc[status] = filteredJobs.filter((job) => job.status === status);
    return acc;
  }, {});

  // Add/Edit job handler
  const handleJobSubmit = async (formData) => {
    try {
      if (editingJob) {
        // Update existing job
        const res = await jobAPI.update(editingJob._id, formData);
        setJobs((prev) =>
          prev.map((j) => (j._id === editingJob._id ? res.data : j))
        );
        toast.success("Application updated successfully! ✏️");
        if (formData.status === "Offer" && editingJob.status !== "Offer") fireConfetti();
      } else {
        // Create new job
        const res = await jobAPI.create(formData);
        setJobs((prev) => [res.data, ...prev]);
        toast.success("Application added successfully! 🎯");
        if (formData.status === "Offer") fireConfetti();
      }
      setEditingJob(null);
    } catch (error) {
      const msg = error.response?.data?.message || "Operation failed";
      toast.error(msg);
      throw error; // Re-throw so modal knows it failed
    }
  };

  // Delete job handler
  const handleDelete = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this application?")) {
      return;
    }

    try {
      await jobAPI.delete(jobId);
      setJobs((prev) => prev.filter((j) => j._id !== jobId));
      toast.success("Application deleted 🗑️");
    } catch (error) {
      toast.error("Failed to delete. Try again.");
    }
  };

  // Edit job handler
  const handleEdit = (job) => {
    setEditingJob(job);
    setIsModalOpen(true);
  };

  // Drag & Drop status update
  const handleDropJob = async (jobId, newStatus) => {
    // Optimistic update
    const previousJobs = [...jobs];
    const jobToMove = jobs.find((j) => j._id === jobId);
    
    if (jobToMove && jobToMove.status !== "Offer" && newStatus === "Offer") {
      fireConfetti();
    }

    setJobs((prev) =>
      prev.map((j) => (j._id === jobId ? { ...j, status: newStatus } : j))
    );

    try {
      await jobAPI.updateStatus(jobId, newStatus);
      toast.info(`Moved to ${newStatus}`);
    } catch (error) {
      // Revert on failure
      setJobs(previousJobs);
      toast.error("Failed to update status");
    }
  };

  const fireConfetti = () => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min, max) => Math.random() * (max - min) + min;

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
      confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
    }, 250);
  };


  // Stats
  const stats = [
    {
      label: "Total",
      value: jobs.length,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      color: "from-primary-500/20 to-primary-600/5",
      textColor: "text-primary-400",
    },
    {
      label: "Applied",
      value: jobs.filter((j) => j.status === "Applied").length,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      ),
      color: "from-blue-500/20 to-blue-600/5",
      textColor: "text-blue-400",
    },
    {
      label: "Interview",
      value: jobs.filter((j) => j.status === "Interview").length,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      color: "from-amber-500/20 to-amber-600/5",
      textColor: "text-amber-400",
    },
    {
      label: "Offers",
      value: jobs.filter((j) => j.status === "Offer").length,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "from-emerald-500/20 to-emerald-600/5",
      textColor: "text-emerald-400",
    },
  ];

  if (loading) {
    return <Loader text="Loading your applications..." />;
  }

  // Gamification Logic
  const calculateRank = (jobCount) => {
    if (jobCount < 5) return { title: "Rookie Explorer", level: 1, nextAt: 5, progress: (jobCount / 5) * 100, color: "from-blue-400 to-cyan-400", icon: "🌱" };
    if (jobCount < 15) return { title: "Active Applicant", level: 2, nextAt: 15, progress: ((jobCount - 5) / 10) * 100, color: "from-purple-400 to-pink-400", icon: "🚀" };
    if (jobCount < 30) return { title: "Interview Master", level: 3, nextAt: 30, progress: ((jobCount - 15) / 15) * 100, color: "from-amber-400 to-orange-400", icon: "🔥" };
    return { title: "Offer Magnet", level: 4, nextAt: 50, progress: Math.min(((jobCount - 30) / 20) * 100, 100), color: "from-emerald-400 to-teal-400", icon: "👑" };
  };
  const rank = calculateRank(jobs.length);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Welcome & Gamification Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 animate-fade-in bg-dark-800/40 p-6 rounded-3xl border border-white/5 shadow-xl relative overflow-hidden">
        {/* Decorative Background */}
        <div className={`absolute -right-10 -top-10 w-40 h-40 bg-gradient-to-br ${rank.color} rounded-full blur-[80px] opacity-20 animate-pulse`}></div>
        
        <div className="relative z-10 flex-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
            Welcome back,{" "}
            <span className="gradient-text">{user?.name?.split(" ")[0] || "there"}</span>!
            <span className="text-3xl origin-bottom-right animate-[bounce_2s_infinite]">👋</span>
          </h1>
          
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-dark-900/80 border border-white/10 shadow-inner">
              <span className="text-xl">{rank.icon}</span>
              <span className="text-sm font-bold text-white tracking-wide">Level {rank.level}:</span>
              <span className={`text-sm font-extrabold bg-gradient-to-r ${rank.color} bg-clip-text text-transparent`}>{rank.title}</span>
            </div>
            
            <div className="flex-1 max-w-sm w-full">
              <div className="flex justify-between text-[11px] font-medium text-dark-400 mb-1.5 px-1">
                <span>{jobs.length} Apps</span>
                <span>{rank.nextAt} Apps for Level {Math.min(rank.level + 1, 4)}</span>
              </div>
              <div className="h-2.5 w-full bg-dark-900/80 rounded-full overflow-hidden border border-white/5 shadow-inner">
                <div 
                  className={`h-full bg-gradient-to-r ${rank.color} rounded-full transition-all duration-1000 ease-out relative`}
                  style={{ width: `${Math.max(rank.progress, 5)}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Add New Job Button */}
        <button
          onClick={() => {
            setEditingJob(null);
            setIsModalOpen(true);
          }}
          className="btn-primary flex items-center gap-2 self-start sm:self-auto"
          id="add-job-btn"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Add Application</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6 animate-fade-in">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`glass-card p-4 bg-gradient-to-br ${stat.color} glow-hover`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-dark-400 text-xs font-medium uppercase tracking-wider">
                  {stat.label}
                </p>
                <p className={`text-2xl font-bold mt-1 ${stat.textColor}`}>
                  {stat.value}
                </p>
              </div>
              <div className={`${stat.textColor} opacity-50`}>{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Resume & ATS Quick Access Card */}
      <div className="mb-6 animate-fade-in animate-float relative" style={{ animationDuration: '8s' }}>
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-purple-600/20 blur-xl rounded-3xl"></div>
        <div className="relative glass-card-premium p-6 sm:p-8 bg-dark-900/80 border-t border-white/20 shadow-2xl">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl animate-pulse"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 p-[2px] shadow-lg shadow-primary-500/30">
                <div className="w-full h-full bg-dark-900 rounded-[14px] flex items-center justify-center">
                  <svg className="w-8 h-8 text-primary-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <div>
                {resumeInfo ? (
                  <>
                    <h2 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-3">
                      {resumeInfo.originalName}
                      <span className="text-xs px-2.5 py-1 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.2)]">Verified</span>
                    </h2>
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                      <p className="text-dark-300 text-sm font-medium flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.8)]"></span>
                        {resumeInfo.wordCount} words extracted
                      </p>
                      {suggestedRole && (
                        <>
                          <span className="hidden sm:inline text-dark-600 font-bold">•</span>
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-purple-300 rounded-xl shadow-inner">
                            🎯 Best Fit: {suggestedRole}
                          </span>
                        </>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <h2 className="text-2xl font-extrabold tracking-tight text-white mb-1">Upload Your Resume</h2>
                    <p className="text-dark-400 text-sm font-medium">Unlock AI-powered ATS scores and skill recommendations instantly.</p>
                  </>
                )}
              </div>
            </div>
            <button
              onClick={() => navigate("/resume-ats")}
              className="btn-primary shadow-xl shadow-primary-500/40 px-6 py-3.5 text-base rounded-2xl flex items-center gap-2 hover:scale-105 transition-transform"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              {resumeInfo ? "Check ATS Score" : "Upload Document"}
            </button>
          </div>
        </div>
      </div>

      {/* AI Skill Gap Insights Card */}
      {skillAnalysis && (
        <div className="mb-8 animate-fade-in animate-float relative" style={{ animationDuration: '9.5s' }}>
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 blur-xl rounded-3xl"></div>
          <div className="relative glass-card-premium p-6 sm:p-8 bg-dark-800/80 border border-emerald-500/30 shadow-[0_10px_40px_rgba(16,185,129,0.1)]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              
              <div className="flex items-start gap-4 flex-1">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 p-[2px] shadow-lg shadow-emerald-500/30 flex-shrink-0">
                  <div className="w-full h-full bg-dark-900 rounded-[14px] flex items-center justify-center">
                    <span className="text-2xl">🧠</span>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-3">
                    AI Skill Gap Analysis 
                    <span className="text-[11px] uppercase tracking-wider px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded-full border border-blue-500/30 font-bold">Target: {skillAnalysis.role}</span>
                  </h3>
                  <p className="text-dark-300 text-sm mt-1.5 leading-relaxed max-w-2xl">
                    Based on deep analysis of your uploaded resume, here are the <strong className="text-emerald-400">mandatory skills</strong> you still need to master to land this highly-competitive role:
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mt-4">
                    {skillAnalysis.missingSkills.map((skill, index) => (
                      <span key={index} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-sm font-semibold shadow-sm hover:bg-red-500/20 transition-colors cursor-default">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        Learn {skill.toUpperCase()}
                      </span>
                    ))}
                    {skillAnalysis.missingSkills.length === 0 && (
                      <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 text-emerald-300 rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/10">
                        <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                        Your skills match perfectly! Ready for interviews.
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {skillAnalysis.missingSkills.length > 0 && (
                <button 
                  onClick={() => window.open(`https://www.coursera.org/search?query=${skillAnalysis.missingSkills[0] || skillAnalysis.role}`, "_blank")}
                  className="w-full md:w-auto px-6 py-3.5 bg-dark-800 border-2 border-emerald-500/30 text-emerald-400 font-bold rounded-2xl hover:bg-emerald-500/10 hover:border-emerald-400 hover:text-emerald-300 transition-all duration-300 flex items-center justify-center gap-2 whitespace-nowrap shadow-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  Find Courses Now
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6 animate-fade-in">
        {/* Search */}
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search by company or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field !pl-10"
            id="search-input"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {["All", ...STATUSES].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200
                ${
                  filterStatus === status
                    ? "bg-primary-500/20 text-primary-300 border border-primary-500/30"
                    : "bg-dark-800/60 text-dark-400 border border-dark-700/30 hover:text-dark-200 hover:bg-dark-700/60"
                }`}
              id={`filter-${status.toLowerCase()}`}
            >
              {status}
              {status !== "All" && (
                <span className="ml-1.5 text-xs opacity-60">
                  {jobs.filter((j) => j.status === status).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-6 animate-fade-in" id="kanban-board">
        {STATUSES.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            jobs={jobsByStatus[status]}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onDropJob={handleDropJob}
          />
        ))}
      </div>

      {/* Empty State */}
      {jobs.length === 0 && !loading && (
        <div className="text-center py-16 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-dark-800/60 rounded-full mb-4">
            <svg className="w-10 h-10 text-dark-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            No applications yet
          </h3>
          <p className="text-dark-400 mb-6 max-w-md mx-auto">
            Start tracking your placement journey by adding your first job
            application.
          </p>
          <button
            onClick={() => {
              setEditingJob(null);
              setIsModalOpen(true);
            }}
            className="btn-primary inline-flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Your First Application
          </button>
        </div>
      )}

      {/* No search results */}
      {jobs.length > 0 && filteredJobs.length === 0 && (
        <div className="text-center py-12 animate-fade-in">
          <svg className="w-12 h-12 text-dark-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h3 className="text-lg font-semibold text-dark-300 mb-1">
            No results found
          </h3>
          <p className="text-dark-500 text-sm">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}

      {/* Job Modal */}
      <JobModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingJob(null);
        }}
        onSubmit={handleJobSubmit}
        editingJob={editingJob}
      />
    </div>
  );
};

export default Dashboard;
