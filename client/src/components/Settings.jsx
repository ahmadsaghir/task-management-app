import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Bell, Moon, User, ChevronRight, Mail, Key } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
    const { addToast } = useToast();
    const { user, updateProfile } = useAuth();
    const { isDarkMode, toggleDarkMode } = useTheme();
    const [activeTab, setActiveTab] = useState('profile');
    const [formData, setFormData] = useState({
        name: user?.name || '',
        surname: user?.surname || '',
        email: user?.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const { deleteAccount } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);

            // Check if any changes were made
            const hasChanges =
                formData.name !== user.name ||
                formData.surname !== user.surname ||
                formData.email !== user.email ||
                (activeTab === 'security' && formData.newPassword);

            if (!hasChanges) {
                addToast('No changes were made', 'destructive');
                return;
            }

            if (activeTab === 'security' && formData.newPassword) {
                if (formData.newPassword !== formData.confirmPassword) {
                    addToast('New passwords do not match', 'destructive');
                    return;
                }
                if (!formData.currentPassword) {
                    addToast('Current password is required', 'destructive');
                    return;
                }
            }

            const updatedData = {
                name: formData.name,
                surname: formData.surname,
                email: formData.email,
                ...(formData.newPassword && {
                    currentPassword: formData.currentPassword,
                    password: formData.newPassword
                })
            };

            const response = await updateProfile(updatedData);

            if (response) {
                addToast('Profile updated successfully', 'success');

                // Reset form data with new user data
                setFormData(prev => ({
                    ...prev,
                    name: updatedData.name,
                    surname: updatedData.surname,
                    email: updatedData.email,
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                }));
            }
        } catch (err) {
            addToast(err.message || 'Failed to update profile', 'destructive');
        } finally {
            setLoading(false);
        }
    };
    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };


    const handleDeleteAccount = async () => {
        if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            try {
                await deleteAccount();
                addToast('Your account has been deleted.', 'success');
            } catch (err) {
                addToast('Failed to delete account. Please try again.', 'destructive');
            }
            navigate('/login');
        }
    };
    const renderProfileSettings = () => (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full p-2 border rounded focus:outline-none focus:border-[#6D70E0]"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input
                        type="text"
                        name="surname"
                        value={formData.surname}
                        onChange={handleChange}
                        className="w-full p-2 border rounded focus:outline-none focus:border-[#6D70E0]"
                    />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full p-2 border rounded focus:outline-none focus:border-[#6D70E0]"
                />
            </div>
            <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#6D70E0] text-white py-2 rounded hover:bg-[#5456B3] disabled:opacity-50"
            >
                {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
                type="button"
                onClick={handleDeleteAccount}
                className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600 transition-colors"
            >
                Delete Account
            </button>
        </form>
    );

    const renderSecuritySettings = () => (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                <input
                    type="password"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    className="w-full p-2 border rounded focus:outline-none focus:border-[#6D70E0]"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    className="w-full p-2 border rounded focus:outline-none focus:border-[#6D70E0]"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full p-2 border rounded focus:outline-none focus:border-[#6D70E0]"
                />
            </div>
            <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#6D70E0] text-white py-2 rounded hover:bg-[#5456B3] disabled:opacity-50"
            >
                {loading ? 'Updating...' : 'Update Password'}
            </button>
        </form>
    );

    const renderNotificationSettings = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="font-medium">Email Notifications</h3>
                    <p className="text-sm text-gray-500">Receive email notifications about your tasks</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#6D70E0]"></div>
                </label>
            </div>
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="font-medium">Push Notifications</h3>
                    <p className="text-sm text-gray-500">Get push notifications in your browser</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#6D70E0]"></div>
                </label>
            </div>
        </div>
    );

    const renderAppearanceSettings = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="font-medium">Dark Mode</h3>
                    <p className="text-sm text-gray-500">Switch between light and dark themes</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={isDarkMode}
                        onChange={toggleDarkMode}
                    />
                    <div
                        className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#6D70E0]"></div>
                </label>
            </div>
        </div>
    );

    const tabs = [
        {id: 'profile', label: 'Profile', icon: <User size={20}/>, content: renderProfileSettings},
        {id: 'security', label: 'Security', icon: <Key size={20}/>, content: renderSecuritySettings },
        { id: 'notifications', label: 'Notifications', icon: <Bell size={20} />, content: renderNotificationSettings },
        { id: 'appearance', label: 'Appearance', icon: <Moon size={20} />, content: renderAppearanceSettings }
    ];

    return (
        <div className="bg-white w-full min-h-screen p-7">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center mt-7 mb-6">
                    <h1 className="text-3xl font-semibold">Settings</h1>
                </div>

                <hr className="w-full border-gray-300 my-2"/>

                <div className="grid grid-cols-4 gap-6 mt-6">
                    <div className="col-span-1">
                        <nav className="space-y-1">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                                        activeTab === tab.id
                                            ? 'bg-[#6D70E0] text-white'
                                            : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                                >
                                    <div className="flex items-center">
                                        {tab.icon}
                                        <span className="ml-3">{tab.label}</span>
                                    </div>
                                    <ChevronRight size={20} />
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="col-span-3 bg-white p-6 rounded-lg border">
                        <h2 className="text-xl font-semibold mb-6">
                            {tabs.find(tab => tab.id === activeTab)?.label}
                        </h2>
                        {tabs.find(tab => tab.id === activeTab)?.content()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;