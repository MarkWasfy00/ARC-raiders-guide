import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import { createClient } from "redis";
import { createAdapter } from "@socket.io/redis-adapter";

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "0.0.0.0";
const port = parseInt(process.env.PORT || "3000", 10);
const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
const instanceId = process.env.INSTANCE_ID || "app";

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(async () => {
  const httpServer = createServer(handler);

  // Initialize Socket.IO server
  const io = new Server(httpServer, {
    cors: {
      origin: dev ? `http://${hostname}:${port}` : process.env.AUTH_URL,
      methods: ["GET", "POST"],
      credentials: true,
    },
    // Optimize for high traffic
    pingTimeout: 60000,
    pingInterval: 25000,
    transports: ["websocket", "polling"],
    allowUpgrades: true,
  });

  // Setup Redis adapter for cross-instance communication (production only)
  if (!dev && redisUrl) {
    try {
      const pubClient = createClient({ url: redisUrl });
      const subClient = pubClient.duplicate();

      pubClient.on("error", (err) => console.error("Redis Pub Error:", err));
      subClient.on("error", (err) => console.error("Redis Sub Error:", err));

      await Promise.all([pubClient.connect(), subClient.connect()]);

      io.adapter(createAdapter(pubClient, subClient));
      console.log(`[${instanceId}] Socket.IO Redis adapter connected`);
    } catch (err) {
      console.error(`[${instanceId}] Failed to connect Redis adapter:`, err);
      console.log(`[${instanceId}] Running without Redis adapter (single instance mode)`);
    }
  }

  // Store io instance globally for API routes to access
  global.io = io;

  // Socket.IO connection handling
  io.on("connection", (socket) => {
    console.log(`[${instanceId}] Client connected:`, socket.id);

    // Join a user's notification room
    socket.on("join-notifications", (userId) => {
      const room = `notifications:${userId}`;
      socket.join(room);
      console.log(`[${instanceId}] Socket ${socket.id} joined notifications: ${room}`);
    });

    // Leave a user's notification room
    socket.on("leave-notifications", (userId) => {
      const room = `notifications:${userId}`;
      socket.leave(room);
      console.log(`[${instanceId}] Socket ${socket.id} left notifications: ${room}`);
    });

    // Join a chat room
    socket.on("join-chat", (chatId) => {
      socket.join(chatId);
      console.log(`[${instanceId}] Socket ${socket.id} joined chat: ${chatId}`);
    });

    // Leave a chat room
    socket.on("leave-chat", (chatId) => {
      socket.leave(chatId);
      console.log(`[${instanceId}] Socket ${socket.id} left chat: ${chatId}`);
    });

    // Join a listing room (for listing owners to receive all chat updates for a listing)
    socket.on("join-listing", (listingId) => {
      const room = `listing:${listingId}`;
      socket.join(room);
      console.log(`[${instanceId}] Socket ${socket.id} joined listing: ${room}`);
    });

    // Leave a listing room
    socket.on("leave-listing", (listingId) => {
      const room = `listing:${listingId}`;
      socket.leave(room);
      console.log(`[${instanceId}] Socket ${socket.id} left listing: ${room}`);
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`[${instanceId}] Client disconnected:`, socket.id);
    });
  });

  httpServer
    .once("error", (err) => {
      console.error(`[${instanceId}] Server error:`, err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`[${instanceId}] Ready on http://${hostname}:${port}`);
      console.log(`[${instanceId}] Socket.IO server initialized`);
    });
});
