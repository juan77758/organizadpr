import { io } from 'socket.io-client';
import { authService } from './authService';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect() {
    const token = authService.getToken();
    if (!token) return;

    this.socket = io(SOCKET_URL, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('✓ Conectado a WebSocket');
    });

    this.socket.on('disconnect', () => {
      console.log('✗ Desconectado de WebSocket');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Error de conexión WebSocket:', error.message);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  onNewNotification(callback) {
    if (this.socket) {
      this.socket.on('new_notification', callback);
    }
  }

  onUnreadCount(callback) {
    if (this.socket) {
      this.socket.on('unread_count', callback);
    }
  }

  requestUnreadNotifications() {
    if (this.socket) {
      this.socket.emit('request_unread_notifications');
    }
  }

  removeListener(event) {
    if (this.socket) {
      this.socket.off(event);
    }
  }
}

export default new SocketService();
