/**
 * CodeCollab - Backend Server
 * 
 * Manages WebSocket connections via Socket.IO, room-based state isolation,
 * multi-language code compilation (Java JDK 25 & JavaScript), and peer messaging.
 */

const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const os = require('os');
const { exec } = require('child_process');
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

// Multi-language code execution endpoint
app.post('/api/execute', (req, res) => {
  const { language = 'javascript', code = '' } = req.body;
  const startTime = Date.now();

  if (!code || !code.trim()) {
    return res.json({ success: true, output: '(No code provided)', duration: 0 });
  }

  if (language === 'java') {
    // Dynamically extract class name from user code or fallback to 'Main'
    const classMatch = code.match(/public\s+class\s+([A-Za-z0-9_]+)/) || code.match(/class\s+([A-Za-z0-9_]+)/);
    const className = classMatch ? classMatch[1] : 'Main';

    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'collab_java_'));
    const filePath = path.join(tempDir, `${className}.java`);
    fs.writeFileSync(filePath, code);

    // Compile Java with native javac
    exec(`javac "${filePath}"`, { timeout: 10000 }, (compileErr, stdout, stderr) => {
      if (compileErr) {
        try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch (e) {}
        return res.json({
          success: false,
          output: stderr || compileErr.message,
          duration: Date.now() - startTime
        });
      }

      // Run Java with native java runtime
      exec(`java -cp "${tempDir}" ${className}`, { timeout: 10000 }, (runErr, runStdout, runStderr) => {
        try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch (e) {}
        const output = runStdout || runStderr || (runErr ? runErr.message : '(Process finished with no output)');
        return res.json({
          success: !runErr,
          output: output.trim(),
          duration: Date.now() - startTime
        });
      });
    });
  } else {
    // JavaScript execution via Node.js
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'collab_js_'));
    const filePath = path.join(tempDir, 'script.js');
    fs.writeFileSync(filePath, code);

    exec(`node "${filePath}"`, { timeout: 10000 }, (err, stdout, stderr) => {
      try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch (e) {}
      const output = stdout || stderr || (err ? err.message : '(Process finished with no output)');
      return res.json({
        success: !err,
        output: output.trim(),
        duration: Date.now() - startTime
      });
    });
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

function getAllConnectedClients(roomId) {
  const roomSockets = io.sockets.adapter.rooms.get(roomId) || new Set();
  return Array.from(roomSockets).map((socketId) => ({
    socketId,
    username: userSocketMap[socketId] || 'Anonymous'
  }));
}

io.on('connection', (socket) => {
  socket.on(ACTIONS.JOIN, ({ roomId, username }) => {
    userSocketMap[socket.id] = username;
    socket.join(roomId);

    const clients = getAllConnectedClients(roomId);

    io.in(roomId).emit(ACTIONS.JOINED, {
      clients,
      username,
      socketId: socket.id
    });
  });

  socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
    socket.to(roomId).emit(ACTIONS.CODE_CHANGE, { code });
  });

  socket.on(ACTIONS.SYNC_CODE, ({ socketId, code }) => {
    io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code });
  });

  socket.on(ACTIONS.CHAT_MESSAGE, ({ roomId, message, username, timestamp }) => {
    io.to(roomId).emit(ACTIONS.CHAT_MESSAGE, {
      username,
      message,
      timestamp: timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      socketId: socket.id
    });
  });

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
  console.log(`[CodeCollab] Backend server running on port ${PORT}`);
});
