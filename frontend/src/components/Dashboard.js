import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import TaskList from './TaskList';
import CreateTaskModal from './CreateTaskModal'; // o tu componente para crear tarea
import { AuthContext } from '../context/AuthContext';

const Dashboard = () => {
  const [refresh, setRefresh] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleTaskCreated = () => setRefresh(!refresh);

  const handleLogout = () => {
    logout();         // Limpia token y estado de auth
    navigate('/login'); // Redirige a login sin recargar la página
  };

  return (
    <div className="dashboard-wrapper">
      <header className="dashboard-header">
        <button
          className="open-modal-button"
          onClick={() => setIsModalOpen(true)}
        >
          Crear tarea
        </button>

        <button
          className="logout-button"
          onClick={logout}
        >
          Cerrar sesión
        </button>
      </header>

      <main className="dashboard-content">
        <TaskList refresh={refresh} />
      </main>

      <CreateTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onTaskCreated={handleTaskCreated}
      />
    </div>
  );
};

export default Dashboard;