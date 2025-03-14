// lib/WebSocketServer.js
import { Server } from "socket.io";

let io;

export function initWebSocket(server) {
  io = new Server(server);

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("join-session", (sessionId) => {
      socket.join(`session-${sessionId}`);
      console.log(`Socket ${socket.id} joined session ${sessionId}`);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  return io;
}

export function getIO() {
  return io;
}

export function emitToSession(sessionId, event, data) {
  if (!io) return;
  const roomId = `session-${sessionId}`;
  io.to(roomId).emit(event, data);
}
