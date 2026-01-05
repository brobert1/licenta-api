import jwt from 'jsonwebtoken';
import { disconnectSocket } from '@sockets/game-handlers';
import { Server } from 'socket.io';
import * as gameHandlers from './game-handlers';

export const initializeSockets = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.SITE_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    path: '/socket.io',
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;

      if (!token) {
        return next(new Error('Authentication error: Token required'));
      }

      // Verify the JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (!decoded || !decoded.me) {
        return next(new Error('Authentication error: Invalid token'));
      }

      // Attach user to socket
      socket.user = { _id: decoded.me };
      next();
    } catch (err) {
      console.error('Socket Auth Error:', err.message);
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user._id}`);

    // Attach handlers
    socket.on('joinQueue', (data) => gameHandlers.joinQueue(io, socket, data));
    socket.on('leaveQueue', () => gameHandlers.leaveQueue(io, socket));
    socket.on('makeMove', (data) => gameHandlers.makeMove(io, socket, data));
    socket.on('gameAction', (data) => gameHandlers.gameAction(io, socket, data));
    
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user._id}`);
      disconnectSocket(io, socket);
    });
  });

  return io;
};
