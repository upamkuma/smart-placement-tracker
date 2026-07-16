import { useState, useEffect } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

const agents = [
  { id: "copilot", name: "Career Copilot", icon: "🤖", desc: "Gemini-powered career advisor", status: "active", color: "#6366f1", route: "/ai-copilot" },
  { id: "ats", name: "ATS Analyzer V2", icon: "📊", desc: "Semantic resume scoring", status: "active", color: "#8b5cf6", route: "/ai-ats" },
  { id: "optimizer", name: "Resume Optimizer", icon: "✨", desc: "AI bullet point rewriter", status: "active", color: "#ec4899", route: "/ai-resume-optimizer" },
  { id: "cover", name: "Cover Letter AI", icon: "✉️", desc: "Resume + JD → letter", status: "active", color: "#10b981", route: "/cover-letter" },
  { id: "matcher", name: "Job Matcher", icon: "🎯", desc: "Skills → company match %", status: "active", color: "#f59e0b", route: "/job-matcher" },
  { id: "roadmap", name: "Roadmap Generator", icon: "🗺️", desc: "Goal → weekly learning plan", status: "active", color: "#14b8a6", route: "/learning-roadmap" },
  { id: "github", name: "GitHub Analyzer", icon: "💻", desc: "Code quality AI review", status: "active", color: "#e2e8f0", route: "/github-analyzer" },
  { id: "interview", name: "Interview Coach", icon: "🎤", desc: "Voice evaluation + scores", status: "active", color: "#ef4444", route: "/ai-interview-coach" },
];

