
const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Task = require('../models/Task');

// Crear tarea
router.post(
  '/',
  [
    auth,
    check('title', 'El título es obligatorio').not().isEmpty(),
    check('status').optional().isIn(['pendiente', 'en progreso', 'completada']),
    check('dueDate').optional().isISO8601().toDate(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { title, description, status, dueDate } = req.body;

    let dueDateFixed = dueDate ? new Date(dueDate) : undefined;
    if (dueDateFixed) {
      dueDateFixed.setHours(12, 0, 0, 0); // Fija la hora a 12:00 para evitar desplazamiento
    }

    try {
      // Nueva tarea inicia en "pendiente" sin importar lo que envíen
      const task = new Task({
        title,
        description,
        status: 'pendiente',
        dueDate: dueDateFixed,
        user: req.user.id,
      });

      await task.save();
      res.json({ message: 'Tarea creada exitosamente', task });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Error en el servidor');
    }
  }
);



// Obtener todas las tareas con filtro y búsqueda
router.get('/', auth, async (req, res) => {
  try {
    const { status, search, dueDate } = req.query;
    const query = { user: req.user.id };

    if (status) query.status = status;
    if (dueDate) query.dueDate = { $lte: new Date(dueDate) };
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const tasks = await Task.find(query).sort({ dueDate: 1 });
    res.json(tasks);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en el servidor');
  }
});



// Obtener tarea específica
router.get('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user.id });
    if (!task) return res.status(404).json({ msg: 'Tarea no encontrada' });
    res.json(task);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') return res.status(404).json({ msg: 'Tarea no encontrada' });
    res.status(500).send('Error en el servidor');
  }
});



// Actualizar tarea
router.put('/:id', auth, async (req, res) => {
  const { title, description, status, dueDate } = req.body;
  let dueDateFixed = dueDate ? new Date(dueDate) : undefined;
  if (dueDateFixed) {
      dueDateFixed.setHours(12, 0, 0, 0); // Fija la hora a 12:00 para evitar desplazamiento
  }


  try {
    let task = await Task.findOne({ _id: req.params.id, user: req.user.id });
    if (!task) return res.status(404).json({ msg: 'Tarea no encontrada' });

    // Reglas de estado
    if (status) {
      if (status === 'en progreso' && task.status !== 'pendiente') {
        return res.status(400).json({ msg: 'Solo se puede marcar "en progreso" desde "pendiente"' });
      }
      if (status === 'pendiente' && task.status !== 'pendiente') {
        return res.status(400).json({ msg: 'No se puede volver a "pendiente" desde otro estado' });
      }
      if (task.status === 'completada') {
        return res.status(400).json({ msg: 'Una tarea completada no puede modificarse' });
      }
      if (status === 'completada' && task.status !== 'en progreso') {
        return res.status(400).json({ msg: 'Solo se puede marcar como completada si está en progreso' });
      }
    }

    // Actualizar campos permitidos
    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (status) task.status = status;
    if (dueDate) task.dueDate = dueDateFixed;

    await task.save();
    res.json({ message: 'Tarea actualizada', task });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') return res.status(404).json({ msg: 'Tarea no encontrada' });
    res.status(500).send('Error en el servidor');
  }
});



// Eliminar tarea (solo si está completada)
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user.id });
    if (!task) return res.status(404).json({ msg: 'Tarea no encontrada' });

    if (task.status !== 'completada') {
      return res.status(400).json({ msg: 'Solo se pueden eliminar tareas completadas' });
    }

    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Tarea eliminada' });
  } catch (err) {
    console.error(err);
    if (err.kind === 'ObjectId') return res.status(404).json({ msg: 'Tarea no encontrada' });
    res.status(500).send('Error en el servidor');
  }
});



module.exports = router;