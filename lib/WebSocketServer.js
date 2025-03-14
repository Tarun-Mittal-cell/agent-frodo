// lib/WebSocketServer.js
import { Server } from "socket.io";

/**
 * WebSocket server instance
 * @type {import('socket.io').Server|null}
 */
let io = null;

/**
 * Initialize WebSocket server with HTTP server
 * @param {import('http').Server} server - HTTP server instance
 * @returns {import('socket.io').Server} Socket.io server instance
 */
export function initWebSocket(server) {
  if (io) return io;

  io = new Server(server);

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("join-session", (sessionId) => {
      if (!sessionId) return;

      // Leave any previous rooms
      Array.from(socket.rooms)
        .filter((room) => room.startsWith("session-"))
        .forEach((room) => socket.leave(room));

      // Join the new session room
      socket.join(`session-${sessionId}`);
      console.log(`Socket ${socket.id} joined session ${sessionId}`);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  return io;
}

/**
 * Get the Socket.io server instance
 * @returns {import('socket.io').Server|null} Socket.io server instance
 */
export function getIO() {
  if (!io) {
    console.warn("WebSocket server not initialized. Call initWebSocket first.");
  }
  return io;
}

/**
 * Emit an event to a specific session room
 * @param {string} sessionId - The session ID
 * @param {string} event - Event name
 * @param {any} data - Event data
 */
export function emitToSession(sessionId, event, data) {
  if (!io) return;

  const roomId = `session-${sessionId}`;
  io.to(roomId).emit(event, data);
}
