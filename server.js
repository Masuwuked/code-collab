/**
 * CodeCollab AI - Backend Server
 * 
 * Manages WebSocket connections via Socket.IO, room-based state isolation,
 * real-time code broadcasting, operational concurrency, and peer messaging.
 */

const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
const { Server } = require('socket.io');
const ACTIONS = require('./src/Actions');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Serve frontend build
app.use(express.static(path.join(__dirname, 'build')));
app.use((req, res, next) => {
  const indexPath = path.join(__dirname, 'build', 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) next();
  });
});

// In-memory mapping of active socket sessions
const userSocketMap = {};

/**
 * Retrieves all unique connected clients for a specific room ID
 */
function getAllConnectedClients(roomId) {
  const roomSockets = io.sockets.adapter.rooms.get(roomId) || new Set();
  return Array.from(roomSockets).map((socketId) => ({
    socketId,
    username: userSocketMap[socketId] || 'Anonymous'
  }));
}

io.on('connection', (socket) => {
  // 1. User joins a collaboration room
  socket.on(ACTIONS.JOIN, ({ roomId, username }) => {
    userSocketMap[socket.id] = username;
    socket.join(roomId);

    const clients = getAllConnectedClients(roomId);

    // Broadcast to all participants in this room (including the newly joined client)
    io.in(roomId).emit(ACTIONS.JOINED, {
      clients,
      username,
      socketId: socket.id
    });
  });

  // 2. Real-time code change broadcast
  socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
    socket.to(roomId).emit(ACTIONS.CODE_CHANGE, { code });
  });

  // 3. State synchronization for late-joining clients
  socket.on(ACTIONS.SYNC_CODE, ({ socketId, code }) => {
    io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code });
  });

  // 4. Real-time room chat message
  socket.on(ACTIONS.CHAT_MESSAGE, ({ roomId, message, username, timestamp }) => {
    io.to(roomId).emit(ACTIONS.CHAT_MESSAGE, {
      username,
      message,
      timestamp: timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      socketId: socket.id
    });
  });

  // 5. Handling disconnection & cleanup
  socket.on('disconnecting', () => {
    const rooms = [...socket.rooms].filter((room) => room !== socket.id);

    rooms.forEach((roomId) => {
      const username = userSocketMap[socket.id];
      delete userSocketMap[socket.id];

      const clients = getAllConnectedClients(roomId).filter(
        (c) => c.socketId !== socket.id
      );

      socket.to(roomId).emit(ACTIONS.DISCONNECTED, {
        socketId: socket.id,
        username,
        clients
      });
    });
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`[CodeCollab AI] Backend server running on port ${PORT}`);
});
