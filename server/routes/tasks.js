import express from 'express';
import Task from '../models/Task.js';
import { protect } from '../middleware/auth.js';
import { cache, clearCache } from '../middleware/cache.js';

const router = express.Router();

router.get('/', protect, cache(300), async (req, res) => {
    try {
        const tasks = await Task.find({ userId: req.user._id });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
router.post('/', protect, async (req, res) => {
    try {
        const task = new Task({
            text: req.body.text,
            description: req.body.description,
            date: req.body.date,
            projectId: req.body.projectId || null,
            isComplete: req.body.isComplete || false,
            userId: req.user._id
        });

        const newTask = await task.save();
        await clearCache(`cache:/api/tasks:${req.user._id}`);
        res.status(201).json(newTask);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});
router.patch('/:id', protect, async (req, res) => {
    try {
        const task = await Task.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        if (req.body.text) task.text = req.body.text;
        if (req.body.description !== undefined) task.description = req.body.description;
        if (req.body.date) task.date = req.body.date;
        if (req.body.projectId !== undefined) task.projectId = req.body.projectId;
        if (req.body.isComplete !== undefined) task.isComplete = req.body.isComplete;

        const updatedTask = await task.save();
        res.json(updatedTask);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.delete('/:id', protect, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.json({ message: 'Task deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;