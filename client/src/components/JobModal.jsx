import { useState, useEffect } from "react";

const JobModal = ({ isOpen, onClose, onSubmit, editingJob }) => {
  const [formData, setFormData] = useState({
    company: "",
    role: "",
    status: "Applied",
    date: new Date().toISOString().split("T")[0],
    notes: "",
    interviewDate: "",
    interviewTime: "",
    interviewType: "",
    interviewLink: "",
    interviewerName: "",
    interviewNotes: "",
    feedbackGood: "",
    feedbackBad: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showInterviewFields, setShowInterviewFields] = useState(false);

  // Populate form when editing
  useEffect(() => {
    if (editingJob) {
      setFormData({
        company: editingJob.company || "",
        role: editingJob.role || "",
        status: editingJob.status || "Applied",
        date: editingJob.date
          ? new Date(editingJob.date).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        notes: editingJob.notes || "",
        interviewDate: editingJob.interviewDate
          ? new Date(editingJob.interviewDate).toISOString().split("T")[0]
          : "",
        interviewTime: editingJob.interviewTime || "",
        interviewType: editingJob.interviewType || "",
        interviewLink: editingJob.interviewLink || "",
        interviewerName: editingJob.interviewerName || "",
        interviewNotes: editingJob.interviewNotes || "",
        feedbackGood: editingJob.feedbackGood || "",
        feedbackBad: editingJob.feedbackBad || "",
      });
      // Show interview fields if status is Interview or editing job has interview data
      setShowInterviewFields(
        editingJob.status === "Interview" ||
          !!editingJob.interviewDate ||
          !!editingJob.interviewType
      );
    } else {
      setFormData({
        company: "",
        role: "",
        status: "Applied",
        date: new Date().toISOString().split("T")[0],
        notes: "",
        interviewDate: "",
        interviewTime: "",
        interviewType: "",
        interviewLink: "",
        interviewerName: "",
        interviewNotes: "",
        feedbackGood: "",
        feedbackBad: "",
      });
      setShowInterviewFields(false);
    }
    setErrors({});
  }, [editingJob, isOpen]);

  // Auto-show interview fields when status changes to Interview
  useEffect(() => {
    if (formData.status === "Interview") {
      setShowInterviewFields(true);
    }
  }, [formData.status]);

  const validate = () => {
    const newErrors = {};
    if (!formData.company.trim()) newErrors.company = "Company name is required";
    if (!formData.role.trim()) newErrors.role = "Role/position is required";
    if (!formData.date) newErrors.date = "Date is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      // Error handled by parent
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-dark-950/80 backdrop-blur-sm animate-fade-in"></div>

      {/* Modal */}
      <div
        className="relative w-full max-w-lg glass-card p-6 animate-slide-up shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-white">
            {editingJob ? "Edit Application" : "Add New Application"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-dark-400 hover:text-white hover:bg-dark-700/50 rounded-lg transition-all duration-200"
            id="modal-close-btn"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Company */}
          <div>
            <label className="block text-dark-300 text-sm font-medium mb-1.5">
              Company Name *
            </label>
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleChange}
              placeholder="e.g. Google, Microsoft, Amazon"
              className={`input-field ${errors.company ? "!border-red-500/50 !ring-red-500/20" : ""}`}
              id="input-company"
            />
            {errors.company && (
              <p className="text-red-400 text-xs mt-1">{errors.company}</p>
            )}
          </div>

          {/* Role */}
          <div>
            <label className="block text-dark-300 text-sm font-medium mb-1.5">
              Role / Position *
            </label>
            <input
              type="text"
              name="role"
              value={formData.role}
              onChange={handleChange}
              placeholder="e.g. Software Engineer, Data Analyst"
              className={`input-field ${errors.role ? "!border-red-500/50 !ring-red-500/20" : ""}`}
              id="input-role"
            />
            {errors.role && (
              <p className="text-red-400 text-xs mt-1">{errors.role}</p>
            )}
          </div>

          {/* Status and Date row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-dark-300 text-sm font-medium mb-1.5">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="input-field cursor-pointer"
                id="input-status"
              >
                <option value="Applied">Applied</option>
                <option value="Interview">Interview</option>
                <option value="Offer">Offer</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label className="block text-dark-300 text-sm font-medium mb-1.5">
                Applied Date *
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className={`input-field ${errors.date ? "!border-red-500/50 !ring-red-500/20" : ""}`}
                id="input-date"
              />
              {errors.date && (
                <p className="text-red-400 text-xs mt-1">{errors.date}</p>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-dark-300 text-sm font-medium mb-1.5">
              Notes <span className="text-dark-600">(optional)</span>
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Add any notes about this application..."
              rows={2}
              className="input-field resize-none"
              id="input-notes"
            />
          </div>

          {/* Interview Details Toggle */}
          <div className="border-t border-dark-700/30 pt-4">
            <button
              type="button"
              onClick={() => setShowInterviewFields(!showInterviewFields)}
              className="flex items-center gap-2 text-sm font-medium text-amber-400 hover:text-amber-300 transition-colors"
            >
              <svg
                className={`w-4 h-4 transition-transform duration-200 ${showInterviewFields ? "rotate-90" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              🎯 Interview Details
              {formData.status === "Interview" && (
                <span className="text-[10px] px-1.5 py-0.5 bg-amber-500/20 text-amber-400 rounded-full">
                  Recommended
                </span>
              )}
            </button>
          </div>

          {/* Interview Fields (collapsible) */}
          {showInterviewFields && (
            <div className="space-y-3 pl-3 border-l-2 border-amber-500/20 animate-slide-up">
              {/* Interview Date & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-dark-400 text-xs font-medium mb-1">
                    Interview Date
                  </label>
                  <input
                    type="date"
                    name="interviewDate"
                    value={formData.interviewDate}
                    onChange={handleChange}
                    className="input-field !text-sm !py-2"
                  />
                </div>
                <div>
                  <label className="block text-dark-400 text-xs font-medium mb-1">
                    Time
                  </label>
                  <input
                    type="text"
                    name="interviewTime"
                    value={formData.interviewTime}
                    onChange={handleChange}
                    placeholder="e.g. 10:00 AM"
                    className="input-field !text-sm !py-2"
                  />
                </div>
              </div>

              {/* Type & Interviewer */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-dark-400 text-xs font-medium mb-1">
                    Interview Type
                  </label>
                  <select
                    name="interviewType"
                    value={formData.interviewType}
                    onChange={handleChange}
                    className="input-field cursor-pointer !text-sm !py-2"
                  >
                    <option value="">Select type</option>
                    <option value="Phone">Phone</option>
                    <option value="Video">Video Call</option>
                    <option value="On-site">On-site</option>
                    <option value="Technical">Technical</option>
                    <option value="HR">HR Round</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-dark-400 text-xs font-medium mb-1">
                    Interviewer Name
                  </label>
                  <input
                    type="text"
                    name="interviewerName"
                    value={formData.interviewerName}
                    onChange={handleChange}
                    placeholder="e.g. John Doe"
                    className="input-field !text-sm !py-2"
                  />
                </div>
              </div>

              {/* Meeting Link */}
              <div>
                <label className="block text-dark-400 text-xs font-medium mb-1">
                  Meeting Link
                </label>
                <input
                  type="url"
                  name="interviewLink"
                  value={formData.interviewLink}
                  onChange={handleChange}
                  placeholder="https://meet.google.com/..."
                  className="input-field !text-sm !py-2"
                />
              </div>

              {/* Interview Notes */}
              <div>
                <label className="block text-dark-400 text-xs font-medium mb-1">
                  Preparation Notes
                </label>
                <textarea
                  name="interviewNotes"
                  value={formData.interviewNotes}
                  onChange={handleChange}
                  placeholder="Topics to review..."
                  rows={2}
                  className="input-field resize-none !text-sm !py-2"
                />
              </div>

              {/* Post-Mortem Feedback (Only useful if interview is done, but we show it here for completeness) */}
              <div className="pt-2 border-t border-dark-700/30">
                <p className="text-xs font-bold text-dark-300 uppercase tracking-wider mb-2">Post-Interview Review</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-emerald-400 text-xs font-medium mb-1 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
                      What went well?
                    </label>
                    <textarea
                      name="feedbackGood"
                      value={formData.feedbackGood}
                      onChange={handleChange}
                      placeholder="Strengths, questions answered well..."
                      rows={2}
                      className="input-field resize-none !text-sm !py-2 !border-emerald-500/20 focus:!border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-red-400 text-xs font-medium mb-1 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                      What needs work?
                    </label>
                    <textarea
                      name="feedbackBad"
                      value={formData.feedbackBad}
                      onChange={handleChange}
                      placeholder="Mistakes, gaps in knowledge..."
                      rows={2}
                      className="input-field resize-none !text-sm !py-2 !border-red-500/20 focus:!border-red-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              id="modal-submit-btn"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>{editingJob ? "Updating..." : "Adding..."}</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={editingJob ? "M5 13l4 4L19 7" : "M12 6v6m0 0v6m0-6h6m-6 0H6"} />
                  </svg>
                  <span>{editingJob ? "Update Application" : "Add Application"}</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              id="modal-cancel-btn"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobModal;
