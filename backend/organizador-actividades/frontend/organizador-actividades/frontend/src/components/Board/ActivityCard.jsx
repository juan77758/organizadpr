import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import './Board.css';

const ActivityCard = ({ activity, onEdit, onDelete, isDragging }) => {
  const getUrgencyClass = () => {
    const now = new Date();
    const dueDate = new Date(activity.due_date);
    const hoursLeft = (dueDate - now) / (1000 * 60 * 60);

    if (hoursLeft < 0) return 'overdue';
    if (hoursLeft < 24) return 'urgent';
    return 'normal';
  };

  const getPriorityColor = () => {
    const colors = {
      alta: '#ff4444',
      media: '#ffbb33',
      baja: '#00C851',
    };
    return colors[activity.priority] || '#888888';
  };

  return (
    <div className={`activity-card ${getUrgencyClass()} ${isDragging ? 'dragging' : ''}`}>
      <div className="card-priority" style={{ backgroundColor: getPriorityColor() }}></div>

      <div className="card-content">
        <h4 className="card-title">{activity.title}</h4>

        {activity.description && (
          <p className="card-description">{activity.description.substring(0, 100)}...</p>
        )}

        <div className="card-meta">
          <span className="card-date">
            📅 {formatDistanceToNow(new Date(activity.due_date), { addSuffix: true, locale: es })}
          </span>

          {activity.category && <span className="card-category">{activity.category}</span>}

          <span className={`badge badge-${activity.priority}`}>{activity.priority}</span>
        </div>
      </div>

      <div className="card-actions">
        <button className="btn-icon" onClick={() => onEdit(activity)} title="Editar">
          ✏️
        </button>
        <button className="btn-icon" onClick={() => onDelete(activity.id)} title="Eliminar">
          🗑️
        </button>
      </div>
    </div>
  );
};

export default ActivityCard;
