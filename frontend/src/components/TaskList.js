import React, { useEffect, useState, useContext, useCallback } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import TaskCard from './TaskCard';

const TaskList = ({ refresh }) => {
  const { token } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);

  // Estados para filtros
  const [filterStatus, setFilterStatus] = useState('todos');
  const [searchText, setSearchText] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchTasks = useCallback(() => {
    if (!token) return;

    axios
      .get('/api/tasks', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setTasks(res.data))
      .catch(err => console.error(err));
  }, [token]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks, refresh]);

  // Función para eliminar tarea
  const handleDelete = async (task) => {
    if (!window.confirm(`¿Seguro que quieres eliminar la tarea "${task.title}"?`)) return;

    try {
      await axios.delete(`/api/tasks/${task._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchTasks(); // Refresca la lista tras eliminar
    } catch (error) {
      console.error('Error al eliminar tarea', error);
    }
  };

  // Filtrado combinado: estado, texto y rango de fechas
  const filteredTasks = tasks.filter(task => {
    const matchesStatus = filterStatus === 'todos' || task.status === filterStatus;
    const matchesSearch = task.title.toLowerCase().includes(searchText.toLowerCase());

    if (!task.dueDate) return matchesStatus && matchesSearch;

    const taskDate = new Date(task.dueDate).setHours(0,0,0,0);
    const start = startDate ? new Date(startDate).setHours(0,0,0,0) : null;
    const end = endDate ? new Date(endDate).setHours(0,0,0,0) : null;

    const afterStart = start ? taskDate >= start : true;
    const beforeEnd = end ? taskDate <= end : true;

    return matchesStatus && matchesSearch && afterStart && beforeEnd;
  });

  return (
    <div>
      <h2>Mis Tareas</h2>

      {/* Controles de filtro */}
      <div style={{ marginBottom: '15px', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Filtro por estado */}
        <label htmlFor="filterStatus" style={{ display: 'flex', alignItems: 'center' }}>
          Filtrar por estado:&nbsp;
          <select
            id="filterStatus"
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
          >
            <option value="todos">Todos</option>
            <option value="pendiente">Pendiente</option>
            <option value="en progreso">En progreso</option>
            <option value="completada">Completada</option>
          </select>
        </label>

        {/* Búsqueda por título */}
        <label htmlFor="searchText" style={{ display: 'flex', alignItems: 'center' }}>
          Buscar por título:&nbsp;
          <input
            id="searchText"
            type="text"
            placeholder="Escribe para buscar..."
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{ padding: '6px 8px', borderRadius: 4, border: '1px solid #ccc' }}
          />
        </label>

        {/* Filtro por rango de fechas */}
        <label htmlFor="startDate" style={{ display: 'flex', alignItems: 'center' }}>
          Desde:&nbsp;
          <input
            id="startDate"
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
          />
        </label>

        <label htmlFor="endDate" style={{ display: 'flex', alignItems: 'center' }}>
          Hasta:&nbsp;
          <input
            id="endDate"
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
          />
        </label>
      </div>

      {/* Renderizado de tareas filtradas */}
      {filteredTasks.length === 0 ? (
        <p>No tienes tareas que coincidan con los criterios.</p>
      ) : (
        filteredTasks.map(task => (
          <TaskCard
            key={task._id}
            task={task}
            onTaskUpdated={fetchTasks}
            onComplete={async (task) => {
              try {
                await axios.put(`/api/tasks/${task._id}`, { status: 'completada' }, {
                  headers: { Authorization: `Bearer ${token}` },
                });
                fetchTasks();
              } catch (error) {
                console.error('Error al marcar como completada', error);
              }
            }}
            onDelete={handleDelete} 
          />
        ))
      )}
    </div>
  );
};

export default TaskList;