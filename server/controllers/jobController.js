const Job = require("../models/Job");
const { createNotification } = require("./notificationController");

// Status change notification messages
const statusNotifications = {
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

// @desc    Get all jobs for logged-in user
// @route   GET /api/jobs
// @access  Private
const getJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
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

    const validStatuses = ["Applied", "Interview", "Offer", "Rejected"];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
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

    // Create notification for new job
    const notifConfig = statusNotifications[job.status];
    if (notifConfig) {
      await createNotification(
        req.user._id,
        notifConfig.title,
        notifConfig.message(company, role),
        "status_change",
        notifConfig.icon,
        job._id
      );
    }

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

    const validStatuses = ["Applied", "Interview", "Offer", "Rejected"];
    if (req.body.status && !validStatuses.includes(req.body.status)) {
      return res.status(400).json({
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const oldStatus = job.status;
    const updatedJob = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    // If status changed, create notification
    if (req.body.status && req.body.status !== oldStatus) {
      const notifConfig = statusNotifications[req.body.status];
      if (notifConfig) {
        await createNotification(
          req.user._id,
          notifConfig.title,
          notifConfig.message(updatedJob.company, updatedJob.role),
          "status_change",
          notifConfig.icon,
          updatedJob._id
        );
      }
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

    const validStatuses = ["Applied", "Interview", "Offer", "Rejected"];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
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

    // Create notification if status actually changed
    if (oldStatus !== status) {
      const notifConfig = statusNotifications[status];
      if (notifConfig) {
        await createNotification(
          req.user._id,
          notifConfig.title,
          notifConfig.message(job.company, job.role),
          "status_change",
          notifConfig.icon,
          job._id
        );
      }
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
