import React, { useState, useEffect } from 'react';
import { activityService } from '../../services/activityService';
import { toast } from 'react-toastify';
import './Activity.css';

const toLocalDateTimeInput = (value) => {
  const date = new Date(value);
  const pad = (part) => String(part).padStart(2, '0');

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const ActivityModal = ({ activity, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: '',
    priority: 'media',
    category: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activity) {
      // Editar actividad existente
      setFormData({
        title: activity.title,
        description: activity.description || '',
        due_date: toLocalDateTimeInput(activity.due_date),
        priority: activity.priority,
        category: activity.category || '',
      });
    }
  }, [activity]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        time_zone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };

      if (activity) {
        await activityService.updateActivity(activity.id, payload);
        toast.success('Actividad actualizada');
      } else {
        await activityService.createActivity(payload);
        toast.success('Actividad creada');
      }
      onSave();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al guardar actividad');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{activity ? 'Editar Actividad' : 'Nueva Actividad'}</h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="activity-form">
          <div className="form-group">
            <label className="label">Título *</label>
            <input
              type="text"
              name="title"
              className="input"
              value={formData.title}
              onChange={handleChange}
              placeholder="Título de la actividad"
              required
              maxLength={100}
            />
          </div>

          <div className="form-group">
            <label className="label">Descripción</label>
            <textarea
              name="description"
              className="input"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe tu actividad..."
              rows={4}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="label">Fecha de Vencimiento *</label>
              <input
                type="datetime-local"
                name="due_date"
                className="input"
                value={formData.due_date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="label">Prioridad</label>
              <select name="priority" className="input" value={formData.priority} onChange={handleChange}>
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="label">Categoría</label>
            <select name="category" className="input" value={formData.category} onChange={handleChange}>
              <option value="">Sin categoría</option>
              <option value="Personal">Personal</option>
              <option value="Trabajo">Trabajo</option>
              <option value="Estudios">Estudios</option>
              <option value="Otros">Otros</option>
            </select>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ActivityModal;
