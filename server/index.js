import 'dotenv/config';
import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import uploadRouter from './upload.js';

const app = express();
const server = http.createServer(app);

// --- CORS + Middlewares ---
app.use(cors({ origin: process.env.CLIENT_ORIGIN, credentials: true }));
app.use(express.json());
app.use(uploadRouter);

// --- MongoDB Connection ---
try {
  await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000
  });
  console.log(`MongoDB connected: ${mongoose.connection.name} @ ${mongoose.connection.host}`);
} catch (error) {
  console.error(`MongoDB connection failed:`, error.message);
  process.exit(1);
}

mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB disconnected. Retrying...");
});
mongoose.connection.on("error", err => {
  console.error("MongoDB error:", err);
});

// --- Post Schema ---
const PostSchema = new mongoose.Schema({
  kind: { type: String, enum: ['text', 'code', 'image'], required: true },
  text: String,
  imageUrl: String,
  code: { language: String, content: String },
  user: { name: String, avatarUrl: String },
  reactions: [
    { userId: String, type: { type: String, enum: ['like', 'love', 'laugh', 'sad', 'angry'] } }
  ],
  comments: [
    {
      user: { name: String, avatarUrl: String, userId: String },
      text: String,
      createdAt: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });
const Post = mongoose.model('Post', PostSchema);

// --- REST API ---
app.post('/api/token', (req, res) => {
  const { name, avatarUrl, userId } = req.body;

  if (!name || !avatarUrl) {
    return res.status(400).json({ error: "Missing user info" });
  }

  const token = jwt.sign({ name, avatarUrl, userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ token });
});

app.get('/api/posts', async (_req, res) => {
  const posts = await Post.find().sort({ createdAt: -1 }).limit(50);
  res.json(posts);
});

// Reactions endpoint
app.post('/api/posts/:id/reaction', async (req, res) => {
  const { userId, type } = req.body;
  const post = await Post.findById(req.params.id);
  if(!post) {
    return res.status(404).json({ error: "Post not found" });
  }

  const existing = post.reactions.find(r => r.userId === userId);
  if(existing){
    existing.type = type;
  } else {
    post.reactions.push({ userId, type });
  }

  await post.save();
  io.emit('post:reaction', post);
  res.json(post);
});

// --- Socket.IO Setup ---
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_ORIGIN, methods: ['GET', 'POST'] }
});

// Track connected users by userId (not socket.id)
const connectedUsers = new Map();

// Helper function to get post stats
const getPostStats = async () => {
  const textPostCount = await Post.countDocuments({ kind: 'text' });
  const codePostCount = await Post.countDocuments({ kind: 'code' });
  const imagePostCount = await Post.countDocuments({ kind: 'image' });
  const totalPosts = textPostCount + codePostCount + imagePostCount;
  return { textPostCount, codePostCount, imagePostCount, postCount: totalPosts };
};

// --- New API endpoint to fetch stats ---
app.get('/api/stats', async (_req, res) => {
  const postStats = await getPostStats();
  res.json({ onlineCount: connectedUsers.size, ...postStats });
});

// Socket auth middleware
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error("No auth token"));
  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = user;
    next();
  } catch (err) {
    next(new Error("Invalid token"));
  }
});

// Socket connection
io.on('connection', async (socket) => {
  const userId = socket.user.userId || socket.id; // fallback if userId missing
  connectedUsers.set(userId, socket.user);

  console.log(`👤 ${socket.user.name} connected (${socket.id})`);

  io.emit('stats:update', { onlineCount: connectedUsers.size, ...(await getPostStats()) });

  // Create post
  socket.on('post:create', async (post, ack) => {
    const saved = await Post.create(post);
    io.emit('post:new', saved);
    io.emit('stats:update', { onlineCount: connectedUsers.size, ...(await getPostStats()) });
    ack?.(saved);
  });

  // Reaction
  socket.on('post:reaction', async ({ postId, type }) => {
    const post = await Post.findById(postId);
    if (!post) return;

    const existing = post.reactions.find(r => r.userId === userId);
    if (existing) existing.type = type;
    else post.reactions.push({ userId, type });

    await post.save();
    io.emit('post:reaction', post);
  });

  // Comment
  socket.on('post:comment', async ({ postId, text }) => {
    if (!text?.trim()) return;

    const post = await Post.findById(postId);
    if (!post) return;

    post.comments.push({ user: socket.user, text });
    await post.save();
    io.emit('post:comment', post);
  });

  // Disconnect
  socket.on('disconnect', async () => {
    connectedUsers.delete(userId);
    console.log(`❌ ${socket.user?.name || "unknown"} disconnected (${socket.id})`);
    io.emit('stats:update', { onlineCount: connectedUsers.size, ...(await getPostStats()) });
  });
});

// --- Start Server ---
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`🚀 Server running on ${PORT}`));
