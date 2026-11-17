import { io } from 'socket.io-client';

export const initSocket = async () => {
  const options = {
    'force new connection': true,
    reconnectionAttempt: 'Infinity',
    timeout: 10000,
    transports: ['websocket', 'polling'],
  };
  // Always connect dynamically to the host that served the page
  // This allows teammates on LAN (e.g. http://192.168.x.x:5000) or tunnels to connect seamlessly
  const targetUrl = (typeof window !== 'undefined' && window.location && window.location.origin)
    ? window.location.origin
    : (process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000');

  return io(targetUrl, options);
};
