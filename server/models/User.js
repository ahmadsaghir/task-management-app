import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// models/User.js - Update the schema to include googleId
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    surname: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: function() {
            return !this.googleId; // Password only required if not Google auth
        },
        validate: {
            validator: function(password) {
                if (!this.googleId) { // Only validate if not Google auth
                    return password.length >= 8 &&
                        /[A-Z]/.test(password) &&
                        /[a-z]/.test(password) &&
                        /[0-9]/.test(password) &&
                        /[!@#$%^&*(),.?":{}|<>]/.test(password);
                }
                return true;
            },
            message: 'Password must be at least 8 characters and contain uppercase, lowercase, number, and symbol'
        }
    },
    googleId: {
        type: String,
        sparse: true,
        unique: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationToken: String,
    verificationTokenExpires: Date,
    resetPasswordToken: String,
    resetPasswordExpires: Date
}, { timestamps: true });
// Remove all indexes and recreate them
userSchema.index({ email: 1 }, { unique: true });

userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);