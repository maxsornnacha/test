const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const httpServer = createServer(app);

// Configure Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: [process.env.CLIENT_URL, process.env.CLIENT_URL_1, process.env.CLIENT_URL_2],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Object to track users in rooms
const rooms = {};

io.on('connection', (socket) => {
//   console.log(`User connected: ${socket.id}`);

  // Join room event
  socket.on('join-room', ({ room_code }) => {
    if (!room_code) {
      socket.emit('error', { message: 'Room code is required.' });
      return;
    }

    socket.join(room_code);

    if (!rooms[room_code]) {
      rooms[room_code] = [];
    }

    rooms[room_code].push(socket.id);

    console.log(`User ${socket.id} joined room ${room_code}`);
    io.to(room_code).emit('update-room', { room_code, participants: rooms[room_code] });
  });

  // Leave room event
  socket.on('leave-room', ({ room_code }) => {
    if (rooms[room_code]) {
      rooms[room_code] = rooms[room_code].filter((id) => id !== socket.id);
      socket.leave(room_code);
      console.log(`User ${socket.id} left room ${room_code}`);
      io.to(room_code).emit('update-room', { room_code, participants: rooms[room_code] });

      // Cleanup empty room
      if (rooms[room_code].length === 0) {
        delete rooms[room_code];
      }
    }
  });

  // Update meeting room
  socket.on('update-meeting-room', ({ room_code }) => {
    console.log(`Meeting room updated: ${room_code}`);
    io.to(room_code).emit('update-meeting-room', { room_code });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    Object.keys(rooms).forEach((room_code) => {
      if (rooms[room_code].includes(socket.id)) {
        rooms[room_code] = rooms[room_code].filter((id) => id !== socket.id);
        io.to(room_code).emit('update-room', { room_code, participants: rooms[room_code] });

        // Cleanup empty room
        if (rooms[room_code].length === 0) {
          delete rooms[room_code];
        }
      }
    });
  });
});

module.exports = { httpServer, io };
