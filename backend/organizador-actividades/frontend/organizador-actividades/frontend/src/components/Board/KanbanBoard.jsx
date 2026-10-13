import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { activityService } from '../../services/activityService';
import ActivityCard from './ActivityCard';
import ActivityModal from '../Activity/ActivityModal';
import Filters from './Filters';
import { toast } from 'react-toastify';
import './Board.css';

const KanbanBoard = () => {
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    priority: '',
    category: '',
    search: '',
  });

  const columns = {
    pendiente: { title: 'Pendiente', color: '#ff4444' },
    en_proceso: { title: 'En Proceso', color: '#ffbb33' },
    completado: { title: 'Completado', color: '#00C851' },
  };

  useEffect(() => {
    loadActivities();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [activities, filters]);

  const loadActivities = async () => {
    try {
      const data = await activityService.getActivities();
      setActivities(data);
    } catch (error) {
      toast.error('Error al cargar actividades');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...activities];

    if (filters.priority) {
      filtered = filtered.filter((act) => act.priority === filters.priority);
    }

    if (filters.category) {
      filtered = filtered.filter((act) => act.category === filters.category);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (act) =>
          act.title.toLowerCase().includes(searchLower) ||
          (act.description && act.description.toLowerCase().includes(searchLower))
      );
    }

    setFilteredActivities(filtered);
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const { draggableId, destination } = result;
    const activityId = draggableId.replace('activity-', '');
    const newStatus = destination.droppableId;

    // Actualización optimista
    setActivities((prev) =>
      prev.map((act) => (act.id === parseInt(activityId) ? { ...act, status: newStatus } : act))
    );

    try {
      await activityService.updateActivityStatus(activityId, newStatus);
      toast.success('Estado actualizado');
    } catch (error) {
      toast.error('Error al actualizar estado');
      loadActivities(); // Recargar en caso de error
    }
  };

  const handleCreateActivity = () => {
    setSelectedActivity(null);
    setIsModalOpen(true);
  };

  const handleEditActivity = (activity) => {
    setSelectedActivity(activity);
    setIsModalOpen(true);
  };

  const handleDeleteActivity = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta actividad?')) return;

    try {
      await activityService.deleteActivity(id);
      setActivities((prev) => prev.filter((act) => act.id !== id));
      toast.success('Actividad eliminada');
    } catch (error) {
      toast.error('Error al eliminar actividad');
    }
  };

  const handleModalSave = () => {
    setIsModalOpen(false);
    loadActivities();
  };

  const getActivitiesByStatus = (status) => {
    return filteredActivities.filter((act) => act.status === status);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando actividades...</p>
      </div>
    );
  }

  return (
    <div className="kanban-board">
      <div className="board-header">
        <h2>Mis Actividades</h2>
        <button className="btn btn-primary" onClick={handleCreateActivity}>
          + Nueva Actividad
        </button>
      </div>

      <Filters filters={filters} setFilters={setFilters} />

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="board-columns">
          {Object.entries(columns).map(([status, column]) => (
            <div key={status} className="board-column">
              <div className="column-header" style={{ borderColor: column.color }}>
                <h3>{column.title}</h3>
                <span className="activity-count">{getActivitiesByStatus(status).length}</span>
              </div>

              <Droppable droppableId={status}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`column-content ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
                  >
                    {getActivitiesByStatus(status).map((activity, index) => (
                      <Draggable
                        key={activity.id}
                        draggableId={`activity-${activity.id}`}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={provided.draggableProps.style}
                          >
                            <ActivityCard
                              activity={activity}
                              onEdit={handleEditActivity}
                              onDelete={handleDeleteActivity}
                              isDragging={snapshot.isDragging}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}

                    {getActivitiesByStatus(status).length === 0 && (
                      <div className="empty-column">
                        <p>No hay actividades aquí</p>
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      {isModalOpen && (
        <ActivityModal
          activity={selectedActivity}
          onClose={() => setIsModalOpen(false)}
          onSave={handleModalSave}
        />
      )}
    </div>
  );
};

export default KanbanBoard;
