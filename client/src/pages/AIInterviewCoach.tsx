import { useState, useEffect, useRef } from "react";
import aiAPI from "../services/aiService";

interface ScoreCardProps {
  label: string;
  value: string | number;
  icon: string;
  color: string;
}

const ScoreCard = ({ label, value, icon, color }: ScoreCardProps) => (
  <div className={`bg-slate-900/60 backdrop-blur-xl border rounded-xl p-4 text-center`} style={{ borderColor: `${color}30` }}>
    <div className="text-2xl mb-1">{icon}</div>
    <div className="text-2xl font-black" style={{ color }}>{value}</div>
    <div className="text-slate-400 text-xs mt-0.5">{label}</div>
  </div>
);
interface Question {
  id: number;
  q: string;
  cat: string;
}

const questions: Question[] = [
  { id: 1, q: "Tell me about yourself and your technical background.", cat: "Behavioral" },
  { id: 2, q: "Explain how you would design a URL shortener like bit.ly.", cat: "System Design" },
  { id: 3, q: "What is the difference between process and thread?", cat: "OS" },
  { id: 4, q: "Explain SOLID principles with an example.", cat: "OOP" },
  { id: 5, q: "How does React's reconciliation algorithm work?", cat: "Frontend" },
  { id: 6, q: "Describe a challenging bug you debugged. How did you solve it?", cat: "Behavioral" },
  { id: 7, q: "What is the difference between SQL and NoSQL? When would you use each?", cat: "Database" },
  { id: 8, q: "How would you optimize a slow REST API?", cat: "Backend" },
];

interface Evaluation {
  verdict: string;
  scores: {
    technical: number | string;
    communication: number | string;
    confidence: number | string;
    structure: number | string;
    overall: number | string;
  };
  feedback: string;
  strengths: string[];
  improvements: string[];
  betterAnswer: string;
  followUpQuestions: string[];
}

