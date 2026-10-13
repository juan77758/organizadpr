import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import socketService from '../../services/socketService';
import { notificationService } from '../../services/notificationService';
import NotificationCenter from '../Notifications/NotificationCenter';
import { playAlarmSound, playNotificationSound } from '../../utils/soundUtils';
import './Layout.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadUnreadCount();

    // Escuchar notificaciones en tiempo real
    socketService.onNewNotification((notification) => {
      setUnreadCount((prev) => prev + 1);

      // Reproducir sonido según el tipo de notificación
      if (notification.urgent || notification.playSound) {
        playAlarmSound();

        // Mostrar notificación del navegador
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('🚨 Actividad Urgente', {
            body: notification.message,
            icon: '/logo192.png',
            badge: '/logo192.png',
            requireInteraction: true
          });
        }
      } else {
        playNotificationSound();
      }
    });

    socketService.onUnreadCount((data) => {
      setUnreadCount(data.count);
    });

    // Solicitar permiso para notificaciones del navegador
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      socketService.removeListener('new_notification');
      socketService.removeListener('unread_count');
    };
  }, []);

  const loadUnreadCount = async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Error cargando contador:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/dashboard" className="navbar-logo">
          📋 Organizador
        </Link>

        <div className="navbar-menu">
          <Link to="/dashboard" className="navbar-link">
            Tablero
          </Link>
          <Link to="/calendar" className="navbar-link">
            Calendario
          </Link>

          <div className="navbar-notifications">
            <button
              className="notification-bell"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              🔔
              {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
            </button>

            {showNotifications && (
              <NotificationCenter
                onClose={() => setShowNotifications(false)}
                onNotificationRead={loadUnreadCount}
              />
            )}
          </div>

          <div className="navbar-user">
            <span className="user-name">{user?.name || user?.email}</span>
            <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
              Salir
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
