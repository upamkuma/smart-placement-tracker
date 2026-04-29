const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    company: {
      type: String,
      required: [true, "Please provide a company name"],
      trim: true,
      maxlength: [100, "Company name cannot exceed 100 characters"],
    },
    role: {
      type: String,
      required: [true, "Please provide a role/position"],
      trim: true,
      maxlength: [100, "Role cannot exceed 100 characters"],
    },
    status: {
      type: String,
      enum: ["Applied", "Interview", "Offer", "Rejected"],
      default: "Applied",
    },
    date: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, "Notes cannot exceed 500 characters"],
    },
    // ====== Interview-specific fields ======
    interviewDate: {
      type: Date,
    },
    interviewTime: {
      type: String, // e.g. "10:00 AM"
      trim: true,
    },
    interviewType: {
      type: String,
      enum: ["Phone", "Video", "On-site", "Technical", "HR", "Other", ""],
      default: "",
    },
    interviewLink: {
      type: String, // Zoom/Meet link
      trim: true,
    },
    interviewerName: {
      type: String,
      trim: true,
    },
    interviewNotes: {
      type: String,
      trim: true,
      maxlength: [500, "Interview notes cannot exceed 500 characters"],
    },
    feedbackGood: {
      type: String,
      trim: true,
    },
    feedbackBad: {
      type: String,
      trim: true,
    },
    // ====== End Interview fields ======

    // Each job belongs to a specific user
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Job", jobSchema);
