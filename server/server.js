const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const setupSocket = require("./config/socket");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Create HTTP server (needed for Socket.IO)
const server = http.createServer(app);

// --- Middleware ---

// CORS configuration
const corsOptions = {
  origin: true, // Allow all origins
  credentials: true,
};

app.use(cors(corsOptions));

// Parse JSON request bodies
app.use(express.json());

// Parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true }));

// --- Socket.IO Setup ---
const io = new Server(server, {
  cors: corsOptions,
});

// Initialize socket handlers
setupSocket(io);

// --- API Routes ---
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/jobs", require("./routes/jobRoutes"));
app.use("/api/chat", require("./routes/chatRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/resume", require("./routes/resumeRoutes"));

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Smart Placement Tracker API is running" });
});

// --- Error Handling ---
app.use(notFound);
app.use(errorHandler);

// --- Start Server ---
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
  console.log(`💬 Socket.IO ready for real-time chat`);
});
