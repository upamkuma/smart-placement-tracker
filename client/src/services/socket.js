import { io } from "socket.io-client";

// In production, VITE_API_URL is undefined (falls back to Render), locally it's "/api" (proxy)
// For socket, we always need the full server URL (can't use Vite proxy for WebSockets)
const SOCKET_URL = import.meta.env.DEV
  ? "http://localhost:5001"
  : "https://smart-placement-tracker-2.onrender.com";

let socket = null;

// Connect to socket server with auth token
export const connectSocket = (token) => {
  if (socket?.connected) return socket;

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on("connect", () => {
    console.log("🔌 Socket connected:", socket.id);
  });

  socket.on("connect_error", (err) => {
    console.error("Socket connection error:", err.message);
  });

  socket.on("disconnect", (reason) => {
    console.log("❌ Socket disconnected:", reason);
  });

  return socket;
};

// Get current socket instance
export const getSocket = () => socket;

// Disconnect socket
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export default { connectSocket, getSocket, disconnectSocket };
