import React from 'react';
import './Board.css';

const Filters = ({ filters, setFilters }) => {
  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const clearFilters = () => {
    setFilters({ priority: '', category: '', search: '' });
  };

  return (
    <div className="filters-container">
      <div className="filters-grid">
        <input
          type="text"
          name="search"
          className="input"
          placeholder="Buscar actividades..."
          value={filters.search}
          onChange={handleChange}
        />

        <select name="priority" className="input" value={filters.priority} onChange={handleChange}>
          <option value="">Todas las prioridades</option>
          <option value="alta">Alta</option>
          <option value="media">Media</option>
          <option value="baja">Baja</option>
        </select>

        <select name="category" className="input" value={filters.category} onChange={handleChange}>
          <option value="">Todas las categorías</option>
          <option value="Personal">Personal</option>
          <option value="Trabajo">Trabajo</option>
          <option value="Estudios">Estudios</option>
          <option value="Otros">Otros</option>
        </select>

        <button className="btn btn-secondary" onClick={clearFilters}>
          Limpiar Filtros
        </button>
      </div>
    </div>
  );
};

export default Filters;
