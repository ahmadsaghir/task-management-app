import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5005/api/auth/forgot-password', { email });
            setSuccess(true);
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send reset email');
            setSuccess(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
                <h2 className="text-3xl font-bold text-center">Forgot Password</h2>
                {error && <div className="bg-red-50 text-red-500 p-3 rounded">{error}</div>}
                {success && (
                    <div className="bg-green-50 text-green-500 p-3 rounded">
                        Password reset instructions have been sent to your email.
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email"
                            className="w-full px-3 py-2 border rounded"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-[#6D70E0] text-white py-2 rounded hover:bg-[#5456B3]"
                    >
                        Send Reset Link
                    </button>
                </form>
                <div className="text-center">
                    <Link to="/login" className="text-[#6D70E0] hover:underline">
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;