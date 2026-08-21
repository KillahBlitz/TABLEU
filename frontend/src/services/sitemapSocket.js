import { io } from 'socket.io-client';

let _socket = null;
const _queue = [];

export const connectSitemapSocket = () => {
  if (_socket) return _socket;

  const token = localStorage.getItem('tableu_token');

  _socket = io(window.location.origin, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnectionDelay: 1000,
    reconnectionAttempts: 10
  });

  _socket.on('connect', () => {
    while (_queue.length) {
      const { event, data } = _queue.shift();
      _socket.emit(event, data);
    }
  });

  return _socket;
};

export const getSitemapSocket = () => _socket;

export const emitOp = (event, data) => {
  const socket = getSitemapSocket();
  if (!socket) return;
  if (socket.connected) socket.emit(event, data);
  else _queue.push({ event, data });
};

export const disconnectSitemapSocket = () => {
  if (_socket) {
    _socket.disconnect();
    _socket = null;
  }
};
