import { useState, useRef, useEffect } from "react";
import aiAPI from "../services/aiService";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

const suggestedPrompts = [
  "How can I improve my resume?",
  "Which skills am I missing for Google?",
  "Generate 5 interview questions for me",
  "What project should I build next?",
  "Am I ready for Razorpay?",
  "Write a cold email to a recruiter",
  "Explain system design for beginners",
  "How do I negotiate a job offer?",
];

const BotMessage = ({ text }) => {
  const formatted = text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br/>");
  return (
    <div
      className="prose prose-invert max-w-none text-sm leading-relaxed"
      dangerouslySetInnerHTML={{ __html: formatted }}
    />
  );
};

export default function AICopilot() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      role: "ai",
      content:
        "👋 Hey! I'm your **AI Career Copilot** powered by Gemini.\n\nI have access to your resume and can help you with:\n- **Resume feedback** and improvements\n- **Missing skills** analysis\n- **Interview prep** questions\n- **Career roadmap** planning\n- **Company-specific** advice\n\nWhat would you like to work on today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [jd, setJd] = useState("");
  const [showJD, setShowJD] = useState(false);
  const [hasResume, setHasResume] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get(`${API_BASE}/resume`, { headers: { Authorization: `Bearer ${token}` } })
      .then(() => setHasResume(true))
      .catch(() => setHasResume(false));
  }, []);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;

    const userMsg = { role: "user", content: msg, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const history = messages.slice(-6).map((m) => ({
        role: m.role === "user" ? "user" : "model",
        content: m.content,
      }));

      const res = await aiAPI.chat(msg, history, jd);
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: res.data.response, timestamp: new Date() },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: "⚠️ Something went wrong. Please try again in a moment.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1e] pt-20 pb-6 px-4">
      <div className="max-w-6xl mx-auto h-[calc(100vh-120px)] flex gap-4">
        {/* Sidebar */}
        <div className="w-72 flex-shrink-0 flex flex-col gap-4">
          {/* Status */}
          <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 backdrop-blur-xl border border-indigo-500/20 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">
                Gemini 1.5 Flash Active
              </span>
            </div>
            <h2 className="text-white font-bold text-lg leading-tight">AI Career Copilot</h2>
            <p className="text-slate-400 text-xs mt-1">
              Powered by Google Gemini · Resume-aware · Context-smart
            </p>
            <div className="mt-3 flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${hasResume ? "bg-emerald-400" : "bg-amber-400"}`}
              />
              <span className="text-xs text-slate-400">
                {hasResume ? "Resume loaded ✓" : "No resume uploaded"}
              </span>
            </div>
          </div>

          {/* JD Context */}
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl p-4">
            <button
              onClick={() => setShowJD(!showJD)}
              className="flex items-center justify-between w-full text-left"
            >
              <span className="text-sm font-semibold text-slate-300">📄 Add Job Description</span>
              <span className="text-slate-500 text-xs">{showJD ? "▲" : "▼"}</span>
            </button>
            {showJD && (
              <textarea
                value={jd}
                onChange={(e) => setJd(e.target.value)}
                placeholder="Paste JD here for company-specific advice..."
                className="mt-3 w-full h-32 bg-slate-800/50 border border-slate-600/30 rounded-xl p-3 text-xs text-slate-300 placeholder-slate-600 resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
              />
            )}
            {jd && (
              <p className="text-xs text-indigo-400 mt-2">✓ JD context active ({jd.length} chars)</p>
            )}
          </div>

          {/* Suggested Prompts */}
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl p-4 flex-1 overflow-y-auto">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Quick Prompts
            </p>
            <div className="flex flex-col gap-2">
              {suggestedPrompts.map((p, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(p)}
                  disabled={loading}
                  className="text-left text-xs text-slate-400 hover:text-white bg-slate-800/40 hover:bg-indigo-600/20 border border-slate-700/30 hover:border-indigo-500/30 rounded-xl p-2.5 transition-all duration-200 disabled:opacity-50"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chat Panel */}
        <div className="flex-1 flex flex-col bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 px-6 py-4 border-b border-white/5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xl">
              🤖
            </div>
            <div>
              <h1 className="text-white font-bold">Career Copilot</h1>
              <p className="text-slate-500 text-xs">Your personal AI career advisor</p>
            </div>
            <div className="ml-auto flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-emerald-400">Online</span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-sm font-bold ${
                    msg.role === "user"
                      ? "bg-indigo-600 text-white"
                      : "bg-gradient-to-br from-purple-600 to-pink-600 text-white"
                  }`}
                >
                  {msg.role === "user" ? (user?.name?.[0] || "U") : "🤖"}
                </div>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    msg.role === "user"
                      ? "bg-indigo-600/80 text-white rounded-tr-none"
                      : "bg-slate-800/80 border border-white/5 text-slate-200 rounded-tl-none"
                  }`}
                >
                  {msg.role === "ai" ? (
                    <BotMessage text={msg.content} />
                  ) : (
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                  )}
                  <p
                    className={`text-[10px] mt-1.5 ${
                      msg.role === "user" ? "text-indigo-300" : "text-slate-600"
                    }`}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-sm">
                  🤖
                </div>
                <div className="bg-slate-800/80 border border-white/5 rounded-2xl rounded-tl-none px-4 py-3">
                  <div className="flex gap-1 items-center h-5">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0ms]" />
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:150ms]" />
                    <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-6 py-4 border-t border-white/5">
            <div className="flex gap-3 items-end bg-slate-800/60 border border-white/10 rounded-2xl p-3">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything about your career, resume, or interviews..."
                rows={1}
                className="flex-1 bg-transparent text-white placeholder-slate-500 text-sm resize-none focus:outline-none max-h-32"
                style={{ height: "auto", minHeight: "24px" }}
                onInput={(e) => {
                  e.target.style.height = "auto";
                  e.target.style.height = e.target.scrollHeight + "px";
                }}
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                className="w-9 h-9 flex-shrink-0 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white transition-all hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
            <p className="text-center text-slate-600 text-[10px] mt-2">
              Press Enter to send · Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
