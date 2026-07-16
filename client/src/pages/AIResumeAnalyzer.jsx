import { useState } from "react";
import aiAPI from "../services/aiService";

const ScoreRing = ({ score, label, color }) => {
  const pct = Math.round(score);
  const dash = 2 * Math.PI * 36;
  const offset = dash - (dash * pct) / 100;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-20 h-20">
        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="36" fill="none" stroke="#1e293b" strokeWidth="7" />
          <circle
            cx="40" cy="40" r="36" fill="none"
            stroke={color} strokeWidth="7"
            strokeDasharray={dash} strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1s ease" }}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-lg">
          {pct}%
        </span>
      </div>
      <span className="text-slate-400 text-xs text-center">{label}</span>
    </div>
  );
};

const SkillBadge = ({ skill, type }) => (
  <span
    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
      type === "matched"
        ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/20"
        : "bg-red-500/15 text-red-300 border border-red-500/20"
    }`}
  >
    {type === "matched" ? "✓" : "✗"} {skill}
  </span>
);

export default function AIResumeAnalyzer() {
  const [jd, setJd] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [animate, setAnimate] = useState(false);

  const analyze = async () => {
    if (!jd.trim()) { setError("Please paste a job description."); return; }
    setLoading(true); setError(""); setResult(null); setAnimate(false);
    try {
      const res = await aiAPI.analyzeATS(jd);
      setResult(res.data.analysis);
      setTimeout(() => setAnimate(true), 100);
    } catch (e) {
      setError(e.response?.data?.message || "Analysis failed. Make sure your resume is uploaded.");
    } finally { setLoading(false); }
  };

  const gradeColors = {
    technical: "#6366f1",
    projects: "#8b5cf6",
    communication: "#ec4899",
    experience: "#f59e0b",
    education: "#10b981",
    keywords: "#3b82f6",
  };

  const verdictColors = {
    High: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    Medium: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    Low: "text-red-400 bg-red-500/10 border-red-500/20",
  };

  return (
    <div className="min-h-screen bg-[#0a0f1e] pt-20 pb-10 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5 mb-4">
            <span className="text-indigo-400 text-xs font-semibold uppercase tracking-wider">AI-Powered · Gemini 1.5</span>
          </div>
          <h1 className="text-4xl font-black text-white mb-3">
            ATS Analyzer <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">V2</span>
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto">
            Semantic resume analysis using Gemini AI — goes far beyond keyword matching to evaluate your true fit
          </p>
        </div>

        {/* Input */}
        {!result && (
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl p-6 mb-6">
            <label className="block text-sm font-semibold text-slate-300 mb-3">
              📋 Paste Job Description
            </label>
            <textarea
              value={jd}
              onChange={(e) => setJd(e.target.value)}
              placeholder="Paste the full job description here. The more detailed, the better the analysis..."
              rows={8}
              className="w-full bg-slate-800/50 border border-slate-600/30 rounded-xl p-4 text-sm text-slate-200 placeholder-slate-600 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            />
            {error && <p className="text-red-400 text-sm mt-2">⚠️ {error}</p>}
            <button
              onClick={analyze}
              disabled={loading || !jd.trim()}
              className="mt-4 w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:from-indigo-500 hover:to-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Gemini is analyzing your resume...
                </>
              ) : "🔍 Analyze with AI"}
            </button>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Overall Score Hero */}
            <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 backdrop-blur-xl border border-indigo-500/20 rounded-2xl p-8 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5" />
              <div className="relative z-10">
                <p className="text-slate-400 text-sm mb-2">Overall ATS Score</p>
                <div className="text-7xl font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-3">
                  {result.overallScore}%
                </div>
                <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold border ${verdictColors[result.hiringChance] || verdictColors.Medium}`}>
                  {result.hiringChance === "High" ? "🚀" : result.hiringChance === "Medium" ? "📈" : "⚠️"}
                  {result.hiringChance} Hiring Probability
                </span>
                <p className="text-slate-300 mt-4 max-w-lg mx-auto text-sm">{result.verdict}</p>
              </div>
            </div>

            {/* Score Breakdown */}
            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl p-6">
              <h3 className="text-white font-bold mb-6 flex items-center gap-2">
                <span className="text-indigo-400">📊</span> Score Breakdown
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-6">
                {result.grades && Object.entries(result.grades).map(([key, val]) => (
                  <ScoreRing
                    key={key}
                    score={val}
                    label={key.charAt(0).toUpperCase() + key.slice(1)}
                    color={gradeColors[key] || "#6366f1"}
                  />
                ))}
              </div>
            </div>

            {/* Skills */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl p-6">
                <h3 className="text-emerald-400 font-bold mb-4">✅ Matched Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {result.matchedSkills?.map((s, i) => <SkillBadge key={i} skill={s} type="matched" />)}
                </div>
              </div>
              <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl p-6">
                <h3 className="text-red-400 font-bold mb-4">❌ Missing Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {result.missingSkills?.map((s, i) => <SkillBadge key={i} skill={s} type="missing" />)}
                </div>
              </div>
            </div>

            {/* Strengths & Improvements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl p-6">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                  <span>💪</span> Strengths
                </h3>
                <ul className="space-y-2">
                  {result.strengths?.map((s, i) => (
                    <li key={i} className="text-slate-300 text-sm flex items-start gap-2">
                      <span className="text-emerald-400 mt-0.5 flex-shrink-0">•</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl p-6">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                  <span>🎯</span> What to Improve
                </h3>
                <ul className="space-y-2">
                  {result.improvements?.map((s, i) => (
                    <li key={i} className="text-slate-300 text-sm flex items-start gap-2">
                      <span className="text-amber-400 mt-0.5 flex-shrink-0">→</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <button
              onClick={() => { setResult(null); setJd(""); }}
              className="w-full py-3 bg-slate-800/60 border border-white/5 text-slate-300 rounded-xl hover:bg-slate-700/60 transition-all font-medium"
            >
              ← Analyze Another Job Description
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
