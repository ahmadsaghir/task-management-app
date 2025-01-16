import express from 'express';
import Project from '../models/Project.js';
import { protect } from '../middleware/auth.js';
import { cache, clearCache } from '../middleware/cache.js';

const router = express.Router();

router.get('/', protect, cache(300), async (req, res) => {
    try {
        const projects = await Project.find({ userId: req.user._id });
        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
router.post('/', protect, async (req, res) => {
    try {
        const project = new Project({
            ...req.body,
            userId: req.user._id
        });
        const savedProject = await project.save();
        await clearCache(`cache:/api/projects:${req.user._id}`);
        res.status(201).json(savedProject);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});
router.patch('/:id', protect, async (req, res) => {
    try {
        const project = await Project.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        Object.assign(project, req.body);
        const updatedProject = await project.save();
        res.json(updatedProject);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.delete('/:id', protect, async (req, res) => {
    try {
        const project = await Project.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        await clearCache(`cache:/api/projects:${req.user._id}`);
        res.json({ message: 'Project deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
export default router;