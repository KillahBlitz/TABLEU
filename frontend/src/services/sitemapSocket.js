import { io } from 'socket.io-client';

let _socket = null;

export const connectSitemapSocket = () => {
  if (_socket?.connected) return _socket;

  const token = localStorage.getItem('tableu_token');
  const origin = import.meta.env.VITE_API_URL
    ? new URL(import.meta.env.VITE_API_URL).origin
    : window.location.origin;

  _socket = io(origin, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnectionDelay: 1000,
    reconnectionAttempts: 10
  });

  return _socket;
};

export const getSitemapSocket = () => _socket;

export const disconnectSitemapSocket = () => {
  if (_socket) {
    _socket.disconnect();
    _socket = null;
  }
};
