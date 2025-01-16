import mongoose from 'mongoose';

const todoSchema = new mongoose.Schema({
    content: { type: String, required: true },
    columnId: { type: mongoose.Schema.Types.ObjectId, ref: 'Column', required: true },
    order: { type: Number, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

export default mongoose.model('Todo', todoSchema);