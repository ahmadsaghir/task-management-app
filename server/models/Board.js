import mongoose from 'mongoose';

const boardSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    background: { type: String, default: '#f3f4f6' } // Default background color
}, { timestamps: true });

export default mongoose.model('Board', boardSchema);