export default function RecruiterDashboard() {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("agents"); // agents | recruiter

  useEffect(() => {
    // Demo student data for recruiter view
    const demoStudents = [
      { name: "Upam Kumar", skills: ["React", "Node.js", "MongoDB", "Express", "TypeScript"], role: "Full Stack Dev", score: 88, github: "github.com/upamkumar", college: "NIT Silchar" },
      { name: "Priya Sharma", skills: ["Python", "Django", "PostgreSQL", "Docker", "AWS"], role: "Backend Dev", score: 92, github: "github.com/priyasharma", college: "IIT Bombay" },
      { name: "Rohan Gupta", skills: ["React", "TypeScript", "GraphQL", "CSS", "Figma"], role: "Frontend Dev", score: 85, github: "github.com/rohangupta", college: "BITS Pilani" },
      { name: "Sneha Patel", skills: ["Java", "Spring Boot", "Kafka", "Redis", "MySQL"], role: "Backend Dev", score: 90, github: "github.com/snehapatel", college: "VIT Vellore" },
      { name: "Arjun Nair", skills: ["Go", "Kubernetes", "Docker", "AWS", "Terraform"], role: "DevOps Eng", score: 87, github: "github.com/arjunnair", college: "IIIT Hyderabad" },
      { name: "Kavya Reddy", skills: ["Python", "TensorFlow", "PyTorch", "Scikit-learn", "SQL"], role: "ML Engineer", score: 93, github: "github.com/kavyareddy", college: "IIT Madras" },
    ];
    setUsers(demoStudents);
    setLoading(false);
  }, []);

  const filtered = users.filter((u) => {
    if (!filter) return true;
    const f = filter.toLowerCase();
    return (
      u.skills.some((s) => s.toLowerCase().includes(f)) ||
      u.name.toLowerCase().includes(f) ||
      u.role.toLowerCase().includes(f)
    );
  });

  const skillTags = ["React", "Node.js", "Python", "Java", "Go", "TypeScript", "AWS", "Docker", "MongoDB", "ML"];

  return (
    <div className="min-h-screen bg-[#0a0f1e] pt-20 pb-10 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 mb-4">
            <span className="text-blue-400 text-xs font-semibold uppercase tracking-wider">Multi-Agent System</span>
          </div>
          <h1 className="text-4xl font-black text-white mb-3">
            AI <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Command Center</span>
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto mb-6">
            All AI agents at a glance — your complete AI Career Operating System
          </p>
          <div className="flex justify-center gap-2">
            <button
              onClick={() => setView("agents")}
              className={`px-5 py-2 rounded-xl font-medium text-sm transition-all ${view === "agents" ? "bg-blue-600 text-white" : "bg-slate-800/60 text-slate-400 hover:text-white border border-white/5"}`}
            >
              🤖 AI Agents
            </button>
            <button
              onClick={() => setView("recruiter")}
              className={`px-5 py-2 rounded-xl font-medium text-sm transition-all ${view === "recruiter" ? "bg-blue-600 text-white" : "bg-slate-800/60 text-slate-400 hover:text-white border border-white/5"}`}
            >
              👔 Recruiter View
            </button>
          </div>
        </div>

        {/* AI Agents Grid */}
        {view === "agents" && (
          <div>
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: "AI Agents Active", value: "8", icon: "🤖", color: "indigo" },
                { label: "Powered By", value: "Gemini", icon: "✨", color: "purple" },
                { label: "Features", value: "10", icon: "🚀", color: "pink" },
                { label: "Status", value: "Online", icon: "🟢", color: "emerald" },
              ].map((stat) => (
                <div key={stat.label} className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl p-4 text-center">
                  <div className="text-2xl mb-1">{stat.icon}</div>
                  <div className="text-white font-black text-xl">{stat.value}</div>
                  <div className="text-slate-500 text-xs">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {agents.map((agent) => (
                <a
                  key={agent.id}
                  href={agent.route}
                  className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl p-5 hover:scale-[1.03] transition-all duration-300 group block no-underline"
                  style={{ borderColor: `${agent.color}15` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                      style={{ backgroundColor: `${agent.color}15` }}
                    >
                      {agent.icon}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-emerald-400 text-xs">Active</span>
                    </div>
                  </div>
                  <h3 className="text-white font-bold group-hover:text-blue-300 transition-colors">{agent.name}</h3>
                  <p className="text-slate-400 text-xs mt-1">{agent.desc}</p>
                  <div
                    className="mt-4 text-xs font-semibold flex items-center gap-1 transition-all"
                    style={{ color: agent.color }}
                  >
                    Launch Agent →
                  </div>
                </a>
              ))}
            </div>

            {/* Architecture diagram */}
            <div className="mt-8 bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-2xl p-6">
              <h3 className="text-white font-bold mb-4 text-center">🏗️ Multi-Agent Architecture</h3>
              <div className="flex flex-col items-center gap-2 text-sm text-slate-400">
                <div className="px-6 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-300 font-semibold">
                  React Frontend
                </div>
                <div className="text-slate-600">↓</div>
                <div className="px-6 py-2 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-300 font-semibold">
                  Express Backend
                </div>
                <div className="text-slate-600">↓</div>
                <div className="flex gap-4 flex-wrap justify-center">
                  {["MongoDB", "Gemini API", "Socket.IO"].map((s) => (
                    <div key={s} className="px-4 py-1.5 bg-slate-800/60 border border-white/5 rounded-xl text-slate-300 text-xs">
                      {s}
                    </div>
                  ))}
                </div>
                <div className="text-slate-600">↓</div>
                <div className="flex gap-3 flex-wrap justify-center">
                  {["Career Agent", "Resume Agent", "Interview Agent", "Roadmap Agent"].map((s) => (
                    <div key={s} className="px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-300 text-xs font-medium">
                      {s}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recruiter View */}
        {view === "recruiter" && (
          <div>
            {/* Search */}
            <div className="max-w-lg mx-auto mb-6">
              <div className="relative">
                <input
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  placeholder="Search by skill, name, or role..."
                  className="w-full bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl px-5 py-4 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 pr-12"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">🔍</span>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {skillTags.map((s) => (
                  <button
                    key={s}
                    onClick={() => setFilter(s)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all border ${
                      filter === s
                        ? "bg-blue-600 border-blue-500 text-white"
                        : "bg-slate-800/50 border-slate-600/30 text-slate-400 hover:border-blue-500/40 hover:text-white"
                    }`}
                  >
                    {s}
                  </button>
                ))}
                {filter && (
                  <button onClick={() => setFilter("")} className="px-3 py-1 rounded-full text-xs bg-red-500/10 border border-red-500/20 text-red-400">
                    Clear ×
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((u, i) => (
                <div key={i} className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl p-5 hover:border-blue-500/20 transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-white font-bold">{u.name}</h3>
                        <p className="text-slate-400 text-xs">{u.role}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-emerald-400 font-black text-xl">{u.score}%</div>
                      <div className="text-slate-600 text-xs">ATS Score</div>
                    </div>
                  </div>
                  <p className="text-slate-500 text-xs mb-3">{u.college}</p>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {u.skills.map((s, si) => (
                      <span
                        key={si}
                        className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                          filter && s.toLowerCase().includes(filter.toLowerCase())
                            ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                            : "bg-slate-700/50 text-slate-300 border-white/5"
                        }`}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                  <div className="w-full bg-slate-700/50 rounded-full h-1.5 mb-3">
                    <div
                      className="h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
                      style={{ width: `${u.score}%` }}
                    />
                  </div>
                  <a
                    href={`https://${u.github}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-slate-500 hover:text-blue-400 transition-colors"
                  >
                    🔗 {u.github}
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
