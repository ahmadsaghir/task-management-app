import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Verify transporter connection
transporter.verify(function(error, success) {
    if (error) {
        console.log("SMTP Error:", error);
    } else {
        console.log("SMTP server is ready to take our messages");
    }
});

export const sendVerificationEmail = async (email, verificationToken) => {
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;
    console.log('Verification URL:', verificationUrl); // Debug log

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Verify Your Email',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #6D70E0; text-align: center;">Verify Your Email</h1>
                <p style="font-size: 16px;">Thank you for registering! Please click the button below to verify your email address:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${verificationUrl}" 
                       style="background-color: #6D70E0; 
                              color: white; 
                              padding: 12px 30px; 
                              text-decoration: none; 
                              border-radius: 5px;
                              display: inline-block;">
                        Verify Email
                    </a>
                </div>
                <p style="font-size: 14px; color: #666;">This link will expire in 24 hours.</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Email Error:', error);
        throw new Error('Failed to send verification email');
    }
};

export const sendPasswordResetEmail = async (email, resetToken) => {
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Password Reset Request',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #6D70E0; text-align: center;">Password Reset Request</h1>
                <p style="font-size: 16px;">You recently requested to reset your password. Click the button below to reset it:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetUrl}" 
                       style="background-color: #6D70E0; 
                              color: white; 
                              padding: 12px 30px; 
                              text-decoration: none; 
                              border-radius: 5px;
                              display: inline-block;">
                        Reset Password
                    </a>
                </div>
                <p style="font-size: 14px; color: #666;">This link will expire in 1 hour.</p>
                <p style="font-size: 14px; color: #666;">If you didn't request a password reset, you can safely ignore this email.</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Email Error:', error);
        throw new Error('Failed to send password reset email');
    }
};