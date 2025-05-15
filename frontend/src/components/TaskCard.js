import React, { useState } from 'react';
import EditTask from './EditTask';

const TaskCard = ({ task, onTaskUpdated, onComplete, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleEditClick = () => setIsEditing(true);
  const handleCloseEdit = () => setIsEditing(false);

  return (
    <div className={`task-card ${task.status === 'completada' ? 'completed' : ''}`}>
      {!isEditing ? (
        <>
          <h3>{task.title}</h3>
          {task.description && <p>{task.description}</p>}
          <p><strong>Estado:</strong> {task.status}</p>
          <p><strong>Fecha límite:</strong> {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Sin fecha límite'}</p>

          <div>
            {task.status !== 'completada' && (
              <button onClick={handleEditClick} style={{ marginRight: '8px' }}>
                Editar
              </button>
            )}
            {task.status === 'en progreso' && (
              <button onClick={() => onComplete(task)} style={{ marginRight: '8px' }}>
                Marcar como completada
              </button>
            )}
            {task.status === 'completada' && (
              <button onClick={() => onDelete(task)} className="delete">
  Eliminar
</button>
            )}
          </div>
        </>
      ) : (
        <EditTask
          task={task}
          onClose={handleCloseEdit}
          onTaskUpdated={onTaskUpdated}
        />
      )}
    </div>
  );
};

export default TaskCard;