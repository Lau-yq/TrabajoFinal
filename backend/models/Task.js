
const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    status: {
        type: String,
        enum: ['pendiente', 'en progreso', 'completada'],
        default: 'pendiente',
        },
        dueDate: { type: Date },
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        },
    { timestamps: true });

module.exports = mongoose.model('Task', TaskSchema);