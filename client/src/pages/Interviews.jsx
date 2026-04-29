import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import { jobAPI } from "../services/api";
import JobModal from "../components/JobModal";
import Loader from "../components/Loader";

const Interviews = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [activeTab, setActiveTab] = useState("upcoming"); // "upcoming" or "history"

  // Fetch interview jobs
  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const res = await jobAPI.getInterviews();
      setInterviews(res.data);
    } catch (error) {
      toast.error("Failed to fetch interviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Edit interview
  const handleEdit = (job) => {
    setEditingJob(job);
    setIsModalOpen(true);
  };

  // Update job
  const handleJobSubmit = async (formData) => {
    try {
      if (editingJob) {
        const res = await jobAPI.update(editingJob._id, formData);
        setInterviews((prev) =>
          prev.map((j) => (j._id === editingJob._id ? res.data : j))
        );
        toast.success("Interview updated! ✏️");
      }
      setEditingJob(null);
    } catch (error) {
      toast.error("Failed to update");
      throw error;
    }
  };

  // Delete
  const handleDelete = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this interview?")) return;
    try {
      await jobAPI.delete(jobId);
      setInterviews((prev) => prev.filter((j) => j._id !== jobId));
      toast.success("Interview deleted 🗑️");
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return "Not set";
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Interview type badge colors
  const typeColors = {
    Phone: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    Video: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    "On-site": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    Technical: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    HR: "bg-pink-500/10 text-pink-400 border-pink-500/20",
    Other: "bg-dark-500/10 text-dark-300 border-dark-500/20",
  };

  // Sort interviews: upcoming first, then by date
  const sortedInterviews = [...interviews].sort((a, b) => {
    if (a.interviewDate && b.interviewDate) {
      return new Date(a.interviewDate) - new Date(b.interviewDate);
    }
    if (a.interviewDate) return -1;
    if (b.interviewDate) return 1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  // Separate upcoming and past
  const now = new Date();
  const upcoming = sortedInterviews.filter(
    (j) => !j.interviewDate || new Date(j.interviewDate) >= now
  );
  const past = sortedInterviews.filter(
    (j) => j.interviewDate && new Date(j.interviewDate) < now
  );

  if (loading) return <Loader text="Loading interviews..." />;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 animate-fade-in">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
            <span className="text-3xl">🎯</span>
            Interview Tracker
          </h1>
          <p className="text-dark-400 text-sm mt-1">
            Manage and prepare for your upcoming interviews
          </p>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3">
          <div className="glass-card px-4 py-2 bg-gradient-to-br from-amber-500/10 to-amber-600/5">
            <p className="text-xs text-dark-400 uppercase tracking-wider">Total</p>
            <p className="text-xl font-bold text-amber-400">{interviews.length}</p>
          </div>
          <div className="glass-card px-4 py-2 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5">
            <p className="text-xs text-dark-400 uppercase tracking-wider">Upcoming</p>
            <p className="text-xl font-bold text-emerald-400">{upcoming.length}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 border-b border-dark-700/50 mb-6 pb-2">
        <button
          onClick={() => setActiveTab("upcoming")}
          className={`px-4 py-2 font-medium rounded-t-lg transition-colors duration-200 flex items-center gap-2 ${
            activeTab === "upcoming"
              ? "text-primary-400 border-b-2 border-primary-500"
              : "text-dark-300 hover:text-white"
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          Upcoming ({upcoming.length})
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`px-4 py-2 font-medium rounded-t-lg transition-colors duration-200 flex items-center gap-2 ${
            activeTab === "history"
              ? "text-primary-400 border-b-2 border-primary-500"
              : "text-dark-300 hover:text-white"
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          History & Feedback ({past.length})
        </button>
      </div>

      {interviews.length === 0 ? (
        /* Empty State */
        <div className="text-center py-20 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-dark-800/60 rounded-full mb-4">
            <span className="text-4xl">🎯</span>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            No interviews scheduled
          </h3>
          <p className="text-dark-400 mb-4 max-w-md mx-auto">
            When you move a job application to "Interview" status, it will appear here.
            You can add interview details like date, time, type, and meeting link.
          </p>
        </div>
      ) : (
        <div className="space-y-8 animate-fade-in">
          {/* Upcoming Interviews */}
          {activeTab === "upcoming" && (
            <div>
              {upcoming.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {upcoming.map((job) => (
                    <InterviewCard
                      key={job._id}
                      job={job}
                      typeColors={typeColors}
                      formatDate={formatDate}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      isUpcoming={true}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 glass-card">
                  <p className="text-dark-400">You have no upcoming interviews.</p>
                </div>
              )}
            </div>
          )}

          {/* Past Interviews (History) */}
          {activeTab === "history" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-dark-400">Review your past performance to improve for the next one.</p>
              </div>
              {past.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {past.map((job) => (
                    <InterviewCard
                      key={job._id}
                      job={job}
                      typeColors={typeColors}
                      formatDate={formatDate}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      isUpcoming={false}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 glass-card">
                  <p className="text-dark-400">You don't have any past interviews in your history yet.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Edit Modal */}
      <JobModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingJob(null);
        }}
        onSubmit={handleJobSubmit}
        editingJob={editingJob}
      />
    </div>
  );
};

// Interview Card Sub-component
const InterviewCard = ({ job, typeColors, formatDate, onEdit, onDelete, isUpcoming }) => {
  const [expanded, setExpanded] = useState(false);

  // Days until interview
  const daysUntil = job.interviewDate
    ? Math.ceil((new Date(job.interviewDate) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div
      className={`glass-card p-5 glow-hover transition-all duration-300 ${
        !isUpcoming ? "opacity-60" : ""
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-white truncate">{job.company}</h3>
            {job.interviewType && (
              <span
                className={`px-2 py-0.5 text-[10px] font-medium rounded-full border ${
                  typeColors[job.interviewType] || typeColors.Other
                }`}
              >
                {job.interviewType}
              </span>
            )}
          </div>
          <p className="text-dark-400 text-sm">{job.role}</p>
        </div>

        {/* Days countdown */}
        {isUpcoming && daysUntil !== null && (
          <div
            className={`flex-shrink-0 text-center px-3 py-1.5 rounded-xl ${
              daysUntil <= 1
                ? "bg-red-500/10 text-red-400"
                : daysUntil <= 3
                ? "bg-amber-500/10 text-amber-400"
                : "bg-emerald-500/10 text-emerald-400"
            }`}
          >
            <p className="text-lg font-bold leading-none">{Math.max(0, daysUntil)}</p>
            <p className="text-[10px] font-medium">
              {daysUntil === 0 ? "Today!" : daysUntil === 1 ? "day" : "days"}
            </p>
          </div>
        )}
      </div>

      {/* Interview Details */}
      <div className="space-y-2">
        {/* Date & Time */}
        <div className="flex items-center gap-4 text-sm">
          {job.interviewDate && (
            <div className="flex items-center gap-1.5 text-dark-300">
              <svg className="w-4 h-4 text-dark-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {formatDate(job.interviewDate)}
            </div>
          )}
          {job.interviewTime && (
            <div className="flex items-center gap-1.5 text-dark-300">
              <svg className="w-4 h-4 text-dark-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {job.interviewTime}
            </div>
          )}
        </div>

        {/* Interviewer */}
        {job.interviewerName && (
          <div className="flex items-center gap-1.5 text-sm text-dark-300">
            <svg className="w-4 h-4 text-dark-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Interviewer: {job.interviewerName}
          </div>
        )}

        {/* Meeting Link */}
        {job.interviewLink && (
          <a
            href={job.interviewLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-primary-400 hover:text-primary-300 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Join Meeting
          </a>
        )}

        {/* Notes */}
        {(job.interviewNotes || job.notes) && (
          <div className="mt-2">
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs text-dark-500 hover:text-dark-300 flex items-center gap-1 transition-colors"
            >
              <svg
                className={`w-3 h-3 transition-transform ${expanded ? "rotate-90" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              {expanded ? "Hide notes" : "Show notes"}
            </button>
            {expanded && (
              <div className="mt-2 p-3 bg-dark-900/50 rounded-lg text-xs text-dark-400 space-y-1">
                {job.interviewNotes && <p>{job.interviewNotes}</p>}
                {job.notes && (
                  <p className="text-dark-500 border-t border-dark-700/30 pt-1 mt-1">
                    {job.notes}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Post-Mortem Feedback (Only show if it exists) */}
        {(job.feedbackGood || job.feedbackBad) && (
          <div className="mt-3 grid grid-cols-1 gap-2 pt-2 border-t border-dark-700/30">
            {job.feedbackGood && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-lg">
                <p className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 mb-1 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
                  Strengths
                </p>
                <p className="text-xs text-dark-300">{job.feedbackGood}</p>
              </div>
            )}
            {job.feedbackBad && (
              <div className="bg-red-500/10 border border-red-500/20 p-2.5 rounded-lg">
                <p className="text-[10px] uppercase font-bold tracking-wider text-red-400 mb-1 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                  Areas to Improve
                </p>
                <p className="text-xs text-dark-300">{job.feedbackBad}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Interview Prep Tips */}
      {isUpcoming && (
        <div className="mt-3 p-3 bg-primary-500/5 border border-primary-500/15 rounded-xl">
          <p className="text-[10px] text-primary-400 font-semibold uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Prep Tips
          </p>
          <div className="space-y-1">
            {(job.interviewType === "Technical" ? [
              "Review DSA: Arrays, Trees, Graphs, Dynamic Programming",
              "Practice system design concepts & whiteboard coding",
              "Prepare to explain your projects in depth",
            ] : job.interviewType === "HR" ? [
              "Prepare your \"Tell me about yourself\" pitch",
              "Research company values, culture & recent news",
              "Have salary expectations and questions ready",
            ] : job.interviewType === "Phone" ? [
              "Find a quiet space with good phone signal",
              "Keep your resume and notes in front of you",
              "Speak clearly and at a moderate pace",
            ] : job.interviewType === "Video" ? [
              "Test camera, mic & internet before the call",
              "Use a clean, professional background",
              "Make eye contact with the camera, not screen",
            ] : [
              "Research the company and role thoroughly",
              "Prepare STAR method answers for behavioral questions",
              "Have 3-5 questions ready to ask the interviewer",
            ]).map((tip, i) => (
              <p key={i} className="text-[11px] text-dark-400 flex items-start gap-1.5">
                <span className="text-primary-500 mt-0.5">•</span>
                {tip}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Date not set warning */}
      {!job.interviewDate && (
        <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-amber-500/5 border border-amber-500/20 rounded-lg">
          <svg className="w-4 h-4 text-amber-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <p className="text-xs text-amber-400">
            Interview date not set — click Edit to add details
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="mt-4 flex items-center gap-2 pt-3 border-t border-dark-700/30">
        <button
          onClick={() => onEdit(job)}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium
            text-primary-400 bg-primary-500/10 hover:bg-primary-500/20 
            rounded-lg transition-all duration-200"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Edit Details
        </button>
        <button
          onClick={() => onDelete(job._id)}
          className="px-3 py-2 text-xs font-medium text-red-400 bg-red-500/10 
            hover:bg-red-500/20 rounded-lg transition-all duration-200"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Interviews;
