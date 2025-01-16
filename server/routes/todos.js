import express from 'express';
import Todo from '../models/Todo.js';
import { protect } from '../middleware/auth.js';
import { cache, clearCache } from '../middleware/cache.js';

const router = express.Router();

// Get all todos
router.get('/', protect, cache(300), async (req, res) => {
    try {
        const todos = await Todo.find({ userId: req.user._id }).sort('order');
        res.json(todos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create new todo
router.post('/', protect, async (req, res) => {
    try {
        // Get the highest order in the column
        const highestOrder = await Todo.findOne({
            userId: req.user._id,
            columnId: req.body.columnId
        }).sort('-order');

        const todo = new Todo({
            content: req.body.content,
            columnId: req.body.columnId,
            order: highestOrder ? highestOrder.order + 1 : 0,
            userId: req.user._id
        });

        const newTodo = await todo.save();
        await clearCache(`cache:/api/todos:${req.user._id}`);
        res.status(201).json(newTodo);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update todo
router.patch('/:id', protect, async (req, res) => {
    try {
        // First, if changing column or order, update orders of other todos
        if (req.body.columnId || req.body.order !== undefined) {
            const todo = await Todo.findOne({
                _id: req.params.id,
                userId: req.user._id
            });

            if (!todo) {
                return res.status(404).json({ message: 'Todo not found' });
            }

            // If moving to a new column
            if (req.body.columnId && req.body.columnId !== todo.columnId) {
                // Update orders in the new column
                await Todo.updateMany(
                    {
                        userId: req.user._id,
                        columnId: req.body.columnId,
                        order: { $gte: req.body.order }
                    },
                    { $inc: { order: 1 } }
                );
            }

            // Update the todo itself
            if (req.body.content) todo.content = req.body.content;
            if (req.body.columnId) todo.columnId = req.body.columnId;
            if (req.body.order !== undefined) todo.order = req.body.order;

            const updatedTodo = await todo.save();
            res.json(updatedTodo);
        } else {
            // Simple update without order changes
            const updatedTodo = await Todo.findOneAndUpdate(
                { _id: req.params.id, userId: req.user._id },
                { $set: req.body },
                { new: true }
            );

            if (!updatedTodo) {
                return res.status(404).json({ message: 'Todo not found' });
            }

            res.json(updatedTodo);
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update multiple todos (for reordering)
router.patch('/reorder/:columnId', protect, async (req, res) => {
    try {
        await Todo.bulkWrite(updates);
        await clearCache(`cache:/api/todos:${req.user._id}`);
        res.json({ message: 'Todos reordered successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete todo
router.delete('/:id', protect, async (req, res) => {
    try {
        const todo = await Todo.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!todo) {
            return res.status(404).json({ message: 'Todo not found' });
        }
        res.json({ message: 'Todo deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;