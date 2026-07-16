import { useState } from "react";
import aiAPI from "../services/aiService";

const CompanyCard = ({ company, index }) => {
  const colors = [
    "from-indigo-600/20 to-indigo-800/20 border-indigo-500/20",
    "from-purple-600/20 to-purple-800/20 border-purple-500/20",
    "from-blue-600/20 to-blue-800/20 border-blue-500/20",
    "from-emerald-600/20 to-emerald-800/20 border-emerald-500/20",
    "from-amber-600/20 to-amber-800/20 border-amber-500/20",
    "from-pink-600/20 to-pink-800/20 border-pink-500/20",
    "from-teal-600/20 to-teal-800/20 border-teal-500/20",
    "from-red-600/20 to-red-800/20 border-red-500/20",
  ];
  const barColors = ["#6366f1","#8b5cf6","#3b82f6","#10b981","#f59e0b","#ec4899","#14b8a6","#ef4444"];
  const color = colors[index % colors.length];
  const barColor = barColors[index % barColors.length];
  const pct = company.matchPercentage;

  const diffBg = {
    Easy: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    Medium: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    Hard: "bg-red-500/10 text-red-400 border-red-500/20",
  };

  const companyLogos = {
    Google: "🔍", Microsoft: "🪟", Amazon: "📦", Flipkart: "🛒",
    Razorpay: "💳", CRED: "💎", Meesho: "🛍️", Swiggy: "🍔",
  };

  return (
    <div
      className={`bg-gradient-to-br ${color} backdrop-blur-xl border rounded-2xl p-5 hover:scale-[1.02] transition-all duration-300`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-3xl">{companyLogos[company.company] || "🏢"}</div>
          <div>
            <h3 className="text-white font-bold text-lg">{company.company}</h3>
            <span className={`inline-flex text-xs px-2 py-0.5 rounded-full border font-medium ${diffBg[company.difficulty] || diffBg.Medium}`}>
              {company.difficulty}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-black text-white">{pct}%</div>
          <div className="text-xs text-slate-400">match</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-slate-800/60 rounded-full h-2.5 mb-4 overflow-hidden">
        <div
          className="h-2.5 rounded-full transition-all duration-1000"
          style={{ width: `${pct}%`, backgroundColor: barColor }}
        />
      </div>

      {/* Matched / Missing */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <p className="text-xs text-slate-500 mb-1.5 font-medium">Matched</p>
          <div className="flex flex-wrap gap-1">
            {company.matchedSkills?.slice(0, 3).map((s, i) => (
              <span key={i} className="text-[10px] px-2 py-0.5 bg-emerald-500/15 text-emerald-300 rounded-full border border-emerald-500/20">
                {s}
              </span>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-1.5 font-medium">Missing</p>
          <div className="flex flex-wrap gap-1">
            {company.missingSkills?.slice(0, 3).map((s, i) => (
              <span key={i} className="text-[10px] px-2 py-0.5 bg-red-500/15 text-red-300 rounded-full border border-red-500/20">
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      <p className="text-slate-400 text-xs leading-relaxed">{company.recommendation}</p>
    </div>
  );
};

export default function JobMatcher() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const match = async () => {
    setLoading(true); setError(""); setResult(null);
    try {
      const res = await aiAPI.jobMatch();
      setResult(res.data.result);
    } catch (e) {
      setError(e.response?.data?.message || "Please upload your resume first.");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1e] pt-20 pb-10 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-1.5 mb-4">
            <span className="text-amber-400 text-xs font-semibold uppercase tracking-wider">AI Skill Matching</span>
          </div>
          <h1 className="text-4xl font-black text-white mb-3">
            AI Job <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">Matcher</span>
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto">
            Gemini AI reads your resume and calculates your match percentage for top tech companies
          </p>
        </div>

        {/* Trigger */}
        {!result && (
          <div className="max-w-lg mx-auto">
            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl p-8 text-center">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-white font-bold text-xl mb-2">Match Against 8 Top Companies</h3>
              <p className="text-slate-400 text-sm mb-6">
                Google · Microsoft · Amazon · Flipkart · Razorpay · CRED · Meesho · Swiggy
              </p>
              {error && <p className="text-red-400 text-sm mb-4">⚠️ {error}</p>}
              <button
                onClick={match}
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl hover:from-amber-400 hover:to-orange-400 transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-lg"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    AI is analyzing your profile...
                  </>
                ) : "🚀 Find My Best Matches"}
              </button>
              <p className="text-slate-600 text-xs mt-3">Requires resume uploaded in Resume section</p>
            </div>
          </div>
        )}

        {result && (
          <div className="space-y-6">
            {/* Extracted skills */}
            {result.extractedSkills?.length > 0 && (
              <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl p-5">
                <h3 className="text-white font-bold mb-3">🧠 Skills Detected from Your Resume</h3>
                <div className="flex flex-wrap gap-2">
                  {result.extractedSkills.map((s, i) => (
                    <span key={i} className="px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-xs text-indigo-300 font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Company cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4">
              {result.matches?.map((c, i) => (
                <CompanyCard key={c.company} company={c} index={i} />
              ))}
            </div>

            <button
              onClick={() => setResult(null)}
              className="w-full py-3 bg-slate-800/60 border border-white/5 text-slate-300 rounded-xl hover:bg-slate-700/60 transition-all font-medium"
            >
              ← Match Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
