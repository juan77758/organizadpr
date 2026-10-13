import React, { useState, useEffect } from 'react';
import { notificationService } from '../../services/notificationService';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'react-toastify';
import './Notifications.css';

const NotificationCenter = ({ onClose, onNotificationRead }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await notificationService.getNotifications(20);
      setNotifications(data);
    } catch (error) {
      toast.error('Error al cargar notificaciones');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      onNotificationRead();
    } catch (error) {
      toast.error('Error al marcar como leída');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      onNotificationRead();
      toast.success('Todas marcadas como leídas');
    } catch (error) {
      toast.error('Error al marcar todas');
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      toast.success('Notificación eliminada');
    } catch (error) {
      toast.error('Error al eliminar');
    }
  };

  return (
    <>
      <div className="notification-overlay" onClick={onClose}></div>
      <div className="notification-panel">
        <div className="notification-header">
          <h3>Notificaciones</h3>
          {notifications.some((n) => !n.is_read) && (
            <button className="btn-text" onClick={handleMarkAllAsRead}>
              Marcar todas como leídas
            </button>
          )}
        </div>

        <div className="notification-list">
          {loading ? (
            <div className="notification-loading">Cargando...</div>
          ) : notifications.length === 0 ? (
            <div className="notification-empty">No tienes notificaciones</div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`notification-item ${!notification.is_read ? 'unread' : ''}`}
              >
                <div className="notification-content">
                  <p className="notification-message">{notification.message}</p>
                  {notification.activity_title && (
                    <p className="notification-activity">{notification.activity_title}</p>
                  )}
                  <span className="notification-time">
                    {formatDistanceToNow(new Date(notification.created_at), {
                      addSuffix: true,
                      locale: es,
                    })}
                  </span>
                </div>

                <div className="notification-actions">
                  {!notification.is_read && (
                    <button
                      className="btn-icon-small"
                      onClick={() => handleMarkAsRead(notification.id)}
                      title="Marcar como leída"
                    >
                      ✓
                    </button>
                  )}
                  <button
                    className="btn-icon-small"
                    onClick={() => handleDelete(notification.id)}
                    title="Eliminar"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default NotificationCenter;
