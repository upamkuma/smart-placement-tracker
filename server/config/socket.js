const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Message = require("../models/Message");

// ===== SPT Bot Reply Logic =====
// Responds with helpful placement tips based on room and message content

const botReplies = {
  general: [
    "💡 Tip: Keep your LinkedIn profile updated with your latest projects and skills. Recruiters check it!",
    "📌 Did you know? Companies typically take 1-2 weeks to respond after applying. Stay patient and keep applying!",
    "🎯 Pro tip: Apply to at least 5-10 positions per week to maximize your chances. Quality over quantity though!",
    "📊 Track every application here on SPT to stay organized. It really helps during placement season!",
    "🌟 Networking is key! Connect with alumni and attend virtual career fairs to get referrals.",
    "💼 Most companies have multiple interview rounds. Prepare for technical, HR, and group discussions!",
    "🔑 Always customize your resume for each job application. One size does NOT fit all!",
    "📝 Follow up with a thank-you email after interviews. It shows professionalism and genuine interest.",
  ],
  "interview-tips": [
    "🎯 For technical interviews: Practice DSA on LeetCode/HackerRank for at least 1 hour daily.",
    "💡 STAR Method: Structure your behavioral answers as Situation → Task → Action → Result.",
    "📝 Always research the company before the interview. Know their products, culture, and recent news.",
    "🤝 Prepare 3-5 good questions to ask the interviewer. It shows genuine interest in the role!",
    "⏰ Join 5 minutes early for video interviews. Test your camera, mic, and internet beforehand.",
    "👔 Dress professionally even for video calls. First impressions matter!",
    "🧠 For system design interviews: Think aloud! Interviewers want to see your thought process.",
    "💪 Practice mock interviews with friends or on Pramp.com. It builds confidence!",
    "📌 Common mistake: Don't just say 'I worked on X.' Instead, explain the WHY and IMPACT.",
  ],
  "resume-help": [
    "📄 Keep your resume to 1 page if you have less than 5 years of experience.",
    "✅ Use action verbs: 'Built', 'Implemented', 'Optimized', 'Led' — not 'Responsible for'.",
    "📊 Quantify achievements! 'Improved API response time by 40%' is better than 'Improved performance'.",
    "🎨 Use our ATS Score feature to check how well your resume matches a job description!",
    "💡 Include a skills section with technologies from the job description. ATS systems scan for keywords.",
    "🔗 Add links to your GitHub, LinkedIn, and live project demos. Make it easy for recruiters!",
    "❌ Avoid: Selfies as profile photos, fancy fonts, tables/columns (ATS can't read them), or typos.",
    "📝 Tailor your summary/objective for each application. Generic statements don't stand out.",
  ],
  "offer-negotiation": [
    "💰 Research salary ranges on Glassdoor and Levels.fyi before negotiating. Know your market value!",
    "📊 For freshers, typical CTC in India: ₹3-6 LPA (service), ₹8-15 LPA (product), ₹15-40+ LPA (top tier).",
    "🤝 Always negotiate politely: 'Based on my skills and market research, I was expecting around X...'",
    "📝 Consider the full package: base salary, bonuses, stock options, learning opportunities, and WLB.",
    "💡 It's okay to ask for time to consider an offer. Say: 'I'd like a few days to review this.'",
    "✅ Get the offer in writing before accepting verbally. Review all terms carefully.",
    "🎯 If you have multiple offers, be transparent (but tactful) to get the best deal.",
    "💼 Remember: Your first job sets the baseline. Negotiate well — even a small bump compounds over time!",
  ],
  "off-topic": [
    "😄 Taking breaks is important! The Pomodoro technique works great: 25 min work, 5 min break.",
    "🎮 What's everyone's favorite coding playlist? Music really helps with focus!",
    "☕ Fun fact: The average developer drinks 3+ cups of coffee per day. Stay hydrated too!",
    "📚 Book recommendation: 'Cracking the Coding Interview' by Gayle McDowell — a must-read!",
    "🏃 Don't forget physical health during placement season. Even a 20-minute walk helps!",
    "🤖 AI is changing tech hiring. Brush up on ML basics even if you're not an ML engineer.",
    "🌍 Remote work is here to stay. Build skills in async communication and self-management.",
    "💬 Remember: Placement season stress is temporary. Your worth isn't defined by a single company's decision!",
  ],
};

