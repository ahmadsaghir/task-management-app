import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
    text: { type: String, required: true },
    description: String,
    date: { type: Date, required: true },
    isComplete: { type: Boolean, default: false },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true}
}, { timestamps: true });

export default mongoose.model('Task', taskSchema);