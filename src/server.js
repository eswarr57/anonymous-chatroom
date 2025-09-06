const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { v4: uuidv4 } = require("uuid");
const mongoose = require("mongoose");
const path = require("path");

// ===== MongoDB Atlas Connection =====
mongoose.connect("mongodb+srv://kaligatlaeswarr_db_user:y4gLyHKebiNjzzg5@cluster0.qtmhhzx.mongodb.net/anonchat?retryWrites=true&w=majority&appName=Cluster0")
.then(() => console.log("✅ MongoDB Atlas Connected"))
.catch((err) => console.error("❌ MongoDB Error:", err));

// ===== Message Schema =====
const messageSchema = new mongoose.Schema({
    username: String,
    text: String,
    createdAt: { type: Date, default: Date.now }
});

const Message = mongoose.model("Message", messageSchema);

// ===== Express + Socket.IO Setup =====
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// ✅ Serve index.html from public folder
app.use(express.static(path.join(__dirname, "../public")));

// ===== Socket.IO =====
io.on("connection", async (socket) => {
    const username = "User-" + uuidv4().slice(0, 4);

    // Send last 20 messages
    const recentMessages = await Message.find().sort({ createdAt: -1 }).limit(20).lean();
    socket.emit("loadMessages", recentMessages.reverse());

    socket.broadcast.emit("message", `${username} joined the chat`);

    socket.on("chatMessage", async (msg) => {
        const newMsg = new Message({ username, text: msg });
        await newMsg.save();
        io.emit("message", `${username}: ${msg}`);
    });

    socket.on("disconnect", () => {
        io.emit("message", `${username} left the chat`);
    });
});

server.listen(3000, () => console.log("🚀 Server running on http://localhost:3000"));
