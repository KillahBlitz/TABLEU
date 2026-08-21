import { io } from 'socket.io-client';

let _socket = null;

export const connectSitemapSocket = () => {
  if (_socket?.connected) return _socket;

  const token = localStorage.getItem('tableu_token');

  _socket = io(window.location.origin, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnectionDelay: 1000,
    reconnectionAttempts: 10
  });

  return _socket;
};

export const getSitemapSocket = () => _socket;

export const emitOp = (event, data) => {
  const socket = getSitemapSocket();
  if (socket?.connected) socket.emit(event, data);
};

export const disconnectSitemapSocket = () => {
  if (_socket) {
    _socket.disconnect();
    _socket = null;
  }
};
