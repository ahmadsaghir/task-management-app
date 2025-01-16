import express from 'express';
import Board from '../models/Board.js';
import Column from '../models/Column.js';
import Todo from '../models/Todo.js';
import { protect } from '../middleware/auth.js';
import { cache, clearCache } from '../middleware/cache.js';

const router = express.Router();

// Get all boards
router.get('/', protect, cache(300), async (req, res) => {
    try {
        const boards = await Board.find({ userId: req.user._id }).sort('-updatedAt');
        res.json(boards);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get single board
router.get('/:id', protect, async (req, res) => {
    try {
        const board = await Board.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!board) {
            return res.status(404).json({ message: 'Board not found' });
        }

        res.json(board);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create board
router.post('/', protect, async (req, res) => {
    try {
        const board = new Board({
            title: req.body.title,
            description: req.body.description,
            background: req.body.background,
            userId: req.user._id
        });

        const savedBoard = await board.save();

        // Create default columns
        const defaultColumns = ['To Do', 'In Progress', 'Done'];
        const columnPromises = defaultColumns.map((title, index) => {
            return Column.create({
                title,
                boardId: savedBoard._id,
                order: index,
                userId: req.user._id
            });
        });

        await Promise.all(columnPromises);
        await clearCache(`cache:/api/boards:${req.user._id}`);
        res.status(201).json(savedBoard);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});
// Update board
router.patch('/:id', protect, async (req, res) => {
    try {
        const board = await Board.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            { $set: req.body },
            { new: true }
        );

        if (!board) {
            return res.status(404).json({ message: 'Board not found' });
        }

        res.json(board);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete board and all associated data
// boards.js - Replace the DELETE route
router.delete('/:id', protect, async (req, res) => {
    try {
        // First find the board
        const board = await Board.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!board) {
            return res.status(404).json({ message: 'Board not found' });
        }

        // Find all columns for this board
        const columns = await Column.find({ boardId: board._id });

        // Delete all todos for each column
        for (const column of columns) {
            await Todo.deleteMany({ columnId: column._id });
        }

        // Delete all columns
        await Column.deleteMany({ boardId: board._id });

        // Finally delete the board
        await Board.deleteOne({ _id: board._id });

        res.json({ message: 'Board deleted successfully' });
    } catch (error) {
        console.error('Error deleting board:', error);
        res.status(500).json({ message: error.message });
    }
});
export default router;