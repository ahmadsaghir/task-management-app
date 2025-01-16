import mongoose from 'mongoose';

const habitSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    goal: { type: Number, required: true },
    completions: { type: Map, of: Boolean },
    streak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

export default mongoose.model('Habit', habitSchema);