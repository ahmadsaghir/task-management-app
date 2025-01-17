import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Settings, X, AlertCircle, CheckCircle2 } from "lucide-react";
import { useTimerContext } from './TimerContext';

const PomodoroTimer = () => {
    const {
        pomodoroMode,
        setPomodoroMode,
        pomodoroIsRunning,
        pomodoroTimeLeft,
        setPomodoroTimeLeft,
        pomodoroSessions,
        pomodoroSettings,
        setPomodoroSettings,
        togglePomodoro,
        resetPomodoro
    } = useTimerContext();

    const [showSettings, setShowSettings] = useState(false);
    const [showStats, setShowStats] = useState(false);
    const [history, setHistory] = useState(
        JSON.parse(localStorage.getItem('pomodoroHistory')) || []
    );

    useEffect(() => {
        // Load settings from localStorage
        const savedSettings = localStorage.getItem('pomodoroSettings');
        if (savedSettings) {
            setPomodoroSettings(JSON.parse(savedSettings));
        }
    }, [setPomodoroSettings]);

    useEffect(() => {
        // Save history to localStorage whenever it changes
        localStorage.setItem('pomodoroHistory', JSON.stringify(history));
    }, [history]);

    const saveSettings = (newSettings) => {
        setPomodoroSettings(newSettings);
        localStorage.setItem('pomodoroSettings', JSON.stringify(newSettings));
        setShowSettings(false);

        // Update current timer if not running
        if (!pomodoroIsRunning) {
            if (pomodoroMode === 'work') setPomodoroTimeLeft(newSettings.workTime * 60);
            else if (pomodoroMode === 'shortBreak') setPomodoroTimeLeft(newSettings.shortBreakTime * 60);
            else if (pomodoroMode === 'longBreak') setPomodoroTimeLeft(newSettings.longBreakTime * 60);
        }
    };

    const handleModeChange = (newMode) => {
        if (pomodoroIsRunning) return; // Don't change mode while timer is running
        setPomodoroMode(newMode);
        switch (newMode) {
            case 'work':
                setPomodoroTimeLeft(pomodoroSettings.workTime * 60);
                break;
            case 'shortBreak':
                setPomodoroTimeLeft(pomodoroSettings.shortBreakTime * 60);
                break;
            case 'longBreak':
                setPomodoroTimeLeft(pomodoroSettings.longBreakTime * 60);
                break;
            default:
                break;
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const getStats = () => {
        const today = new Date().toLocaleDateString();
        const todaySessions = history.filter(session =>
            new Date(session.date).toLocaleDateString() === today
        ).length;

        const totalSessions = history.length;
        const totalMinutes = history.reduce((total, session) => {
            return total + (session.mode === 'work' ? pomodoroSettings.workTime : 0);
        }, 0);

        return { todaySessions, totalSessions, totalMinutes };
    };

    return (
        <div className="bg-white w-full min-h-screen p-7">
            <div className="max-w-2xl mx-auto mt-10">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-4">Pomodoro Timer</h1>
                    <div className="flex justify-center gap-4 mb-6">
                        <button
                            onClick={() => handleModeChange('work')}
                            className={`px-4 py-2 rounded-lg ${
                                pomodoroMode === 'work'
                                    ? 'bg-[#6D70E0] text-white'
                                    : 'bg-gray-100 hover:bg-gray-200'
                            }`}
                        >
                            Work
                        </button>
                        <button
                            onClick={() => handleModeChange('shortBreak')}
                            className={`px-4 py-2 rounded-lg ${
                                pomodoroMode === 'shortBreak'
                                    ? 'bg-[#6D70E0] text-white'
                                    : 'bg-gray-100 hover:bg-gray-200'
                            }`}
                        >
                            Short Break
                        </button>
                        <button
                            onClick={() => handleModeChange('longBreak')}
                            className={`px-4 py-2 rounded-lg ${
                                pomodoroMode === 'longBreak'
                                    ? 'bg-[#6D70E0] text-white'
                                    : 'bg-gray-100 hover:bg-gray-200'
                            }`}
                        >
                            Long Break
                        </button>
                    </div>

                    <div className="text-8xl font-mono mb-8">{formatTime(pomodoroTimeLeft)}</div>

                    <div className="flex justify-center gap-4 mb-8">
                        <button
                            onClick={togglePomodoro}
                            className="p-3 rounded-full bg-[#6D70E0] text-white hover:bg-[#5456B3]"
                        >
                            {pomodoroIsRunning ? <Pause size={24} /> : <Play size={24} />}
                        </button>
                        <button
                            onClick={resetPomodoro}
                            className="p-3 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
                        >
                            <RotateCcw size={24} />
                        </button>
                        <button
                            onClick={() => setShowSettings(true)}
                            className="p-3 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
                        >
                            <Settings size={24} />
                        </button>
                        <button
                            onClick={() => setShowStats(true)}
                            className="p-3 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
                        >
                            <CheckCircle2 size={24} />
                        </button>
                    </div>

                    <div className="text-gray-600">
                        Sessions completed: {pomodoroSessions}
                    </div>

                    {/* Progress Indicator */}
                    {pomodoroMode === 'work' && (
                        <div className="mt-4">
                            <div className="flex justify-center gap-2">
                                {Array.from({ length: pomodoroSettings.sessionsUntilLongBreak }).map((_, index) => (
                                    <div
                                        key={index}
                                        className={`w-3 h-3 rounded-full ${
                                            index < (pomodoroSessions % pomodoroSettings.sessionsUntilLongBreak)
                                                ? 'bg-[#6D70E0]'
                                                : 'bg-gray-200'
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Settings Modal */}
                {showSettings && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                        <div className="bg-white p-6 rounded-lg max-w-sm w-full">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-semibold">Settings</h2>
                                <button
                                    onClick={() => setShowSettings(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Work Time (minutes)
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        className="w-full p-2 border rounded"
                                        value={pomodoroSettings.workTime}
                                        onChange={(e) => setPomodoroSettings(prev => ({
                                            ...prev,
                                            workTime: parseInt(e.target.value)
                                        }))}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Short Break (minutes)
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        className="w-full p-2 border rounded"
                                        value={pomodoroSettings.shortBreakTime}
                                        onChange={(e) => setPomodoroSettings(prev => ({
                                            ...prev,
                                            shortBreakTime: parseInt(e.target.value)
                                        }))}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Long Break (minutes)
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        className="w-full p-2 border rounded"
                                        value={pomodoroSettings.longBreakTime}
                                        onChange={(e) => setPomodoroSettings(prev => ({
                                            ...prev,
                                            longBreakTime: parseInt(e.target.value)
                                        }))}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Sessions Until Long Break
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        className="w-full p-2 border rounded"
                                        value={pomodoroSettings.sessionsUntilLongBreak}
                                        onChange={(e) => setPomodoroSettings(prev => ({
                                            ...prev,
                                            sessionsUntilLongBreak: parseInt(e.target.value)
                                        }))}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-4 mt-6">
                                <button
                                    onClick={() => setShowSettings(false)}
                                    className="px-4 py-2 rounded-lg bg-gray-100"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => saveSettings(pomodoroSettings)}
                                    className="px-4 py-2 rounded-lg bg-[#6D70E0] text-white"
                                >
                                    Save Settings
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Stats Modal */}
                {showStats && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                        <div className="bg-white p-6 rounded-lg max-w-sm w-full">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-semibold">Statistics</h2>
                                <button
                                    onClick={() => setShowStats(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            {(() => {
                                const stats = getStats();
                                return (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <h3 className="text-sm font-medium text-gray-500">Today's Sessions</h3>
                                                <p className="text-2xl font-semibold">{stats.todaySessions}</p>
                                            </div>
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <h3 className="text-sm font-medium text-gray-500">Total Sessions</h3>
                                                <p className="text-2xl font-semibold">{stats.totalSessions}</p>
                                            </div>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <h3 className="text-sm font-medium text-gray-500">Total Focus Time</h3>
                                            <p className="text-2xl font-semibold">{stats.totalMinutes} minutes</p>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PomodoroTimer;