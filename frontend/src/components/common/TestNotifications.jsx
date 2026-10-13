import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const TestNotifications = () => {
  const [loading, setLoading] = useState(false);

  const testNotification = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5001/api/test/test-notification',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('¡Notificación de prueba enviada! Revisa la campana 🔔');
    } catch (error) {
      toast.error('Error al enviar notificación');
    } finally {
      setLoading(false);
    }
  };

  const checkActivities = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5001/api/notifications/check-now',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`✓ ${response.data.message} - Revisa tu email y la campana 🔔`);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al revisar actividades');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      zIndex: 1000
    }}>
      <button
        onClick={testNotification}
        disabled={loading}
        style={{
          backgroundColor: '#d4af37',
          color: '#000',
          border: 'none',
          padding: '12px 20px',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: 'bold',
          fontSize: '14px',
          opacity: loading ? 0.6 : 1
        }}
      >
        {loading ? '⏳' : '🔔'} Probar Notificación
      </button>
      <button
        onClick={checkActivities}
        disabled={loading}
        style={{
          backgroundColor: '#d4af37',
          color: '#000',
          border: 'none',
          padding: '12px 20px',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: 'bold',
          fontSize: '14px',
          opacity: loading ? 0.6 : 1
        }}
      >
        {loading ? '⏳' : '⏰'} Forzar Revisión AHORA
      </button>
    </div>
  );
};

export default TestNotifications;
