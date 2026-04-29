const express = require("express");
const router = express.Router();
const { getMessages, getRooms } = require("../controllers/chatController");
const { protect } = require("../middleware/authMiddleware");

// All chat routes are protected
router.use(protect);

// Get list of available rooms
router.get("/rooms/list", getRooms);

// Get messages for a specific room
router.get("/:room", getMessages);

module.exports = router;
