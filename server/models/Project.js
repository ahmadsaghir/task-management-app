import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
    name: {type: String, required: true},
    icon: {type: String, default: 'Folder'},
    userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true}
}, { timestamps: true });

export default mongoose.model('Project', projectSchema);