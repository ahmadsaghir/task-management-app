import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Project from './models/Project.js';
import Task from './models/Task.js';
import TimeEntry from './models/TimeEntry.js';
import User from './models/User.js';

dotenv.config();

const migrateData = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Get the first user (or you can specify a specific user ID)
        const user = await User.findOne();

        if (!user) {
            console.log('No user found. Please create a user first.');
            process.exit(1);
        }

        console.log(`Migrating data for user: ${user.email}`);

        // Update Projects
        const projectsResult = await Project.updateMany(
            { userId: { $exists: false } },
            { $set: { userId: user._id } }
        );
        console.log(`Updated ${projectsResult.modifiedCount} projects`);

        // Update Tasks
        const tasksResult = await Task.updateMany(
            { userId: { $exists: false } },
            { $set: { userId: user._id } }
        );
        console.log(`Updated ${tasksResult.modifiedCount} tasks`);

        // Update TimeEntries
        const timeEntriesResult = await TimeEntry.updateMany(
            { userId: { $exists: false } },
            { $set: { userId: user._id } }
        );
        console.log(`Updated ${timeEntriesResult.modifiedCount} time entries`);

        console.log('Migration completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrateData();