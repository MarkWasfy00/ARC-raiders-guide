import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "0.0.0.0";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);

  // Initialize Socket.IO server
  const io = new Server(httpServer, {
    cors: {
      origin: dev ? `http://${hostname}:${port}` : process.env.AUTH_URL,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Store io instance globally for API routes to access
  global.io = io;

  // Socket.IO connection handling
  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    // Join a user's notification room
    socket.on("join-notifications", (userId) => {
      const room = `notifications:${userId}`;
      socket.join(room);
      console.log(`Socket ${socket.id} joined notifications: ${room}`);
    });

    // Leave a user's notification room
    socket.on("leave-notifications", (userId) => {
      const room = `notifications:${userId}`;
      socket.leave(room);
      console.log(`Socket ${socket.id} left notifications: ${room}`);
    });

    // Join a chat room
    socket.on("join-chat", (chatId) => {
      socket.join(chatId);
      console.log(`Socket ${socket.id} joined chat: ${chatId}`);
    });

    // Leave a chat room
    socket.on("leave-chat", (chatId) => {
      socket.leave(chatId);
      console.log(`Socket ${socket.id} left chat: ${chatId}`);
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  httpServer
    .once("error", (err) => {
      console.error("Server error:", err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
      console.log(`> Socket.IO server initialized`);
    });
});
