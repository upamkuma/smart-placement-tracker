import { useState } from "react";
import aiAPI from "../services/aiService";

export default function AIResumeOptimizer() {
  const [targetRole, setTargetRole] = useState("Software Engineer");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(null);

  const optimize = async () => {
    setLoading(true); setError(""); setResult(null);
    try {
      const res = await aiAPI.optimizeResume("", targetRole);
      setResult(res.data.result);
    } catch (e) {
      setError(e.response?.data?.message || "Please upload your resume first.");
    } finally { setLoading(false); }
  };

  const copyText = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopied(idx);
    setTimeout(() => setCopied(null), 2000);
  };

  const roles = [
    "Software Engineer", "Frontend Developer", "Backend Developer",
    "Full Stack Developer", "Data Engineer", "ML Engineer", "DevOps Engineer", "Product Manager"
  ];

  return (
    <div className="min-h-screen bg-[#0a0f1e] pt-20 pb-10 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-1.5 mb-4">
            <span className="text-purple-400 text-xs font-semibold uppercase tracking-wider">AI-Powered Rewriting</span>
          </div>
          <h1 className="text-4xl font-black text-white mb-3">
            Resume <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Optimizer</span>
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto">
            Gemini AI rewrites your bullet points with stronger action verbs, quantifiable metrics, and ATS-optimized language
          </p>
        </div>

        {/* Controls */}
        {!result && (
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl p-6 mb-6">
            <label className="block text-sm font-semibold text-slate-300 mb-3">
              🎯 Target Role
            </label>
            <div className="flex flex-wrap gap-2 mb-6">
              {roles.map((r) => (
                <button
                  key={r}
                  onClick={() => setTargetRole(r)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                    targetRole === r
                      ? "bg-purple-600 border-purple-500 text-white"
                      : "bg-slate-800/50 border-slate-600/30 text-slate-400 hover:border-purple-500/40 hover:text-white"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-4 mb-6">
              <p className="text-sm text-slate-400 flex items-start gap-2">
                <span className="text-blue-400 flex-shrink-0">ℹ️</span>
                Your uploaded resume will be used. Make sure you've uploaded it in the Resume ATS section.
              </p>
            </div>

            {error && <p className="text-red-400 text-sm mb-4">⚠️ {error}</p>}

            <button
              onClick={optimize}
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-purple-500 hover:to-pink-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-lg"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Gemini is rewriting your resume...
                </>
              ) : "✨ Optimize My Resume"}
            </button>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Score Comparison */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-900/60 backdrop-blur-xl border border-red-500/10 rounded-2xl p-6 text-center">
                <p className="text-slate-500 text-sm mb-2">Before Optimization</p>
                <div className="text-5xl font-black text-red-400 mb-1">{result.overallScore?.before}%</div>
                <div className="w-full bg-slate-700/50 rounded-full h-2 mt-3">
                  <div
                    className="h-2 rounded-full bg-red-500"
                    style={{ width: `${result.overallScore?.before}%` }}
                  />
                </div>
              </div>
              <div className="bg-slate-900/60 backdrop-blur-xl border border-emerald-500/10 rounded-2xl p-6 text-center">
                <p className="text-slate-500 text-sm mb-2">After Optimization</p>
                <div className="text-5xl font-black text-emerald-400 mb-1">{result.overallScore?.after}%</div>
                <div className="w-full bg-slate-700/50 rounded-full h-2 mt-3">
                  <div
                    className="h-2 rounded-full bg-emerald-500"
                    style={{ width: `${result.overallScore?.after}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-indigo-900/20 border border-indigo-500/20 rounded-2xl p-4">
              <p className="text-indigo-300 text-sm">{result.summary}</p>
            </div>

            {/* Key improvements */}
            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl p-6">
              <h3 className="text-white font-bold mb-4">🚀 Key Improvements Made</h3>
              <div className="flex flex-wrap gap-2">
                {result.keyImprovements?.map((imp, i) => (
                  <span key={i} className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs text-emerald-300 font-medium">
                    ✓ {imp}
                  </span>
                ))}
              </div>
            </div>

            {/* Before / After comparisons */}
            <div className="space-y-4">
              <h3 className="text-white font-bold text-lg">📝 Before → After Rewrites</h3>
              {result.optimizedSections?.map((section, i) => (
                <div key={i} className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden">
                  <div className="px-5 py-3 bg-slate-800/60 border-b border-white/5">
                    <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">{section.section}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/5">
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-red-400" />
                        <span className="text-xs text-red-400 font-semibold">BEFORE</span>
                      </div>
                      <p className="text-slate-400 text-sm leading-relaxed">{section.original}</p>
                    </div>
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-400" />
                          <span className="text-xs text-emerald-400 font-semibold">AFTER</span>
                        </div>
                        <button
                          onClick={() => copyText(section.optimized, i)}
                          className="text-xs text-slate-500 hover:text-white transition-colors"
                        >
                          {copied === i ? "✓ Copied!" : "Copy"}
                        </button>
                      </div>
                      <p className="text-white text-sm leading-relaxed">{section.optimized}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setResult(null)}
              className="w-full py-3 bg-slate-800/60 border border-white/5 text-slate-300 rounded-xl hover:bg-slate-700/60 transition-all font-medium"
            >
              ← Optimize Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
