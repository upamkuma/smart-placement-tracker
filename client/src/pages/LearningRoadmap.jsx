import { useState } from "react";
import aiAPI from "../services/aiService";

const difficultyColors = {
  Beginner: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  Intermediate: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  Advanced: "text-red-400 bg-red-500/10 border-red-500/20",
};

const weekColors = [
  "border-indigo-500/40 bg-indigo-500/5",
  "border-purple-500/40 bg-purple-500/5",
  "border-pink-500/40 bg-pink-500/5",
  "border-blue-500/40 bg-blue-500/5",
  "border-teal-500/40 bg-teal-500/5",
  "border-emerald-500/40 bg-emerald-500/5",
  "border-amber-500/40 bg-amber-500/5",
  "border-red-500/40 bg-red-500/5",
];

export default function LearningRoadmap() {
  const [goal, setGoal] = useState("");
  const [level, setLevel] = useState("Beginner");
  const [timeframe, setTimeframe] = useState("8 weeks");
  const [loading, setLoading] = useState(false);
  const [roadmap, setRoadmap] = useState(null);
  const [error, setError] = useState("");
  const [expandedWeek, setExpandedWeek] = useState(0);

  const generate = async () => {
    if (!goal.trim()) { setError("Please enter your learning goal."); return; }
    setLoading(true); setError(""); setRoadmap(null);
    try {
      const res = await aiAPI.generateRoadmap(goal, level, timeframe);
      setRoadmap(res.data.roadmap);
    } catch (e) {
      setError(e.response?.data?.message || "Roadmap generation failed.");
    } finally { setLoading(false); }
  };

  const goalPresets = [
    "Amazon SDE-1", "Google Software Engineer", "Flipkart Backend Dev",
    "Razorpay Full Stack", "ML Engineer at startup", "Frontend Developer at CRED"
  ];

  return (
    <div className="min-h-screen bg-[#0a0f1e] pt-20 pb-10 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-teal-500/10 border border-teal-500/20 rounded-full px-4 py-1.5 mb-4">
            <span className="text-teal-400 text-xs font-semibold uppercase tracking-wider">AI-Personalized Plan</span>
          </div>
          <h1 className="text-4xl font-black text-white mb-3">
            AI Learning <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">Roadmap</span>
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto">
            Tell Gemini your career goal and get a personalized, week-by-week learning plan
          </p>
        </div>

        {/* Input */}
        {!roadmap && (
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl p-6 mb-6">
            <div className="mb-5">
              <label className="block text-sm font-semibold text-slate-300 mb-3">🎯 Your Goal</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {goalPresets.map((p) => (
                  <button
                    key={p}
                    onClick={() => setGoal(p)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all border ${
                      goal === p
                        ? "bg-teal-600 border-teal-500 text-white"
                        : "bg-slate-800/50 border-slate-600/30 text-slate-400 hover:border-teal-500/40 hover:text-white"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <input
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="Or type your own goal: e.g. 'Get placed at a fintech startup as a full stack developer'"
                className="w-full bg-slate-800/50 border border-slate-600/30 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-xs text-slate-400 mb-2">Current Level</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-600/30 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-500/40"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-2">Timeframe</label>
                <select
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-600/30 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-500/40"
                >
                  <option value="4 weeks">4 weeks</option>
                  <option value="6 weeks">6 weeks</option>
                  <option value="8 weeks">8 weeks</option>
                  <option value="12 weeks">12 weeks</option>
                  <option value="6 months">6 months</option>
                </select>
              </div>
            </div>

            {error && <p className="text-red-400 text-sm mb-4">⚠️ {error}</p>}

            <button
              onClick={generate}
              disabled={loading || !goal.trim()}
              className="w-full py-4 bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-bold rounded-xl hover:from-teal-500 hover:to-cyan-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-lg"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Gemini is building your roadmap...
                </>
              ) : "🗺️ Generate My Roadmap"}
            </button>
          </div>
        )}

        {/* Roadmap Display */}
        {roadmap && (
          <div className="space-y-6">
            {/* Header card */}
            <div className="bg-gradient-to-br from-teal-900/40 to-cyan-900/40 backdrop-blur-xl border border-teal-500/20 rounded-2xl p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-black text-white mb-1">{roadmap.title}</h2>
                  <p className="text-teal-300 text-sm">{roadmap.overview}</p>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <div className="text-3xl font-black text-white">{roadmap.totalWeeks}</div>
                  <div className="text-slate-400 text-xs">weeks</div>
                </div>
              </div>

              {roadmap.keyMilestones?.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {roadmap.keyMilestones.map((m, i) => (
                    <span key={i} className="text-xs px-3 py-1 bg-teal-500/10 border border-teal-500/20 rounded-full text-teal-300">
                      🎯 {m}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Weekly plan */}
            <div className="space-y-3">
              {roadmap.weeks?.map((week, i) => (
                <div
                  key={i}
                  className={`border rounded-2xl overflow-hidden transition-all duration-300 ${weekColors[i % weekColors.length]}`}
                >
                  <button
                    className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-white/5 transition-colors"
                    onClick={() => setExpandedWeek(expandedWeek === i ? -1 : i)}
                  >
                    <div className="w-10 h-10 rounded-xl bg-slate-800/80 flex items-center justify-center text-xl flex-shrink-0">
                      {week.icon || "📅"}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-500 font-semibold">WEEK {week.week}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${difficultyColors[week.difficulty] || difficultyColors.Beginner}`}>
                          {week.difficulty}
                        </span>
                      </div>
                      <h3 className="text-white font-bold">{week.theme}</h3>
                    </div>
                    <span className="text-slate-500">{expandedWeek === i ? "▲" : "▼"}</span>
                  </button>

                  {expandedWeek === i && (
                    <div className="px-5 pb-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-slate-500 font-semibold mb-2 uppercase">Topics</p>
                        <ul className="space-y-1">
                          {week.topics?.map((t, ti) => (
                            <li key={ti} className="text-slate-300 text-sm flex items-center gap-2">
                              <span className="text-teal-400">•</span> {t}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 font-semibold mb-2 uppercase">Tasks</p>
                        <ul className="space-y-1">
                          {week.tasks?.map((t, ti) => (
                            <li key={ti} className="text-slate-300 text-sm flex items-start gap-2">
                              <span className="text-amber-400 flex-shrink-0">☐</span> {t}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 font-semibold mb-2 uppercase">Resources</p>
                        <ul className="space-y-1">
                          {week.resources?.map((r, ri) => (
                            <li key={ri} className="text-slate-300 text-sm flex items-center gap-2">
                              <span className="text-blue-400">📚</span> {r}
                            </li>
                          ))}
                        </ul>
                        {week.milestone && (
                          <div className="mt-3 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                            <p className="text-emerald-400 text-xs font-semibold">🏆 Milestone</p>
                            <p className="text-emerald-300 text-xs">{week.milestone}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Resources & Tips */}
            {roadmap.resources?.length > 0 && (
              <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl p-5">
                <h3 className="text-white font-bold mb-4">📚 Recommended Resources</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {roadmap.resources.map((r, i) => (
                    <a
                      key={i}
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-slate-800/50 border border-white/5 rounded-xl hover:border-teal-500/30 transition-all group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center text-sm flex-shrink-0">
                        🔗
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium group-hover:text-teal-400 transition-colors">{r.name}</p>
                        <p className="text-slate-500 text-xs">{r.type}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {roadmap.tips?.length > 0 && (
              <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl p-5">
                <h3 className="text-white font-bold mb-4">💡 Pro Tips</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {roadmap.tips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-slate-300">
                      <span className="text-yellow-400 flex-shrink-0">•</span> {tip}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => setRoadmap(null)}
              className="w-full py-3 bg-slate-800/60 border border-white/5 text-slate-300 rounded-xl hover:bg-slate-700/60 transition-all font-medium"
            >
              ← Generate New Roadmap
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
