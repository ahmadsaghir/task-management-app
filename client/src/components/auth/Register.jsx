import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        surname: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const validatePassword = (password) => {
        const requirements = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /[0-9]/.test(password),
            symbol: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };

        const missing = Object.entries(requirements)
            .filter(([_, isValid]) => !isValid)
            .map(([key]) => key);

        return {
            isValid: missing.length === 0,
            missing
        };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const { isValid, missing } = validatePassword(formData.password);
        if (!isValid) {
            setError(`Password must include: ${missing.join(', ')}`);
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        try {
            const userData = {
                name: formData.name.trim(),
                surname: formData.surname.trim(),
                email: formData.email.trim(),
                password: formData.password
            };
            await register(userData);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
                <h2 className="text-3xl font-bold text-center">Create Account</h2>
                {error && <div className="bg-red-50 text-red-500 p-3 rounded">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <input
                            type="text"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Name"
                            className="w-full px-3 py-2 border rounded"
                        />
                    </div>
                    <div>
                        <input
                            type="text"
                            name="surname"
                            required
                            value={formData.surname}
                            onChange={handleChange}
                            placeholder="Surname"
                            className="w-full px-3 py-2 border rounded"
                        />
                    </div>
                    <div>
                        <input
                            type="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Email"
                            className="w-full px-3 py-2 border rounded"
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            name="password"
                            required
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Password"
                            className="w-full px-3 py-2 border rounded"
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            name="confirmPassword"
                            required
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Confirm Password"
                            className="w-full px-3 py-2 border rounded"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-[#6D70E0] text-white py-2 rounded hover:bg-[#5456B3]"
                    >
                        Create Account
                    </button>
                </form>
                <div className="text-center">
                    <Link to="/login" className="text-[#6D70E0] hover:underline">
                        Already have an account? Sign in
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Register;