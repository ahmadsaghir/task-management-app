import express from 'express';
import Habit from '../models/Habit.js';
import { protect } from '../middleware/auth.js';
import { cache, clearCache } from '../middleware/cache.js';

const router = express.Router();

router.get('/', protect, cache(300), async (req, res) => {
    try {
        const habits = await Habit.find({ userId: req.user._id });
        res.json(habits);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
router.post('/', protect, async (req, res) => {
    try {
        const habit = new Habit({
            ...req.body,
            userId: req.user._id,
            completions: new Map(),
            streak: 0,
            longestStreak: 0
        });
        const savedHabit = await habit.save();
        await clearCache(`cache:/api/habits:${req.user._id}`);
        res.status(201).json(savedHabit);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});
router.patch('/:id/toggle', protect, async (req, res) => {
    try {
        const { date } = req.body;
        const habit = await Habit.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!habit) {
            return res.status(404).json({ message: 'Habit not found' });
        }

        const completions = habit.completions || new Map();
        if (completions.has(date)) {
            completions.delete(date);
        } else {
            completions.set(date, true);
        }

        habit.completions = completions;

        let currentStreak = 0;
        let currentDate = new Date();
        while (completions.get(currentDate.toISOString().split('T')[0])) {
            currentStreak++;
            currentDate.setDate(currentDate.getDate() - 1);
        }

        habit.streak = currentStreak;
        habit.longestStreak = Math.max(habit.longestStreak, currentStreak);

        const updatedHabit = await habit.save();
        await clearCache(`cache:/api/habits:${req.user._id}`);
        res.json(updatedHabit);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.delete('/:id', protect, async (req, res) => {
    try {
        const habit = await Habit.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!habit) {
            return res.status(404).json({ message: 'Habit not found' });
        }

        res.json({ message: 'Habit deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;