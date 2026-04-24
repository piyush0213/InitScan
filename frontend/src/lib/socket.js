import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const socket = io(API_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 10,
});

socket.on('connect', () => {
  console.log('🔌 Socket connected:', socket.id);
});

socket.on('disconnect', () => {
  console.log('🔌 Socket disconnected');
});

export default socket;
