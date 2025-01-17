import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            if (err.response?.data?.isVerified === false) {
                setError('Please verify your email before logging in. Need a new verification link? Click below.');
            } else {
                setError(err.response?.data?.message || 'Invalid email or password');
            }
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const response = await axios.post('http://localhost:5005/api/auth/google', {
                token: credentialResponse.credential
            });
            await login(response.data.email, null, response.data);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to login with Google');
        }
    };

    const handleResendVerification = async () => {
        try {
            const response = await axios.post('http://localhost:5005/api/auth/resend-verification', { email });
            setError('Verification email has been resent. Please check your inbox.');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to resend verification email');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
                <h2 className="text-3xl font-bold text-center">Sign in</h2>
                {error && (
                    <div className="bg-red-50 text-red-500 p-3 rounded">
                        {error}
                        {error.includes('verify your email') && (
                            <button
                                onClick={handleResendVerification}
                                className="text-[#6D70E0] hover:underline block mt-2"
                            >
                                Resend Verification Email
                            </button>
                        )}
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
                    <div>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            className="w-full px-3 py-2 border rounded"
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <Link
                            to="/forgot-password"
                            className="text-sm text-[#6D70E0] hover:underline"
                        >
                            Forgot your password?
                        </Link>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-[#6D70E0] text-white py-2 rounded hover:bg-[#5456B3]"
                    >
                        Sign in
                    </button>
                </form>

                <div className="mt-4">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">Or continue with</span>
                        </div>
                    </div>
                    <div className="mt-4 flex justify-center">
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => setError('Failed to login with Google')}
                            useOneTap
                        />
                    </div>
                </div>

                <div className="text-center">
                    <Link to="/register" className="text-[#6D70E0] hover:underline">
                        Don't have an account? Register
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;