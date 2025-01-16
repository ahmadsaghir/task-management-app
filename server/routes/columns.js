import express from 'express';
import Column from '../models/Column.js';
import Todo from '../models/Todo.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Get all columns
router.get('/', protect, async (req, res) => {
    try {
        const { boardId } = req.query;
        const columns = await Column.find({
            userId: req.user._id,
            boardId: boardId
        }).sort('order');
        res.json(columns);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// Create new column
router.post('/', protect, async (req, res) => {
    try {
        const { title, boardId } = req.body;

        // Get highest order
        const lastColumn = await Column.findOne({
            boardId,
            userId: req.user._id
        }).sort('-order');

        const column = new Column({
            title,
            boardId,
            order: lastColumn ? lastColumn.order + 1 : 0,
            userId: req.user._id
        });

        const newColumn = await column.save();
        res.status(201).json(newColumn);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});
// Update column
// columns.js - Replace the reorder route
router.patch('/reorder/:boardId/batch', protect, async (req, res) => {
    try {
        const updates = req.body.columns.map((column, index) => ({
            updateOne: {
                filter: {
                    _id: column._id,
                    userId: req.user._id,
                    boardId: req.params.boardId
                },
                update: { $set: { order: index } }
            }
        }));

        await Column.bulkWrite(updates);
        res.json({ message: 'Columns reordered successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});
// Delete column and its todos
router.delete('/:id', protect, async (req, res) => {
    try {
        const column = await Column.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!column) {
            return res.status(404).json({ message: 'Column not found' });
        }

        // Delete all todos in this column
        await Todo.deleteMany({ columnId: req.params.id });

        res.json({ message: 'Column and associated todos deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Reorder columns
router.patch('/reorder/batch', protect, async (req, res) => {
    try {
        const updates = req.body.columns.map((column, index) => ({
            updateOne: {
                filter: { _id: column._id, userId: req.user._id },
                update: { $set: { order: index } }
            }
        }));

        await Column.bulkWrite(updates);
        res.json({ message: 'Columns reordered successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

export default router;