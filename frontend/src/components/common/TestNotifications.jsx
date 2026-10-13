import React, { useState } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { playAlarmSound } from '../../utils/soundUtils';

const TestNotifications = () => {
  const [loading, setLoading] = useState(false);

  const testNotification = async () => {
    setLoading(true);
    try {
      await api.post('/test/test-notification', {});
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
      const response = await api.post('/notifications/check-now', {});
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
        onClick={async () => {
          const played = await playAlarmSound();
          if (played) {
            toast.info('Sonido iniciado. Si no se escucha, revisa el volumen y si la pestaña está silenciada.');
          } else {
            toast.error('El navegador no pudo activar el audio.');
          }
        }}
        style={{ backgroundColor: '#d4af37', padding: '12px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
      >
        Probar sonido
      </button>
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
