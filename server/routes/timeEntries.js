import express from 'express';
import TimeEntry from '../models/TimeEntry.js';
import { protect } from '../middleware/auth.js';
import { cache, clearCache } from '../middleware/cache.js';

const router = express.Router();

router.get('/', protect, cache(300), async (req, res) => {
    try {
        const entries = await TimeEntry.find({ userId: req.user._id }).sort({startTime: -1});
        res.json(entries);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
});
router.post('/', protect, async (req, res) => {
    try {
        const entry = new TimeEntry({
            taskId: req.body.taskId,
            projectId: req.body.projectId || null,
            startTime: new Date(req.body.startTime),
            duration: parseInt(req.body.duration),
            taskName: req.body.taskName,
            projectName: req.body.projectName || 'Inbox',
            userId: req.user._id
        });

        const savedEntry = await entry.save();
        await clearCache(`cache:/api/time-entries:${req.user._id}`);
        res.status(201).json(savedEntry);
    } catch (error) {
        console.error('Error saving time entry:', error);
        res.status(400).json({message: error.message});
    }
});

router.delete('/:id', protect, async (req, res) => {
    try {
        const entry = await TimeEntry.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!entry) {
            return res.status(404).json({message: 'Entry not found'});
        }
        res.json({message: 'Entry deleted'});
    } catch (error) {
        res.status(500).json({message: error.message});
    }
});

export default router;