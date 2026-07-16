import { useState } from "react";
import aiAPI from "../services/aiService";

const ScoreBar = ({ label, value, color }) => (
  <div className="space-y-1.5">
    <div className="flex justify-between items-center">
      <span className="text-sm text-slate-300 font-medium">{label}</span>
      <span className="text-white font-bold">{value}/10</span>
    </div>
    <div className="w-full bg-slate-700/50 rounded-full h-2.5 overflow-hidden">
      <div
        className="h-2.5 rounded-full transition-all duration-1000"
        style={{ width: `${(value / 10) * 100}%`, backgroundColor: color }}
      />
    </div>
  </div>
);

const scoreColors = {
  codeQuality: "#6366f1",
  documentation: "#8b5cf6",
  architecture: "#ec4899",
  diversity: "#f59e0b",
  activity: "#10b981",
  overall: "#3b82f6",
};

const scoreLabels = {
  codeQuality: "Code Quality",
  documentation: "Documentation",
  architecture: "Architecture",
  diversity: "Diversity",
  activity: "Activity",
  overall: "Overall",
};

export default function GitHubAnalyzer() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const analyze = async () => {
    if (!url.trim()) { setError("Please enter a GitHub URL or username."); return; }
    setLoading(true); setError(""); setResult(null);
    try {
      const res = await aiAPI.analyzeGitHub(url.trim());
      setResult(res.data);
    } catch (e) {
      setError(e.response?.data?.message || "Analysis failed. Check the URL and try again.");
    } finally { setLoading(false); }
  };

  const analysis = result?.analysis;
  const profile = result?.profile;

  return (
    <div className="min-h-screen bg-[#0a0f1e] pt-20 pb-10 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-slate-500/10 border border-slate-500/20 rounded-full px-4 py-1.5 mb-4">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">AI Code Review</span>
          </div>
          <h1 className="text-4xl font-black text-white mb-3">
            GitHub <span className="bg-gradient-to-r from-slate-300 to-white bg-clip-text text-transparent">Analyzer</span>
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto">
            Paste a GitHub profile URL and Gemini AI evaluates code quality, architecture, documentation, and gives recruiter-level feedback
          </p>
        </div>

        {/* Input */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl p-6">
            <label className="block text-sm font-semibold text-slate-300 mb-3">
              🔗 GitHub Profile URL
            </label>
            <div className="flex gap-3">
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && analyze()}
                placeholder="https://github.com/username or just username"
                className="flex-1 bg-slate-800/50 border border-slate-600/30 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500/40"
              />
              <button
                onClick={analyze}
                disabled={loading || !url.trim()}
                className="px-6 py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-200 transition-all disabled:opacity-50 flex items-center gap-2 flex-shrink-0"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-slate-400 border-t-slate-900 rounded-full animate-spin" />
                ) : "🔍 Analyze"}
              </button>
            </div>
            {error && <p className="text-red-400 text-sm mt-2">⚠️ {error}</p>}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-20">
            <div className="w-16 h-16 border-4 border-slate-700 border-t-white rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-400">Fetching GitHub data + analyzing with Gemini AI...</p>
          </div>
        )}

        {/* Results */}
        {result && analysis && (
          <div className="space-y-6">
            {/* Profile card */}
            {profile && (
              <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl p-6 flex items-start gap-5">
                {profile.avatar && (
                  <img
                    src={profile.avatar}
                    alt={profile.username}
                    className="w-16 h-16 rounded-2xl border-2 border-white/10 flex-shrink-0"
                  />
                )}
                <div className="flex-1">
                  <h2 className="text-white font-black text-xl">{profile.name || profile.username}</h2>
                  <p className="text-slate-400 text-sm">@{profile.username}</p>
                  {profile.bio && <p className="text-slate-300 text-sm mt-1">{profile.bio}</p>}
                  <div className="flex gap-4 mt-3">
                    <div className="text-center">
                      <div className="text-white font-bold">{profile.repos}</div>
                      <div className="text-slate-500 text-xs">Repos</div>
                    </div>
                    <div className="text-center">
                      <div className="text-white font-bold">{profile.followers}</div>
                      <div className="text-slate-500 text-xs">Followers</div>
                    </div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-5xl font-black text-white">{analysis.scores?.overall}</div>
                  <div className="text-slate-400 text-xs">/ 10 Overall</div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Score bars */}
              <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl p-6">
                <h3 className="text-white font-bold mb-5">📊 Score Breakdown</h3>
                <div className="space-y-4">
                  {analysis.scores &&
                    Object.entries(analysis.scores)
                      .filter(([k]) => k !== "overall")
                      .map(([k, v]) => (
                        <ScoreBar
                          key={k}
                          label={scoreLabels[k] || k}
                          value={v}
                          color={scoreColors[k] || "#6366f1"}
                        />
                      ))}
                </div>
              </div>

              {/* Tech stack + Highlights */}
              <div className="space-y-4">
                {analysis.techStack?.length > 0 && (
                  <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl p-5">
                    <h3 className="text-white font-bold mb-3">💻 Tech Stack</h3>
                    <div className="flex flex-wrap gap-2">
                      {analysis.techStack.map((t, i) => (
                        <span key={i} className="px-3 py-1.5 bg-slate-700/50 border border-white/10 rounded-full text-xs text-slate-300 font-medium">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {analysis.projectHighlights?.length > 0 && (
                  <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl p-5">
                    <h3 className="text-white font-bold mb-3">⭐ Project Highlights</h3>
                    <ul className="space-y-2">
                      {analysis.projectHighlights.map((h, i) => (
                        <li key={i} className="text-slate-300 text-sm flex items-start gap-2">
                          <span className="text-yellow-400 flex-shrink-0">•</span> {h}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Strengths & Improvements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl p-5">
                <h3 className="text-emerald-400 font-bold mb-3">✅ Strengths</h3>
                <ul className="space-y-2">
                  {analysis.strengths?.map((s, i) => (
                    <li key={i} className="text-slate-300 text-sm flex items-start gap-2">
                      <span className="text-emerald-400 flex-shrink-0">•</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl p-5">
                <h3 className="text-amber-400 font-bold mb-3">🎯 Improvements</h3>
                <ul className="space-y-2">
                  {analysis.improvements?.map((s, i) => (
                    <li key={i} className="text-slate-300 text-sm flex items-start gap-2">
                      <span className="text-amber-400 flex-shrink-0">→</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Recruiter summary */}
            <div className="bg-gradient-to-br from-slate-900/60 to-indigo-900/20 backdrop-blur-xl border border-indigo-500/20 rounded-2xl p-6">
              <h3 className="text-white font-bold mb-2">👔 Recruiter Summary</h3>
              <p className="text-slate-300 leading-relaxed">{analysis.recruiterSummary}</p>
              <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                <span className="text-indigo-400 font-semibold text-sm">{analysis.hiringSuggestion}</span>
              </div>
            </div>

            <button
              onClick={() => { setResult(null); setUrl(""); }}
              className="w-full py-3 bg-slate-800/60 border border-white/5 text-slate-300 rounded-xl hover:bg-slate-700/60 transition-all font-medium"
            >
              ← Analyze Another Profile
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
