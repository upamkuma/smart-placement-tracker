const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    // The chat room this message belongs to
    room: {
      type: String,
      required: true,
    },
    // Who sent the message (user ID or "bot")
    sender: {
      type: String,
      required: true,
    },
    // Sender's name (denormalized for performance)
    senderName: {
      type: String,
      required: true,
    },
    // Message content
    text: {
      type: String,
      required: [true, "Message text is required"],
      trim: true,
      maxlength: [1000, "Message cannot exceed 1000 characters"],
    },
  },
  {
    timestamps: true,
  }
);

// Index on (room, createdAt) — optimises paginated message fetching by room
messageSchema.index({ room: 1, createdAt: -1 });

module.exports = mongoose.model("Message", messageSchema);
