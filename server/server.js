import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { createClient } from 'redis';
import redisClient from './config/redis.js';

import taskRoutes from './routes/tasks.js';
import projectRoutes from './routes/projects.js';
import timeEntryRoutes from './routes/timeEntries.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import habitRoutes from './routes/habits.js';
import todoRoutes from './routes/todos.js';
import columnRoutes from './routes/columns.js';
import boardRoutes from './routes/boards.js';

dotenv.config();

const app = express();

app.use(cors({
    origin: 'http://localhost:3005',
    credentials: true
}));
app.use(express.json());

// MongoDB Connection with index creation
mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('Connected to MongoDB');

        // Drop existing indexes if any
        try {
            await mongoose.connection.db.collection('users').dropIndexes();
        } catch (error) {
            console.log('No existing indexes to drop');
        }

        // Create new index
        try {
            await mongoose.connection.db.collection('users').createIndex({ email: 1 }, { unique: true });
        } catch (error) {
            console.log('Error creating index:', error);
        }
    })
    .catch(err => console.error('MongoDB connection error:', err));

app.get('/', (req, res) => {
    res.json({ message: 'Server is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/time-entries', timeEntryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/todos', todoRoutes);
app.use('/api/columns', columnRoutes);
app.use('/api/boards', boardRoutes);
app.use(cookieParser());


const PORT = process.env.PORT || 5005;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});