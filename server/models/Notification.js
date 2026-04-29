const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    // Who receives this notification
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    // Notification title
    title: {
      type: String,
      required: true,
      trim: true,
    },
    // Notification message
    message: {
      type: String,
      required: true,
      trim: true,
    },
    // Type: status_change, interview_reminder, general
    type: {
      type: String,
      enum: ["status_change", "interview_reminder", "general"],
      default: "general",
    },
    // Related job (optional)
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
    },
    // Has the user read this notification?
    read: {
      type: Boolean,
      default: false,
    },
    // Icon/emoji for the notification
    icon: {
      type: String,
      default: "🔔",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Notification", notificationSchema);