export default function AIInterviewCoach() {
  const [currentQ, setCurrentQ] = useState<Question | null>(null);
  const [answer, setAnswer] = useState<string>("");
  const [listening, setListening] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [error, setError] = useState<string>("");
  const [domain, setDomain] = useState<string>("Software Engineering");
  const [mode, setMode] = useState<"select" | "answer" | "result">("select"); // select | answer | result
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "en-US";
      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((r) => r[0].transcript)
          .join("");
        setAnswer(transcript);
      };
      recognitionRef.current.onerror = () => {
        setListening(false);
        setError("Microphone error. Try typing your answer.");
      };
    }
    return () => recognitionRef.current?.stop();
  }, []);

  const toggleListening = () => {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
    } else {
      setAnswer("");
      recognitionRef.current?.start();
      setListening(true);
    }
  };

  const selectQuestion = (q: Question) => {
    setCurrentQ(q);
    setAnswer("");
    setEvaluation(null);
    setError("");
    setMode("answer");
  };

  const evaluate = async () => {
    if (!answer.trim()) { setError("Please provide an answer (speak or type)."); return; }
    setListening(false);
    recognitionRef.current?.stop();
    setLoading(true); setError("");
    try {
      const res = await aiAPI.evaluateAnswer(currentQ!.q, answer, domain);
      setEvaluation(res.data.evaluation);
      setMode("result");
    } catch (e: any) {
      setError(e.response?.data?.message || "Evaluation failed. Please try again.");
    } finally { setLoading(false); }
  };

  const hasSpeech = "webkitSpeechRecognition" in window || "SpeechRecognition" in window;

  const catColors = {
    Behavioral: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    "System Design": "bg-purple-500/10 text-purple-400 border-purple-500/20",
    OS: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    OOP: "bg-pink-500/10 text-pink-400 border-pink-500/20",
    Frontend: "bg-teal-500/10 text-teal-400 border-teal-500/20",
    Database: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    Backend: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  };

  return (
    <div className="min-h-screen bg-[#0a0f1e] pt-20 pb-10 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-full px-4 py-1.5 mb-4">
            <span className="text-red-400 text-xs font-semibold uppercase tracking-wider">Voice + AI Evaluation</span>
          </div>
          <h1 className="text-4xl font-black text-white mb-3">
            AI Interview <span className="bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">Coach</span>
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto">
            Answer interview questions by voice or text. Gemini AI evaluates your answer and gives detailed feedback.
          </p>
        </div>

        {/* Question Selection */}
        {mode === "select" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-white font-bold">Select a Question</h3>
              <select
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="bg-slate-800/50 border border-slate-600/30 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500/40"
              >
                <option>Software Engineering</option>
                <option>Frontend Development</option>
                <option>Backend Development</option>
                <option>System Design</option>
                <option>Data Structures</option>
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {questions.map((q) => (
                <button
                  key={q.id}
                  onClick={() => selectQuestion(q)}
                  className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl p-4 text-left hover:border-red-500/30 hover:bg-slate-800/60 transition-all group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-slate-200 text-sm group-hover:text-white transition-colors flex-1">{q.q}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium flex-shrink-0 ${catColors[q.cat] || "bg-slate-700"}`}>
                      {q.cat}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Answer Mode */}
        {mode === "answer" && currentQ && (
          <div className="space-y-5">
            <button
              onClick={() => setMode("select")}
              className="text-slate-400 hover:text-white text-sm flex items-center gap-1 transition-colors"
            >
              ← Back to questions
            </button>

            {/* Question display */}
            <div className="bg-gradient-to-br from-red-900/30 to-pink-900/20 backdrop-blur-xl border border-red-500/20 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center text-xl flex-shrink-0">🎤</div>
                <div>
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${catColors[currentQ.cat] || ""}`}>
                    {currentQ.cat}
                  </span>
                  <h2 className="text-white font-bold text-lg mt-2">{currentQ.q}</h2>
                </div>
              </div>
            </div>

            {/* Voice + Text input */}
            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold">Your Answer</h3>
                {hasSpeech && (
                  <button
                    onClick={toggleListening}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                      listening
                        ? "bg-red-500 text-white animate-pulse"
                        : "bg-slate-700/60 border border-white/10 text-slate-300 hover:bg-slate-600/60"
                    }`}
                  >
                    {listening ? (
                      <>
                        <div className="w-2 h-2 rounded-full bg-white animate-ping" />
                        Recording... (click to stop)
                      </>
                    ) : "🎤 Speak Answer"}
                  </button>
                )}
              </div>

              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder={hasSpeech ? "Speak your answer using the button above, or type here..." : "Type your answer here..."}
                rows={8}
                className="w-full bg-slate-800/50 border border-slate-600/30 rounded-xl p-4 text-sm text-slate-200 placeholder-slate-600 resize-none focus:outline-none focus:ring-2 focus:ring-red-500/40"
              />

              {listening && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex gap-0.5 items-end h-4">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="w-1 bg-red-400 rounded-full animate-bounce"
                        style={{ height: `${40 + i * 15}%`, animationDelay: `${i * 100}ms` }}
                      />
                    ))}
                  </div>
                  <span className="text-red-400 text-xs">Listening...</span>
                </div>
              )}

              {error && <p className="text-red-400 text-sm mt-2">⚠️ {error}</p>}

              <button
                onClick={evaluate}
                disabled={loading || !answer.trim()}
                className="mt-4 w-full py-4 bg-gradient-to-r from-red-600 to-pink-600 text-white font-bold rounded-xl hover:from-red-500 hover:to-pink-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-lg"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Gemini is evaluating...
                  </>
                ) : "🤖 Evaluate My Answer"}
              </button>
            </div>
          </div>
        )}

        {/* Results */}
        {mode === "result" && evaluation && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-black text-white mb-1">Interview Evaluation</h2>
              <p className="text-slate-400 text-sm">{evaluation.verdict}</p>
            </div>

            {/* Score cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <ScoreCard label="Technical" value={evaluation.scores?.technical} icon="🧠" color="#6366f1" />
              <ScoreCard label="Communication" value={evaluation.scores?.communication} icon="💬" color="#8b5cf6" />
              <ScoreCard label="Confidence" value={evaluation.scores?.confidence} icon="💪" color="#ec4899" />
              <ScoreCard label="Structure" value={evaluation.scores?.structure} icon="📋" color="#f59e0b" />
              <ScoreCard label="Overall" value={evaluation.scores?.overall} icon="⭐" color="#10b981" />
            </div>

            {/* Feedback */}
            <div className="bg-indigo-900/20 border border-indigo-500/20 rounded-2xl p-5">
              <h3 className="text-white font-bold mb-2">📝 Overall Feedback</h3>
              <p className="text-slate-300 leading-relaxed">{evaluation.feedback}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-5">
                <h3 className="text-emerald-400 font-bold mb-3">✅ Strengths</h3>
                <ul className="space-y-2">
                  {evaluation.strengths?.map((s, i) => (
                    <li key={i} className="text-slate-300 text-sm flex items-start gap-2">
                      <span className="text-emerald-400">•</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-5">
                <h3 className="text-amber-400 font-bold mb-3">🎯 How to Improve</h3>
                <ul className="space-y-2">
                  {evaluation.improvements?.map((s, i) => (
                    <li key={i} className="text-slate-300 text-sm flex items-start gap-2">
                      <span className="text-amber-400">→</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Better answer */}
            <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-5">
              <h3 className="text-white font-bold mb-3">💡 How to Strengthen Your Answer</h3>
              <p className="text-slate-300 text-sm leading-relaxed">{evaluation.betterAnswer}</p>
            </div>

            {/* Follow-up */}
            {evaluation.followUpQuestions?.length > 0 && (
              <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-5">
                <h3 className="text-white font-bold mb-3">❓ Likely Follow-up Questions</h3>
                <ul className="space-y-2">
                  {evaluation.followUpQuestions.map((q, i) => (
                    <li key={i} className="text-slate-300 text-sm flex items-center gap-2">
                      <span className="text-blue-400">Q{i + 1}:</span> {q}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => { setEvaluation(null); setAnswer(""); setMode("answer"); }}
                className="flex-1 py-3 bg-red-600/30 border border-red-500/30 text-red-300 rounded-xl hover:bg-red-600/50 transition-all font-medium"
              >
                Retry This Question
              </button>
              <button
                onClick={() => { setMode("select"); setCurrentQ(null); setEvaluation(null); setAnswer(""); }}
                className="flex-1 py-3 bg-slate-800/60 border border-white/5 text-slate-300 rounded-xl hover:bg-slate-700/60 transition-all font-medium"
              >
                New Question
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
