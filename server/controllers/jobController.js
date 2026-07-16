const Job = require("../models/Job");
const { createNotification } = require("./notificationController");

/** Valid job status values — used for validation and notification lookup */
const VALID_STATUSES = ["Applied", "Interview", "Offer", "Rejected"];

/**
 * Notification config keyed by status.
 * Each entry provides the title, message factory, and icon for the notification.
 */
const STATUS_NOTIFICATIONS = {
  Applied: {
    title: "Application Submitted! 📝",
    message: (company, role) =>
      `Your application for ${role} at ${company} has been submitted.`,
    icon: "📝",
  },
  Interview: {
    title: "Interview Scheduled! 🎯",
    message: (company, role) =>
      `Congratulations! You have an interview for ${role} at ${company}. Prepare well!`,
    icon: "🎯",
  },
  Offer: {
    title: "Offer Received! 🎉",
    message: (company, role) =>
      `Amazing news! You received an offer for ${role} at ${company}! 🥳`,
    icon: "🎉",
  },
  Rejected: {
    title: "Application Update 😔",
    message: (company, role) =>
      `Unfortunately, your application for ${role} at ${company} was not selected. Keep going!`,
    icon: "😔",
  },
};

/**
 * Creates a status-change notification for the given user and job.
 * No-ops silently if there is no notification config for the provided status.
 *
 * @param {string} userId - The recipient user ID
 * @param {string} status - The new job status
 * @param {string} company - Company name (for the notification message)
 * @param {string} role - Job role (for the notification message)
 * @param {string} jobId - Related job ID
 */
const sendStatusNotification = async (userId, status, company, role, jobId) => {
  const config = STATUS_NOTIFICATIONS[status];
  if (!config) return;
  await createNotification(
    userId,
    config.title,
    config.message(company, role),
    "status_change",
    config.icon,
    jobId
  );
};

// @desc    Get all jobs for logged-in user
// @route   GET /api/jobs
// @access  Private
const getJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    console.error("Get jobs error:", error);
    res.status(500).json({ message: "Server error fetching jobs" });
  }
};

// @desc    Get interview jobs only
// @route   GET /api/jobs/interviews
// @access  Private
const getInterviews = async (req, res) => {
  try {
    const jobs = await Job.find({
      user: req.user._id,
      status: "Interview",
    }).sort({ interviewDate: 1, createdAt: -1 });

    res.json(jobs);
  } catch (error) {
    console.error("Get interviews error:", error);
    res.status(500).json({ message: "Server error fetching interviews" });
  }
};

// @desc    Create a new job
// @route   POST /api/jobs
// @access  Private
const createJob = async (req, res) => {
  try {
    const {
      company,
      role,
      status,
      date,
      notes,
      interviewDate,
      interviewTime,
      interviewType,
      interviewLink,
      interviewerName,
      interviewNotes,
      feedbackGood,
      feedbackBad,
    } = req.body;

    if (!company || !role) {
      return res
        .status(400)
        .json({ message: "Please provide company name and role" });
    }

    if (status && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`,
      });
    }

    const job = await Job.create({
      company,
      role,
      status: status || "Applied",
      date: date || Date.now(),
      notes: notes || "",
      interviewDate,
      interviewTime,
      interviewType,
      interviewLink,
      interviewerName,
      interviewNotes,
      feedbackGood,
      feedbackBad,
      user: req.user._id,
    });

    // Notify the user about the initial job status
    await sendStatusNotification(req.user._id, job.status, company, role, job._id);

    res.status(201).json(job);
  } catch (error) {
    console.error("Create job error:", error);
    res.status(500).json({ message: "Server error creating job" });
  }
};

// @desc    Update a job
// @route   PUT /api/jobs/:id
// @access  Private
const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this job" });
    }

    if (req.body.status && !VALID_STATUSES.includes(req.body.status)) {
      return res.status(400).json({
        message: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`,
      });
    }

    const oldStatus = job.status;
    const updatedJob = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    // Notify only when the status actually changed
    if (req.body.status && req.body.status !== oldStatus) {
      await sendStatusNotification(
        req.user._id,
        req.body.status,
        updatedJob.company,
        updatedJob.role,
        updatedJob._id
      );
    }

    res.json(updatedJob);
  } catch (error) {
    console.error("Update job error:", error);
    res.status(500).json({ message: "Server error updating job" });
  }
};

// @desc    Delete a job
// @route   DELETE /api/jobs/:id
// @access  Private
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this job" });
    }

    await Job.findByIdAndDelete(req.params.id);
    res.json({ message: "Job deleted successfully", id: req.params.id });
  } catch (error) {
    console.error("Delete job error:", error);
    res.status(500).json({ message: "Server error deleting job" });
  }
};

// @desc    Update job status (for drag & drop)
// @route   PATCH /api/jobs/:id/status
// @access  Private
const updateJobStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`,
      });
    }

    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this job" });
    }

    const oldStatus = job.status;
    job.status = status;
    await job.save();

    // Notify only when the status actually changed
    if (oldStatus !== status) {
      await sendStatusNotification(req.user._id, status, job.company, job.role, job._id);
    }

    res.json(job);
  } catch (error) {
    console.error("Update job status error:", error);
    res.status(500).json({ message: "Server error updating job status" });
  }
};

module.exports = {
  getJobs,
  getInterviews,
  createJob,
  updateJob,
  deleteJob,
  updateJobStatus,
};
