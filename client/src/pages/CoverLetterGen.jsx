import { useState } from "react";
import aiAPI from "../services/aiService";

export default function CoverLetterGen() {
  const [jd, setJd] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [letter, setLetter] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    if (!jd.trim()) { setError("Please paste a job description."); return; }
    setLoading(true); setError(""); setLetter("");
    try {
      const res = await aiAPI.generateCoverLetter(jd, company || "the company", role || "Software Engineer");
      setLetter(res.data.coverLetter);
    } catch (e) {
      setError(e.response?.data?.message || "Generation failed. Make sure your resume is uploaded.");
    } finally { setLoading(false); }
  };

  const copy = () => {
    navigator.clipboard.writeText(letter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const download = () => {
    const blob = new Blob([letter], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Cover_Letter_${company || "Application"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#0a0f1e] pt-20 pb-10 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 mb-4">
            <span className="text-emerald-400 text-xs font-semibold uppercase tracking-wider">One-Click Generation</span>
          </div>
          <h1 className="text-4xl font-black text-white mb-3">
            Cover Letter <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Generator</span>
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto">
            AI generates a personalized, compelling cover letter from your resume + job description in seconds
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Panel */}
          <div className="space-y-4">
            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl p-6">
              <h3 className="text-white font-bold mb-4">📋 Job Details</h3>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Company Name</label>
                  <input
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Razorpay"
                    className="w-full bg-slate-800/50 border border-slate-600/30 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Role</label>
                  <input
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. SDE-1"
                    className="w-full bg-slate-800/50 border border-slate-600/30 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                  />
                </div>
              </div>

              <label className="block text-xs text-slate-400 mb-1.5">Job Description *</label>
              <textarea
                value={jd}
                onChange={(e) => setJd(e.target.value)}
                placeholder="Paste the full job description here..."
                rows={10}
                className="w-full bg-slate-800/50 border border-slate-600/30 rounded-xl p-3 text-sm text-slate-200 placeholder-slate-600 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              />

              {error && <p className="text-red-400 text-sm mt-2">⚠️ {error}</p>}

              <button
                onClick={generate}
                disabled={loading || !jd.trim()}
                className="mt-4 w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl hover:from-emerald-500 hover:to-teal-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Writing your cover letter...
                  </>
                ) : "✉️ Generate Cover Letter"}
              </button>
            </div>

            {/* Tips */}
            <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-5">
              <h4 className="text-white font-semibold mb-3 text-sm">💡 Pro Tips</h4>
              <ul className="space-y-2">
                {[
                  "Upload your resume in the Resume section first",
                  "Include the full JD for better personalization",
                  "Add company name for company-specific references",
                  "Edit the output to add personal touches",
                ].map((tip, i) => (
                  <li key={i} className="text-slate-400 text-xs flex items-start gap-2">
                    <span className="text-emerald-400">•</span> {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Output Panel */}
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold">📄 Generated Cover Letter</h3>
              {letter && (
                <div className="flex gap-2">
                  <button
                    onClick={copy}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700/60 border border-white/10 rounded-lg text-xs text-white hover:bg-slate-600/60 transition-all"
                  >
                    {copied ? "✓ Copied!" : "📋 Copy"}
                  </button>
                  <button
                    onClick={download}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/40 border border-emerald-500/30 rounded-lg text-xs text-emerald-300 hover:bg-emerald-600/60 transition-all"
                  >
                    ⬇️ Download
                  </button>
                </div>
              )}
            </div>

            <div className="flex-1 min-h-[400px]">
              {!letter && !loading && (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-600">
                  <div className="text-5xl mb-4">✉️</div>
                  <p className="text-sm">Your personalized cover letter will appear here</p>
                </div>
              )}
              {loading && (
                <div className="h-full flex flex-col items-center justify-center gap-4">
                  <div className="w-12 h-12 border-3 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin border-[3px]" />
                  <p className="text-slate-400 text-sm animate-pulse">Gemini is crafting your letter...</p>
                </div>
              )}
              {letter && (
                <textarea
                  value={letter}
                  onChange={(e) => setLetter(e.target.value)}
                  className="w-full h-full min-h-[400px] bg-slate-800/30 border border-slate-700/30 rounded-xl p-4 text-sm text-slate-200 resize-none focus:outline-none focus:ring-1 focus:ring-emerald-500/30 leading-relaxed"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
