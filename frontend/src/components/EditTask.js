import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const EditTask = ({ task, onClose, onTaskUpdated }) => {
  const { token } = useContext(AuthContext);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [status, setStatus] = useState(task.status);
  const [dueDate, setDueDate] = useState(task.dueDate ? task.dueDate.slice(0,10) : '');
  const [error, setError] = useState('');

  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description || '');
    setStatus(task.status);
    setDueDate(task.dueDate ? task.dueDate.slice(0,10) : '');
  }, [task]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('El título es obligatorio');
      return;
    }

    if (status === 'en progreso' && task.status !== 'pendiente') {
      setError('Solo se puede marcar "en progreso" desde "pendiente"');
      return;
    }
    if (status === 'pendiente' && task.status !== 'pendiente') {
      setError('No se puede volver a "pendiente" desde otro estado');
      return;
    }
    if (task.status === 'completada') {
      setError('Una tarea completada no puede modificarse');
      return;
    }
    if (status === 'completada' && task.status !== 'en progreso') {
      setError('Solo se puede marcar como completada si está en progreso');
      return;
    }

    try {
      const updatedTask = {
        title,
        description,
        status,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      };

      await axios.put(`/api/tasks/${task._id}`, updatedTask, {
        headers: { Authorization: `Bearer ${token}` },
      });

      onTaskUpdated();
      onClose();
    } catch (err) {
      setError(err.response?.data?.msg || 'Error al actualizar la tarea');
    }
  };

  return (
    <div>
      <h3>Editar tarea</h3>
      {error && <p className="edit-error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
        /><br />
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Descripción (opcional)"
        /><br />
        <select value={status} onChange={e => setStatus(e.target.value)}>
          <option value="pendiente">Pendiente</option>
          <option value="en progreso">En progreso</option>
          <option value="completada">Completada</option>
        </select><br />
        <input
          type="date"
          value={dueDate}
          onChange={e => setDueDate(e.target.value)}
        /><br />
        <button type="submit">Guardar</button>
        <button type="button" onClick={onClose} className="cancel" style={{ marginLeft: 8 }}>
          Cancelar
        </button>
      </form>
    </div>
  );
};

export default EditTask;