import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect, admin } from '../middleware/auth.js';
import rateLimit from 'express-rate-limit';
import crypto from 'crypto';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/emailService.js';
import { OAuth2Client } from 'google-auth-library';


const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
// Rate limiter middleware
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per window
    message: { message: 'Too many login attempts. Please try again later.' }
});

const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 attempts per hour
    message: { message: 'Too many registration attempts. Please try again later.' }
});

router.post('/google', async (req, res) => {
    try {
        const { token } = req.body;

        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const { email, given_name, family_name, sub: googleId } = ticket.getPayload();

        let user = await User.findOne({ email });

        if (!user) {
            // Create new user if doesn't exist
            user = new User({
                email,
                name: given_name,
                surname: family_name,
                googleId,
                isVerified: true // Google accounts are pre-verified
            });
            await user.save();
        } else if (!user.googleId) {
            // If user exists but hasn't used Google before, update their Google ID
            user.googleId = googleId;
            await user.save();
        }

        const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
        const refreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.json({
            _id: user._id,
            email: user.email,
            name: user.name,
            surname: user.surname,
            role: user.role,
            isVerified: user.isVerified,
            accessToken
        });
    } catch (error) {
        console.error('Google auth error:', error);
        res.status(401).json({ message: 'Invalid Google token' });
    }
});
router.post('/register', registerLimiter, async (req, res) => {
    try {
        const { email, password, name, surname } = req.body;

        if (!name || !surname) {
            return res.status(400).json({ message: 'Name and surname are required' });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        const user = new User({
            name,
            surname,
            email,
            password,
            verificationToken,
            verificationTokenExpires
        });

        await user.save();
        await sendVerificationEmail(email, verificationToken);

        const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
        const refreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(201).json({
            _id: user._id,
            email: user.email,
            name: user.name,
            surname: user.surname,
            role: user.role,
            isVerified: user.isVerified,
            accessToken
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(400).json({ message: error.message });
    }
});
router.post('/login', loginLimiter, async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Login attempt for:', email);

        const user = await User.findOne({ email });
        if (!user) {
            console.log('User not found');
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isMatch = await user.comparePassword(password);
        console.log('Password match:', isMatch);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        if (!user.isVerified) {
            console.log('User not verified');
            return res.status(403).json({
                message: 'Please verify your email before logging in',
                isVerified: false
            });
        }

        const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
        const refreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.json({
            _id: user._id,
            email: user.email,
            name: user.name,
            surname: user.surname,
            role: user.role,
            isVerified: user.isVerified,
            accessToken
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(400).json({ message: error.message });
    }
});
router.get('/verify-email/:token', async (req, res) => {
    try {
        console.log('Verification attempt with token:', req.params.token);

        // First try to find by token
        const user = await User.findOne({
            verificationToken: req.params.token,
            verificationTokenExpires: { $gt: Date.now() }
        });

        // If no user found with this token, check if a user was already verified with this token
        if (!user) {
            // Check if any user has isVerified true and no verification token
            // This indicates the token was already used
            const verifiedUser = await User.findOne({
                isVerified: true,
                verificationToken: { $exists: false }
            });

            if (verifiedUser) {
                return res.status(200).json({
                    message: 'Email already verified',
                    alreadyVerified: true
                });
            }

            return res.status(400).json({ message: 'Invalid or expired verification token' });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpires = undefined;
        await user.save();

        console.log('User verified successfully');
        res.status(200).json({ message: 'Email verified successfully' });
    } catch (error) {
        console.error('Verification error:', error);
        res.status(400).json({ message: error.message });
    }
});
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        await user.save();

        try {
            await sendPasswordResetEmail(email, resetToken);
            res.json({ message: 'Password reset email sent' });
        } catch (emailError) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            await user.save();
            throw new Error('Failed to send password reset email');
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});
router.post('/reset-password/:token', async (req, res) => {
    try {
        const user = await User.findOne({
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.json({ message: 'Password reset successful' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});
router.post('/resend-verification', async (req, res) => {
    try {
        console.log('Received resend verification request for:', req.body.email);
        const { email } = req.body;

        const user = await User.findOne({ email });
        console.log('User found:', user ? 'Yes' : 'No');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: 'Email is already verified' });
        }

        const verificationToken = crypto.randomBytes(32).toString('hex');
        user.verificationToken = verificationToken;
        user.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

        console.log('Saving new verification token');
        await user.save();

        console.log('Attempting to send verification email');
        await sendVerificationEmail(email, verificationToken);
        console.log('Verification email sent successfully');

        res.json({ message: 'Verification email resent' });
    } catch (error) {
        console.error('Resend verification error:', error);
        res.status(400).json({ message: error.message });
    }
});
router.post('/refresh-token', async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return res.status(401).json({ message: 'Refresh token not found' });
        }

        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
        res.json({ accessToken });
    } catch (error) {
        res.status(401).json({ message: 'Invalid refresh token' });
    }
});
router.post('/logout', protect, async (req, res) => {
    res.cookie('refreshToken', '', {
        httpOnly: true,
        expires: new Date(0)
    });
    res.json({ message: 'Logged out successfully' });
});
router.get('/me', protect, async (req, res) => {
    res.json(req.user);
});
router.put('/me', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if email is being changed and if it's already in use
        if (req.body.email && req.body.email !== user.email) {
            const emailExists = await User.findOne({ email: req.body.email });
            if (emailExists) {
                return res.status(400).json({ message: 'Email already in use' });
            }
        }

        // If updating password, verify current password
        if (req.body.password) {
            if (!req.body.currentPassword) {
                return res.status(400).json({ message: 'Current password is required' });
            }

            const isMatch = await user.comparePassword(req.body.currentPassword);
            if (!isMatch) {
                return res.status(400).json({ message: 'Current password is incorrect' });
            }
        }

        // Update user fields
        user.name = req.body.name || user.name;
        user.surname = req.body.surname || user.surname;
        user.email = req.body.email || user.email;

        if (req.body.password) {
            user.password = req.body.password;
        }

        const updatedUser = await user.save();
        const accessToken = jwt.sign({ id: updatedUser._id }, process.env.JWT_SECRET, { expiresIn: '15m' });

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            surname: updatedUser.surname,
            email: updatedUser.email,
            role: updatedUser.role,
            accessToken
        });
    } catch (error) {
        // Handle mongoose validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ message: messages.join(', ') });
        }

        res.status(500).json({ message: 'Server error updating profile' });
    }
});
router.delete('/me', protect, async (req, res) => {
    try {
        // Delete the user
        await User.findByIdAndDelete(req.user._id);

        // Send a success response
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error deleting user' });
    }
});

export default router;