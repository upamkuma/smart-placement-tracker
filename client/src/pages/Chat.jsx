import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import { connectSocket, getSocket, disconnectSocket } from "../services/socket";
import api from "../services/api";

// Chat room config
const ROOMS = [
  { id: "general", name: "General", icon: "💬", description: "General placement discussions" },
  { id: "interview-tips", name: "Interview Tips", icon: "🎯", description: "Share interview experiences" },
  { id: "resume-help", name: "Resume Help", icon: "📄", description: "Get feedback on your resume" },
  { id: "offer-negotiation", name: "Offer & Negotiation", icon: "💰", description: "Discuss offers & salary" },
  { id: "off-topic", name: "Off Topic", icon: "🎮", description: "Anything else" },
];

const Chat = () => {
  const { user, token } = useAuth();
  const toast = useToast();

  const [activeRoom, setActiveRoom] = useState("general");
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom of messages
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Initialize socket connection
  useEffect(() => {
    if (!token) return;

    const socket = connectSocket(token);

    // Listen for new messages
    socket.on("new-message", (message) => {
      setMessages((prev) => [...prev, message]);
      setTimeout(scrollToBottom, 100);
    });

    // Listen for online users updates
    socket.on("online-users", (users) => {
      setOnlineUsers(users);
    });

    // Listen for typing indicators
    socket.on("user-typing", (data) => {
      setTypingUsers((prev) => {
        if (prev.find((u) => u.id === data.id)) return prev;
        return [...prev, data];
      });
    });

    socket.on("user-stop-typing", (data) => {
      setTypingUsers((prev) => prev.filter((u) => u.id !== data.id));
    });

    // Listen for message errors
    socket.on("message-error", (data) => {
      toast.error(data.message || "Failed to send message");
    });

    return () => {
      socket.off("new-message");
      socket.off("online-users");
      socket.off("user-typing");
      socket.off("user-stop-typing");
      socket.off("message-error");
      disconnectSocket();
    };
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  // Join room and fetch messages when active room changes
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    // Join the room
    socket.emit("join-room", activeRoom);

    // Fetch message history
    const fetchMessages = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/chat/${activeRoom}?limit=100`);
        setMessages(res.data);
        setTimeout(scrollToBottom, 200);
      } catch (error) {
        console.error("Fetch messages error:", error);
        toast.error("Failed to load messages");
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
    setTypingUsers([]);
  }, [activeRoom]); // eslint-disable-line react-hooks/exhaustive-deps

  // Send message
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const socket = getSocket();
    if (!socket) {
      toast.error("Not connected to chat server");
      return;
    }

    socket.emit("send-message", {
      room: activeRoom,
      text: newMessage.trim(),
    });

    socket.emit("stop-typing", activeRoom);
    setNewMessage("");
    inputRef.current?.focus();
  };

  // Handle typing indicator
  const handleTyping = () => {
    const socket = getSocket();
    if (!socket) return;

    socket.emit("typing", activeRoom);

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop-typing", activeRoom);
    }, 2000);
  };

  // Format timestamp
  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    }
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  };

  const activeRoomData = ROOMS.find((r) => r.id === activeRoom) || ROOMS[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 h-[calc(100vh-80px)]">
      <div className="flex h-full glass-card overflow-hidden animate-fade-in">
        {/* Sidebar - Room List */}
        <div
          className={`${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0 fixed md:relative z-30 w-72 h-full bg-dark-900/95 md:bg-transparent 
          border-r border-dark-700/30 flex flex-col transition-transform duration-300`}
        >
          {/* Sidebar Header */}
          <div className="p-4 border-b border-dark-700/30">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Chat Rooms
              </h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="md:hidden p-1 text-dark-400 hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Room List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {ROOMS.map((room) => (
              <button
                key={room.id}
                onClick={() => {
                  setActiveRoom(room.id);
                  setSidebarOpen(false);
                }}
                className={`w-full text-left px-3 py-3 rounded-xl transition-all duration-200 group
                  ${
                    activeRoom === room.id
                      ? "bg-primary-500/15 border border-primary-500/30 text-white"
                      : "text-dark-300 hover:bg-dark-800/60 hover:text-white border border-transparent"
                  }`}
                id={`room-${room.id}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{room.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{room.name}</p>
                    <p className="text-xs text-dark-500 truncate">{room.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Online Users */}
          <div className="p-4 border-t border-dark-700/30">
            <p className="text-xs text-dark-500 font-medium mb-2 uppercase tracking-wider">
              Online ({onlineUsers.length})
            </p>
            <div className="space-y-1.5 max-h-24 overflow-y-auto">
              {onlineUsers.map((u) => (
                <div key={u.id} className="flex items-center gap-2 text-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0"></span>
                  <span className="text-dark-300 truncate">
                    {u.name}
                    {u.id === user?._id ? " (you)" : ""}
                  </span>
                </div>
              ))}
              {onlineUsers.length === 0 && (
                <p className="text-dark-600 text-xs">Connecting...</p>
              )}
            </div>
          </div>
        </div>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-dark-950/60 z-20 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Chat Header */}
          <div className="px-4 py-3 border-b border-dark-700/30 flex items-center gap-3">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 text-dark-400 hover:text-white rounded-lg hover:bg-dark-800/60"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <span className="text-2xl">{activeRoomData.icon}</span>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white text-sm">{activeRoomData.name}</h3>
              <p className="text-xs text-dark-500">{activeRoomData.description}</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-dark-500">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              {onlineUsers.length} online
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-dark-700 border-t-primary-500 rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-dark-500 text-sm">Loading messages...</p>
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <span className="text-4xl mb-3 block">{activeRoomData.icon}</span>
                  <h3 className="text-dark-300 font-semibold mb-1">No messages yet</h3>
                  <p className="text-dark-500 text-sm">Be the first to say something!</p>
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg, index) => {
                  const isOwn = msg.sender === user?._id;
                  const showAvatar =
                    index === 0 || messages[index - 1].sender !== msg.sender;

                  return (
                    <div
                      key={msg._id || index}
                      className={`flex gap-2 ${isOwn ? "flex-row-reverse" : ""} ${
                        showAvatar ? "mt-3" : "mt-0.5"
                      }`}
                    >
                      {/* Avatar */}
                      <div className={`w-8 flex-shrink-0 ${showAvatar ? "" : "invisible"}`}>
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white
                          ${isOwn ? "bg-gradient-to-br from-primary-500 to-purple-600" : "bg-gradient-to-br from-emerald-500 to-teal-600"}`}
                        >
                          {msg.senderName?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                      </div>

                      {/* Message Bubble */}
                      <div className={`max-w-[70%] ${isOwn ? "items-end" : "items-start"}`}>
                        {showAvatar && (
                          <p
                            className={`text-xs font-medium mb-1 ${
                              isOwn ? "text-right text-primary-400" : "text-dark-400"
                            }`}
                          >
                            {isOwn ? "You" : msg.senderName}
                          </p>
                        )}
                        <div
                          className={`px-3.5 py-2 rounded-2xl text-sm leading-relaxed break-words
                          ${
                            isOwn
                              ? "bg-primary-600/80 text-white rounded-tr-md"
                              : "bg-dark-700/60 text-dark-100 rounded-tl-md"
                          }`}
                        >
                          {msg.text}
                        </div>
                        <p
                          className={`text-[10px] text-dark-600 mt-0.5 ${
                            isOwn ? "text-right" : ""
                          }`}
                        >
                          {formatTime(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Typing Indicator */}
          {typingUsers.length > 0 && (
            <div className="px-4 py-1">
              <p className="text-xs text-dark-500 animate-pulse">
                {typingUsers.map((u) => u.name).join(", ")}{" "}
                {typingUsers.length === 1 ? "is" : "are"} typing...
              </p>
            </div>
          )}

          {/* Message Input */}
          <div className="px-4 py-3 border-t border-dark-700/30">
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  handleTyping();
                }}
                placeholder={`Message #${activeRoomData.name.toLowerCase()}...`}
                className="input-field flex-1 !rounded-full !py-2.5"
                maxLength={1000}
                id="chat-message-input"
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="p-3 bg-primary-600 hover:bg-primary-500 text-white rounded-full
                  transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed
                  hover:shadow-lg hover:shadow-primary-500/20 active:scale-95"
                id="chat-send-btn"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
