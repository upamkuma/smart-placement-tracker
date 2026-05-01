import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Landing = () => {
  const { isAuthenticated } = useAuth();

  // If already logged in, go to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col justify-center relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }}></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s' }}></div>
      <div className="absolute top-40 right-1/4 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s' }}></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 relative z-10 flex flex-col lg:flex-row items-center gap-12 sm:gap-16">
        
        {/* Left Content - Hero Text */}
        <div className="flex-1 text-center lg:text-left order-2 lg:order-1">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-6 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></span>
            The Ultimate Career Companion
          </div>
          
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.2] mb-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
            Track, Analyze, and Land Your <br className="hidden lg:block" />
            <span className="gradient-text">Dream Job</span>
          </h1>
          
          <p className="text-base sm:text-lg text-dark-300 mb-8 max-w-2xl mx-auto lg:mx-0 animate-fade-in leading-relaxed" style={{ animationDelay: '200ms' }}>
            Elevate your job search with our AI-powered ATS resume analyzer, smart application tracking, and personalized interview prep. Your success story starts here.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 animate-fade-in" style={{ animationDelay: '300ms' }}>
            <Link to="/register" className="w-full sm:w-auto btn-primary px-8 py-4 text-lg shadow-xl shadow-primary-500/20">
              Get Started for Free
            </Link>
            <Link to="/login" className="w-full sm:w-auto btn-secondary px-8 py-4 text-lg bg-dark-800/50 backdrop-blur-sm border-white/5">
              Sign In to Account
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-8 text-dark-400 text-sm animate-fade-in" style={{ animationDelay: '400ms' }}>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
              </div>
              AI ATS Scoring
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
              </div>
              Smart Tracking
            </div>
          </div>
        </div>

        {/* Right Content - Hero Image */}
        <div className="flex-1 relative w-full max-w-sm sm:max-w-lg mx-auto lg:max-w-none flex justify-center animate-float order-1 lg:order-2" style={{ animationDuration: '8s' }}>
          <div className="relative w-full aspect-square sm:aspect-auto sm:h-[450px] lg:h-[550px] flex items-center justify-center">
            
            <img 
              src="/smart-placement-tracker/hero-image.png" 
              alt="Professionals using Smart Placement Tracker" 
              className="relative z-10 w-full h-full object-contain filter drop-shadow-[0_0_40px_rgba(99,102,241,0.25)]"
            />

            {/* Floating Element 1 - ATS Score */}
            <div className="absolute -left-4 sm:-left-10 top-1/4 glass-card-premium p-3 sm:p-4 z-20 animate-float shadow-2xl border-white/10" style={{ animationDelay: '1s' }}>
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="relative w-10 h-10 sm:w-12 sm:h-12">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="52" fill="none" stroke="#1e293b" strokeWidth="8" />
                    <circle cx="60" cy="60" r="52" fill="none" stroke="#10b981" strokeWidth="8" strokeDasharray="300 327" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-[10px] sm:text-xs font-bold text-emerald-400">92%</div>
                </div>
                <div>
                  <p className="text-white text-xs sm:text-sm font-bold">ATS Score</p>
                  <p className="text-emerald-400 text-[10px] sm:text-xs">Excellent Match</p>
                </div>
              </div>
            </div>

            {/* Floating Element 2 - Interview Prep */}
            <div className="absolute -right-4 sm:-right-8 bottom-1/4 glass-card-premium p-3 sm:p-4 z-20 animate-float shadow-2xl border-white/10" style={{ animationDelay: '2s' }}>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-lg border border-purple-500/30">
                  🤖
                </div>
                <div>
                  <p className="text-white text-xs sm:text-sm font-bold">Mock Interview</p>
                  <p className="text-dark-300 text-[10px] sm:text-xs">5 questions ready</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Features Section */}
      <div className="relative z-10 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Supercharge Your Search</h2>
            <p className="text-dark-400 max-w-2xl mx-auto text-sm sm:text-base">Everything you need to manage your applications and stand out to recruiters in one place.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10">
            {/* Feature 1: Kanban */}
            <div className="glass-card-premium group hover:border-primary-500/50 transition-all duration-500 overflow-hidden flex flex-col">
              <div className="h-40 sm:h-48 overflow-hidden">
                <img 
                  src="/smart-placement-tracker/kanban-tracking.png" 
                  alt="Kanban Tracking" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                />
              </div>
              <div className="p-6 sm:p-8 flex-1 flex flex-col">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/10">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Visual Kanban</h3>
                <p className="text-dark-300 text-sm sm:text-base leading-relaxed">Organize applications with a sleek drag-and-drop board. Never miss a deadline or follow-up again.</p>
              </div>
            </div>

            {/* Feature 2: ATS */}
            <div className="glass-card-premium group hover:border-emerald-500/50 transition-all duration-500 overflow-hidden flex flex-col">
              <div className="h-40 sm:h-48 overflow-hidden">
                <img 
                  src="/smart-placement-tracker/ats-analysis.png" 
                  alt="ATS Analysis" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                />
              </div>
              <div className="p-6 sm:p-8 flex-1 flex flex-col">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/10">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">ATS Analysis</h3>
                <p className="text-dark-300 text-sm sm:text-base leading-relaxed">Our AI scans your resume against job descriptions, giving you a score and identifying missing keywords.</p>
              </div>
            </div>

            {/* Feature 3: Smart Assistant */}
            <div className="glass-card-premium group hover:border-purple-500/50 transition-all duration-500 overflow-hidden flex flex-col sm:col-span-2 lg:col-span-1">
              <div className="h-40 sm:h-48 overflow-hidden">
                <img 
                  src="/smart-placement-tracker/interview-bot.png" 
                  alt="Smart Assistant" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                />
              </div>
              <div className="p-6 sm:p-8 flex-1 flex flex-col">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-500/20 text-purple-400 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-purple-500/10">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">AI Coach</h3>
                <p className="text-dark-300 text-sm sm:text-base leading-relaxed">Get personalized mock interview questions and expert tips tailored to each specific job role.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default Landing;
