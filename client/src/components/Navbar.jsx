import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useRef, useEffect } from "react";
import NotificationBell from "./NotificationBell";

const aiTools = [
  { to: "/ai-copilot", label: "AI Career Copilot", icon: "🤖", desc: "Gemini-powered advisor" },
  { to: "/ai-ats", label: "ATS Analyzer V2", icon: "📊", desc: "Semantic resume scoring" },
  { to: "/ai-resume-optimizer", label: "Resume Optimizer", icon: "✨", desc: "AI bullet rewrites" },
  { to: "/cover-letter", label: "Cover Letter AI", icon: "✉️", desc: "Instant generation" },
  { to: "/job-matcher", label: "Job Matcher", icon: "🎯", desc: "Company match %" },
  { to: "/learning-roadmap", label: "Learning Roadmap", icon: "🗺️", desc: "Personalized plan" },
  { to: "/github-analyzer", label: "GitHub Analyzer", icon: "💻", desc: "Code quality score" },
  { to: "/ai-interview-coach", label: "Interview Coach", icon: "🎤", desc: "Voice + AI eval" },
  { to: "/command-center", label: "AI Command Center", icon: "🚀", desc: "All agents + Recruiter" },
];

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [aiDropdownOpen, setAiDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setMobileMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setAiDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Nav links config
  const navLinks = [
    {
      to: "/dashboard",
      label: "Dashboard",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
    },
    {
      to: "/interviews",
      label: "Interviews",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      to: "/resume-ats",
      label: "Resume",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      to: "/chat",
      label: "Chat",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
    },
    {
      to: "/mock-tests",
      label: "Tests",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
    },
  ];

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-dark-900/70 border-b border-dark-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group" id="nav-logo">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20 group-hover:shadow-primary-500/40 transition-shadow duration-300">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="hidden sm:block">
              <span className="text-sm font-black gradient-text">Smart Placement Tracker</span>
              <span className="block text-[10px] text-indigo-400 font-semibold -mt-0.5 tracking-wider">AI CAREER PLATFORM</span>
            </div>
            <span className="text-lg font-bold gradient-text sm:hidden">SPT AI</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {isAuthenticated ? (
              <>
                {/* Nav Links */}
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200
                      ${isActive(link.to)
                        ? "bg-primary-500/15 text-primary-300 border border-primary-500/30"
                        : "text-dark-400 hover:text-white hover:bg-dark-800/60 border border-transparent"
                      }`}
                  >
                    {link.icon}
                    {link.label}
                  </Link>
                ))}

                {/* AI Tools Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setAiDropdownOpen(!aiDropdownOpen)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 border ${
                      aiDropdownOpen
                        ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/40"
                        : "bg-gradient-to-r from-indigo-600/20 to-purple-600/20 text-indigo-300 border-indigo-500/30 hover:from-indigo-600/30 hover:to-purple-600/30"
                    }`}
                  >
                    <span className="text-sm">🤖</span>
                    AI Tools
                    <svg className={`w-3 h-3 transition-transform ${aiDropdownOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {aiDropdownOpen && (
                    <div className="absolute right-0 top-12 w-64 bg-slate-900/95 backdrop-blur-xl border border-indigo-500/20 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden z-50">
                      <div className="px-4 py-3 border-b border-white/5">
                        <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider">AI Career Tools</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">Powered by Gemini 1.5 Flash</p>
                      </div>
                      <div className="py-2">
                        {aiTools.map((tool) => (
                          <Link
                            key={tool.to}
                            to={tool.to}
                            onClick={() => setAiDropdownOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-indigo-500/10 transition-colors group"
                          >
                            <span className="text-lg w-6 text-center flex-shrink-0">{tool.icon}</span>
                            <div>
                              <p className="text-white text-xs font-semibold group-hover:text-indigo-300 transition-colors">{tool.label}</p>
                              <p className="text-slate-500 text-[10px]">{tool.desc}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div className="w-px h-6 bg-dark-700/50 mx-1" />

                {/* Notification Bell */}
                <NotificationBell />

                {/* User info */}
                <div className="flex items-center gap-2 px-3 py-1.5 glass-card ml-1">
                  <div className="w-7 h-7 bg-gradient-to-br from-primary-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <span className="text-dark-200 text-xs font-medium max-w-[80px] truncate">
                    {user?.name || "User"}
                  </span>
                </div>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  id="nav-logout-btn"
                  className="flex items-center gap-1.5 px-3 py-2 text-dark-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-200 text-xs font-medium"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="px-5 py-2 text-dark-300 hover:text-white transition-colors text-sm font-medium">
                  Sign In
                </Link>
                <Link to="/register" className="btn-primary text-sm !py-2 !px-5">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-2 md:hidden">
            {isAuthenticated && <NotificationBell />}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-dark-400 hover:text-white transition-colors"
              id="nav-mobile-toggle"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-dark-700/50 bg-dark-900/95 backdrop-blur-xl">
          <div className="px-4 py-4 space-y-1">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-3 px-3 py-2 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <span className="text-dark-200 text-sm font-medium">{user?.name}</span>
                </div>

                <p className="text-xs text-slate-600 uppercase font-semibold px-3 mb-1">Main</p>
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-colors
                      ${isActive(link.to) ? "text-primary-400 bg-primary-500/10" : "text-dark-300 hover:text-white"}`}
                  >
                    {link.icon}
                    {link.label}
                  </Link>
                ))}

                <p className="text-xs text-indigo-500 uppercase font-semibold px-3 mb-1 mt-3">AI Tools</p>
                {aiTools.map((tool) => (
                  <Link
                    key={tool.to}
                    to={tool.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-indigo-300 hover:text-white hover:bg-indigo-500/10 transition-colors"
                  >
                    <span>{tool.icon}</span>
                    {tool.label}
                  </Link>
                ))}

                <div className="border-t border-dark-700/30 mt-2 pt-2">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center gap-2 px-3 py-2.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-dark-300 hover:text-white text-sm">
                  Sign In
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-primary-400 font-medium text-sm">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
