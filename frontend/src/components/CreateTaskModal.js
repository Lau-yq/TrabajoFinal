import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const CreateTaskModal = ({ isOpen, onClose, onTaskCreated }) => {
  const { token } = useContext(AuthContext);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [message, setMessage] = useState('');

  if (!isOpen) return null; // No renderizar si no está abierto

  const handleSubmit = async e => {
    e.preventDefault();
    if (!title.trim()) {
      setMessage('El título es obligatorio');
      return;
    }
    try {
      const taskData = {
        title,
        description,
        dueDate: dueDate ? new Date(dueDate + 'T12:00:00').toISOString() : undefined,
      };

      await axios.post('https://trabajofinal-3wto.onrender.com/api/tasks', taskData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessage('Tarea creada exitosamente');
      setTitle('');
      setDescription('');
      setDueDate('');
      onTaskCreated();
      onClose();
    } catch (error) {
      setMessage(error.response?.data?.msg || 'Error al crear la tarea');
    }
  };

  return (
    <>
      <div className="modal-overlay" onClick={onClose} />
      <div className="modal-content" role="dialog" aria-modal="true">
        <h3>Crear nueva tarea</h3>
        {message && <p className="modal-message">{message}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Título"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
          <textarea
            placeholder="Descripción (opcional)"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
          <input
            type="date"
            value={dueDate}
            min={getTodayDate()}
            onChange={e => setDueDate(e.target.value)}
          />
          <div className="modal-buttons">
            <button type="submit">Crear Tarea</button>
            <button type="button" onClick={onClose} className="cancel-button">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default CreateTaskModal;