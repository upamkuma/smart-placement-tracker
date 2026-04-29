const Message = require("../models/Message");

// @desc    Get messages for a room
// @route   GET /api/chat/:room
// @access  Private
const getMessages = async (req, res) => {
  try {
    const { room } = req.params;
    const { limit = 50, before } = req.query;

    const query = { room };

    // Pagination: get messages before a certain date
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .lean();

    // Return in chronological order
    res.json(messages.reverse());
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({ message: "Server error fetching messages" });
  }
};

// @desc    Get list of available chat rooms
// @route   GET /api/chat/rooms/list
// @access  Private
const getRooms = async (req, res) => {
  try {
    // Predefined public rooms
    const rooms = [
      {
        id: "general",
        name: "General",
        description: "General placement discussions",
        icon: "💬",
      },
      {
        id: "interview-tips",
        name: "Interview Tips",
        description: "Share interview experiences & tips",
        icon: "🎯",
      },
      {
        id: "resume-help",
        name: "Resume Help",
        description: "Get feedback on your resume",
        icon: "📄",
      },
      {
        id: "offer-negotiation",
        name: "Offer & Negotiation",
        description: "Discuss offers and salary negotiation",
        icon: "💰",
      },
      {
        id: "off-topic",
        name: "Off Topic",
        description: "Anything else you want to talk about",
        icon: "🎮",
      },
    ];

    // Get message counts for each room
    const roomsWithCounts = await Promise.all(
      rooms.map(async (room) => {
        const count = await Message.countDocuments({ room: room.id });
        const lastMessage = await Message.findOne({ room: room.id })
          .sort({ createdAt: -1 })
          .lean();
        return {
          ...room,
          messageCount: count,
          lastMessage: lastMessage
            ? {
                text: lastMessage.text.substring(0, 50),
                senderName: lastMessage.senderName,
                createdAt: lastMessage.createdAt,
              }
            : null,
        };
      })
    );

    res.json(roomsWithCounts);
  } catch (error) {
    console.error("Get rooms error:", error);
    res.status(500).json({ message: "Server error fetching rooms" });
  }
};

module.exports = { getMessages, getRooms };
