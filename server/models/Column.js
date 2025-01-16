// Column.js - Replace with this updated schema
import mongoose from 'mongoose';

const columnSchema = new mongoose.Schema({
    title: { type: String, required: true },
    boardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Board', required: true },
    order: { type: Number, default: 0 }, // Add default value
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

export default mongoose.model('Column', columnSchema);