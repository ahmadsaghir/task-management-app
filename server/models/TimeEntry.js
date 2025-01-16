import mongoose from 'mongoose';

const timeEntrySchema = new mongoose.Schema({
    taskId: {type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true},
    projectId: {type: mongoose.Schema.Types.ObjectId, ref: 'Project'},
    startTime: {type: Date, required: true},
    duration: {type: Number, required: true},
    taskName: {type: String, required: true},
    projectName: {type: String, default: 'Inbox'},
    userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true}
}, {timestamps: true});

export default mongoose.model('TimeEntry', timeEntrySchema);