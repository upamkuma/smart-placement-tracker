const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Message = require("../models/Message");
const { botReplies, keywordReplies } = require("./botData");

/**
 * Determines a bot reply based on the room context and message content.
 * Keyword matches take priority; otherwise a random room-specific tip is returned.
 *
 * @param {string} room - The chat room ID
 * @param {string} text - The user's message text
 * @param {string} userName - The sender's display name
 * @returns {string|null} Bot reply string, or null if the message is too short
 */
const getBotReply = (room, text, userName) => {
  const lowerText = text.toLowerCase();

  // Don't reply to very short messages (less than 2 chars)
  if (lowerText.length < 2) return null;

  // Check keyword-based replies first (contextual)
  for (const kr of keywordReplies) {
    if (kr.keywords.some((kw) => lowerText.includes(kw))) {
      return kr.reply(userName);
    }
  }

  // Fall back to a random room-specific tip
  const roomTips = botReplies[room] || botReplies.general;
  return roomTips[Math.floor(Math.random() * roomTips.length)];
};

/**
 * Configures Socket.IO with JWT authentication and all real-time chat event handlers.
 * Tracks online users per room and broadcasts messages (including bot replies).
 *
 * @param {import("socket.io").Server} io - The Socket.IO server instance
 */
const setupSocket = (io) => {
  // Authenticate socket connections using JWT
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error("Authentication required"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return next(new Error("User not found"));
      }

      // Attach user to socket for use in event handlers
      socket.user = {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
      };

      next();
    } catch (error) {
      console.error("Socket auth error:", error.message);
      next(new Error("Invalid token"));
    }
  });

  // Track online users per room: Map<roomId, Map<userId, { id, name }>>
  const onlineUsers = new Map();

  io.on("connection", (socket) => {
    console.log(`🔌 User connected: ${socket.user.name} (${socket.id})`);

    // Join a chat room
    socket.on("join-room", (room) => {
      // Leave all current rooms except the socket's own room
      socket.rooms.forEach((r) => {
        if (r !== socket.id) {
          socket.leave(r);
          // Remove user from the departed room's online list
          if (onlineUsers.has(r)) {
            onlineUsers.get(r).delete(socket.user._id);
            io.to(r).emit("online-users", Array.from(onlineUsers.get(r).values()));
          }
        }
      });

      // Join the new room
      socket.join(room);
      console.log(`📢 ${socket.user.name} joined room: ${room}`);

      // Track this user as online in the new room
      if (!onlineUsers.has(room)) {
        onlineUsers.set(room, new Map());
      }
      onlineUsers.get(room).set(socket.user._id, {
        id: socket.user._id,
        name: socket.user.name,
      });

      // Broadcast updated online users list to the room
      io.to(room).emit("online-users", Array.from(onlineUsers.get(room).values()));
    });

    // Handle incoming chat message
    socket.on("send-message", async (data) => {
      const { room, text } = data;

      if (!text || !text.trim() || !room) return;

      try {
        // Persist message to database
        const message = await Message.create({
          room,
          sender: socket.user._id,
          senderName: socket.user.name,
          text: text.trim(),
        });

        const messageData = {
          _id: message._id,
          room: message.room,
          sender: message.sender,
          senderName: message.senderName,
          text: message.text,
          createdAt: message.createdAt,
        };

        // Broadcast to everyone in the room (including sender)
        io.to(room).emit("new-message", messageData);

        // SPT Bot auto-reply with a 1.5–3 s delay for a realistic feel
        const botReply = getBotReply(room, text.trim(), socket.user.name);
        if (botReply) {
          setTimeout(async () => {
            try {
              const botMessage = await Message.create({
                room,
                sender: "bot",
                senderName: "SPT Bot 🤖",
                text: botReply,
              });

              io.to(room).emit("new-message", {
                _id: botMessage._id,
                room: botMessage.room,
                sender: botMessage.sender,
                senderName: botMessage.senderName,
                text: botMessage.text,
                createdAt: botMessage.createdAt,
              });
            } catch (err) {
              console.error("Bot reply error:", err);
            }
          }, 1500 + Math.random() * 1500);
        }
      } catch (error) {
        console.error("Send message error:", error);
        socket.emit("message-error", { message: "Failed to send message" });
      }
    });

    // Handle typing indicator
    socket.on("typing", (room) => {
      socket.to(room).emit("user-typing", {
        id: socket.user._id,
        name: socket.user.name,
      });
    });

    socket.on("stop-typing", (room) => {
      socket.to(room).emit("user-stop-typing", {
        id: socket.user._id,
      });
    });

    // Handle disconnection — remove user from all rooms
    socket.on("disconnect", () => {
      console.log(`❌ User disconnected: ${socket.user.name}`);

      onlineUsers.forEach((users, room) => {
        if (users.has(socket.user._id)) {
          users.delete(socket.user._id);
          io.to(room).emit("online-users", Array.from(users.values()));
        }
      });
    });
  });
};

module.exports = setupSocket;