// Keyword-based contextual replies
const keywordReplies = [
  {
    keywords: ["hello", "hi", "hey", "hii", "helo"],
    reply: (name) => `Hey ${name}! 👋 Welcome to the chat! Feel free to discuss anything placement-related. I'm here to help!`,
  },
  {
    keywords: ["help", "stuck", "confused", "don't know", "what should"],
    reply: (name) => `Don't worry ${name}! 💪 Every placement journey has ups and downs. What specific area do you need help with? Resume, interviews, or applications?`,
  },
  {
    keywords: ["reject", "rejected", "not selected", "failed"],
    reply: (name) => `Hey ${name}, rejections are part of the journey! 🌟 Even top engineers faced many rejections before landing their dream job. Keep improving and applying!`,
  },
  {
    keywords: ["offer", "selected", "got placed", "placed", "accepted"],
    reply: (name) => `🎉 Congratulations ${name}! That's amazing news! Hard work pays off. Don't forget to help others in their journey too!`,
  },
  {
    keywords: ["dsa", "leetcode", "algorithm", "data structure"],
    reply: () => `📚 For DSA prep: Start with Easy problems → Medium → Hard. Focus on Arrays, Strings, Trees, Graphs, and DP. Aim for 200+ problems for good coverage!`,
  },
  {
    keywords: ["resume", "cv", "ats"],
    reply: () => `📄 Check out our ATS Score page! Upload your resume and match it against a job description to see how well it performs. Click 'ATS Score' in the navbar.`,
  },
  {
    keywords: ["salary", "ctc", "package", "lpa"],
    reply: () => `💰 Salary depends on company, role, and location. Research on Glassdoor/Levels.fyi. For freshers: Service (3-6 LPA) | Product (8-15 LPA) | Top Tier (15-40+ LPA).`,
  },
  {
    keywords: ["thank", "thanks", "thx"],
    reply: (name) => `You're welcome, ${name}! 😊 Happy to help. All the best for your placements! 🚀`,
  },
];

// Get bot reply based on room and message
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

  // Room-specific random tip
  const roomTips = botReplies[room] || botReplies.general;
  const randomTip = roomTips[Math.floor(Math.random() * roomTips.length)];
  return randomTip;
};



// Setup Socket.IO with authentication and chat logic
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

      // Attach user to socket
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

  // Track online users per room
  const onlineUsers = new Map(); // room -> Set of { id, name }

  io.on("connection", (socket) => {
    console.log(`🔌 User connected: ${socket.user.name} (${socket.id})`);

    // Join a chat room
    socket.on("join-room", (room) => {
      // Leave previous rooms (except socket's own room)
      socket.rooms.forEach((r) => {
        if (r !== socket.id) {
          socket.leave(r);
          // Remove from online users tracking
          if (onlineUsers.has(r)) {
            onlineUsers.get(r).delete(socket.user._id);
            io.to(r).emit("online-users", Array.from(onlineUsers.get(r).values()));
          }
        }
      });

      // Join new room
      socket.join(room);
      console.log(`📢 ${socket.user.name} joined room: ${room}`);

      // Track online user
      if (!onlineUsers.has(room)) {
        onlineUsers.set(room, new Map());
      }
      onlineUsers.get(room).set(socket.user._id, {
        id: socket.user._id,
        name: socket.user.name,
      });

      // Broadcast updated online users to the room
      io.to(room).emit(
        "online-users",
        Array.from(onlineUsers.get(room).values())
      );
    });

    // Handle incoming message
    socket.on("send-message", async (data) => {
      const { room, text } = data;

      if (!text || !text.trim() || !room) return;

      try {
        // Save message to database
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

        // Broadcast message to everyone in the room (including sender)
        io.to(room).emit("new-message", messageData);

        // ===== SPT Bot Auto-Reply =====
        // Bot replies with helpful tips based on room context
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
          }, 1500 + Math.random() * 1500); // 1.5-3s delay for realistic feel
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

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`❌ User disconnected: ${socket.user.name}`);

      // Remove from all rooms' online users
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
