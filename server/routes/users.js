import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', async (req, res) => {
    try {
        const { email, password, name, surname } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({ email, password, name, surname });
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

        res.status(201).json({
            _id: user._id,
            email: user.email,
            name: user.name,
            surname: user.surname,
            role: user.role,
            token
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

        res.json({
            _id: user._id,
            email: user.email,
            name: user.name,
            surname: user.surname,
            role: user.role,
            token
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.get('/me', protect, async (req, res) => {
    res.json(req.user);
});

router.put('/me', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        user.email = req.body.email || user.email;
        user.name = req.body.name || user.name;
        user.surname = req.body.surname || user.surname;
        if (req.body.password) {
            user.password = req.body.password;
        }

        const updatedUser = await user.save();
        const token = jwt.sign({ id: updatedUser._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

        res.json({
            _id: updatedUser._id,
            email: updatedUser.email,
            name: updatedUser.name,
            surname: updatedUser.surname,
            role: updatedUser.role,
            token
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

export default router;