import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const { token } = useParams();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            await axios.post(`http://localhost:5005/api/auth/reset-password/${token}`, {
                password
            });
            setSuccess(true);
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
                <h2 className="text-3xl font-bold text-center">Reset Password</h2>
                {error && <div className="bg-red-50 text-red-500 p-3 rounded">{error}</div>}
                {success && (
                    <div className="bg-green-50 text-green-500 p-3 rounded">
                        Password reset successful! Redirecting to login...
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="New Password"
                            className="w-full px-3 py-2 border rounded"
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm New Password"
                            className="w-full px-3 py-2 border rounded"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-[#6D70E0] text-white py-2 rounded hover:bg-[#5456B3]"
                    >
                        Reset Password
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;