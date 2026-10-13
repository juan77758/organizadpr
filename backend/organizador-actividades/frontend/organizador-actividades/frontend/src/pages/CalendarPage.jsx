import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import Navbar from '../components/Layout/Navbar';
import { activityService } from '../services/activityService';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import './CalendarPage.css';

const CalendarPage = () => {
  const [activities, setActivities] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedActivities, setSelectedActivities] = useState([]);

  useEffect(() => {
    loadActivities();
  }, []);

  useEffect(() => {
    filterActivitiesByDate(selectedDate);
  }, [selectedDate, activities]);

  const loadActivities = async () => {
    try {
      const data = await activityService.getActivities();
      setActivities(data);
    } catch (error) {
      console.error('Error cargando actividades:', error);
    }
  };

  const filterActivitiesByDate = (date) => {
    const filtered = activities.filter((activity) => {
      const activityDate = new Date(activity.due_date);
      return (
        activityDate.getDate() === date.getDate() &&
        activityDate.getMonth() === date.getMonth() &&
        activityDate.getFullYear() === date.getFullYear()
      );
    });
    setSelectedActivities(filtered);
  };

  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const dayActivities = activities.filter((activity) => {
        const activityDate = new Date(activity.due_date);
        return (
          activityDate.getDate() === date.getDate() &&
          activityDate.getMonth() === date.getMonth() &&
          activityDate.getFullYear() === date.getFullYear()
        );
      });

      if (dayActivities.length > 0) {
        return <div className="calendar-dot">{dayActivities.length}</div>;
      }
    }
    return null;
  };

  return (
    <div className="calendar-page">
      <Navbar />
      <main className="main-content">
        <div className="calendar-container">
          <h2>Calendario de Actividades</h2>

          <div className="calendar-wrapper">
            <Calendar
              onChange={setSelectedDate}
              value={selectedDate}
              locale="es-ES"
              tileContent={tileContent}
              className="custom-calendar"
            />

            <div className="activities-sidebar">
              <h3>
                {format(selectedDate, "d 'de' MMMM, yyyy", { locale: es })}
              </h3>

              {selectedActivities.length === 0 ? (
                <p className="no-activities">No hay actividades para este día</p>
              ) : (
                <div className="activity-list">
                  {selectedActivities.map((activity) => (
                    <div key={activity.id} className="calendar-activity-card">
                      <h4>{activity.title}</h4>
                      {activity.description && <p>{activity.description}</p>}
                      <div className="activity-meta">
                        <span className={`badge badge-${activity.priority}`}>
                          {activity.priority}
                        </span>
                        <span className={`status-badge status-${activity.status}`}>
                          {activity.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CalendarPage;
