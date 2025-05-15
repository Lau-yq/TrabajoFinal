import React, { useState, useContext } from 'react'; // <-- Importa useState aquí
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const CreateTask = () => {
  const { token } = useContext(AuthContext);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [message, setMessage] = useState('');

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

      await axios.post('/api/tasks', taskData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessage('Tarea creada exitosamente');
      setTitle('');
      setDescription('');
      setDueDate('');
    } catch (error) {
      setMessage(error.response?.data?.msg || 'Error al crear la tarea');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Crear nueva tarea</h3>
      {message && <p>{message}</p>}
      <input
        type="text"
        placeholder="Título"
        value={title}
        onChange={e => setTitle(e.target.value)}
        required
      /><br />
      <textarea
        placeholder="Descripción (opcional)"
        value={description}
        onChange={e => setDescription(e.target.value)}
      /><br />
      <input
        type="date"
        value={dueDate}
        min={getTodayDate()}
        onChange={e => setDueDate(e.target.value)}
      /><br />
      <button type="submit">Crear Tarea</button>
    </form>
  );
};

export default CreateTask;