import React, { useState, useEffect } from 'react';
import { Plus, X, ChevronLeft, ChevronRight, BarChart3, CheckCircle2 } from "lucide-react";
import { format, startOfWeek, addDays, isToday, subWeeks, addWeeks, startOfDay } from 'date-fns';
import axios from 'axios';

const HabitTracker = () => {
    const [habits, setHabits] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
    const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const API_URL = 'http://localhost:5005/api';

    useEffect(() => {
        fetchHabits();
    }, []);

    const fetchHabits = async () => {
        try {
            const response = await axios.get(`${API_URL}/habits`);
            setHabits(response.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch habits');
            setLoading(false);
        }
    };

    const addHabit = async (habitName, goal, description) => {
        if (habitName.trim() === '') return;
        const numGoal = parseInt(goal);
        if (numGoal < 1 || numGoal > 7) {
            setError('Weekly goal must be between 1 and 7 days');
            return;
        }

        try {
            const response = await axios.post(`${API_URL}/habits`, {
                name: habitName,
                description,
                goal: numGoal
            });

            setHabits(prev => [...prev, response.data]);
            setIsModalOpen(false);
        } catch (err) {
            setError('Failed to create habit');
        }
    };
    const deleteHabit = async (id) => {
        try {
            await axios.delete(`${API_URL}/habits/${id}`);
            setHabits(prev => prev.filter(habit => habit._id !== id));
        } catch (err) {
            setError('Failed to delete habit');
        }
    };

    const toggleHabitForDate = async (habitId, date) => {
        const today = startOfDay(new Date());
        if (date > today) return;

        try {
            const response = await axios.patch(`${API_URL}/habits/${habitId}/toggle`, {
                date: format(date, 'yyyy-MM-dd')
            });

            setHabits(prev => prev.map(habit =>
                habit._id === habitId ? response.data : habit
            ));
        } catch (err) {
            setError('Failed to update habit');
        }
    };

    const getWeekDays = () => {
        const days = [];
        for (let i = 0; i < 7; i++) {
            days.push(addDays(weekStart, i));
        }
        return days;
    };

    const getWeeklyProgress = (habit) => {
        const weekDays = getWeekDays();
        const completedDays = weekDays.filter(day => {
            const dateStr = format(day, 'yyyy-MM-dd');
            return habit.completions && habit.completions[dateStr];
        }).length;

        return {
            completed: completedDays,
            total: habit.goal,
            percentage: Math.round((completedDays / habit.goal) * 100)
        };
    };

    const getHabitStats = (habit) => {
        const totalDays = habit.completions ? Object.keys(habit.completions).length : 0;
        const completionRate = habit.goal ? Math.round((totalDays / habit.goal) * 100) : 0;

        return {
            totalDays,
            completionRate,
            streak: habit.streak || 0,
            longestStreak: habit.longestStreak || 0
        };
    };

    if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
    if (error) return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;

    return (
        <div className="bg-white w-full min-h-screen p-7">
            <div className="flex items-center justify-between mt-7 mb-6">
                <h1 className="text-3xl font-semibold">Habit Tracker</h1>
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsStatsModalOpen(true)}
                        className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                        <BarChart3 className="w-5 h-5" /> View Stats
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-[#6D70E0] text-white px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                        <Plus /> New Habit
                    </button>
                </div>
            </div>

            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setWeekStart(prev => subWeeks(prev, 1))}
                        className="p-2 hover:bg-gray-100 rounded-full"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="font-medium">
                        Week of {format(weekStart, 'MMM d, yyyy')}
                    </span>
                    <button
                        onClick={() => setWeekStart(prev => addWeeks(prev, 1))}
                        className="p-2 hover:bg-gray-100 rounded-full"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Habit Grid */}
            <div className="grid grid-cols-[250px_repeat(7,1fr)] gap-2 mb-4">
                <div className="font-medium text-gray-500">Habit</div>
                {getWeekDays().map(day => (
                    <div
                        key={day.toISOString()}
                        className={`text-center font-medium ${
                            isToday(day) ? 'text-[#6D70E0]' : 'text-gray-500'
                        }`}
                    >
                        {format(day, 'EEE')}
                        <div className="text-sm">{format(day, 'd')}</div>
                    </div>
                ))}
            </div>

            {habits.map(habit => {
                const progress = getWeeklyProgress(habit);
                return (
                    <div
                        key={habit._id}
                        className="grid grid-cols-[250px_repeat(7,1fr)] gap-2 mb-4 items-center"
                    >
                        <div className="flex items-center justify-between pr-4">
                            <div>
                                <span className="font-medium">{habit.name}</span>
                                <div className="text-sm text-gray-500">
                                    {progress.completed}/{habit.goal} days
                                </div>
                            </div>
                            <button
                                onClick={() => deleteHabit(habit._id)}
                                className="text-gray-400 hover:text-red-500"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        {getWeekDays().map(day => {
                            const dateStr = format(day, 'yyyy-MM-dd');
                            const isCompleted = habit.completions && habit.completions[dateStr];
                            const isFutureDate = day > startOfDay(new Date());

                            return (
                                <button
                                    key={dateStr}
                                    onClick={() => toggleHabitForDate(habit._id, day)}
                                    disabled={isFutureDate}
                                    className={`h-10 rounded-lg border-2 flex items-center justify-center ${
                                        isCompleted
                                            ? 'bg-[#6D70E0] border-[#6D70E0] text-white'
                                            : isFutureDate
                                                ? 'border-gray-100 bg-gray-50 cursor-not-allowed'
                                                : 'border-gray-200 hover:border-[#6D70E0]'
                                    }`}
                                >
                                    {isCompleted && <CheckCircle2 className="w-4 h-4" />}
                                </button>
                            );
                        })}
                    </div>
                );
            })}

            {/* Add Habit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg max-w-sm w-full">
                        <h2 className="text-2xl font-semibold mb-4">Create New Habit</h2>
                        <input
                            id="habitName"
                            className="w-full mb-4 p-2 border rounded"
                            type="text"
                            placeholder="Habit Name"
                        />
                        <textarea
                            id="habitDescription"
                            className="w-full mb-4 p-2 border rounded"
                            placeholder="Description (optional)"
                            rows="3"
                        />
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Weekly Goal (1-7 days)
                            </label>
                            <input
                                id="habitGoal"
                                className="w-full p-2 border rounded"
                                type="number"
                                min="1"
                                max="7"
                                defaultValue="1"
                                required
                                onInput={(e) => {
                                    if (e.target.value < 1) e.target.value = 1;
                                    if (e.target.value > 7) e.target.value = 7;
                                }}
                            />
                        </div>
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 rounded-full bg-gray-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    const name = document.getElementById('habitName').value;
                                    const description = document.getElementById('habitDescription').value;
                                    const goal = document.getElementById('habitGoal').value;
                                    addHabit(name, goal, description);
                                }}
                                className="px-4 py-2 rounded-full bg-[#6D70E0] text-white"
                            >
                                Create Habit
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats Modal */}
            {isStatsModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg max-w-md w-full">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-semibold">Habit Statistics</h2>
                            <button
                                onClick={() => setIsStatsModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            {habits.map(habit => {
                                const stats = getHabitStats(habit);
                                return (
                                    <div key={habit._id} className="border-b pb-4">
                                        <h3 className="font-medium mb-2">{habit.name}</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-gray-50 p-3 rounded">
                                                <div className="text-sm text-gray-500">Current Streak</div>
                                                <div className="text-xl font-semibold">{stats.streak} days</div>
                                            </div>
                                            <div className="bg-gray-50 p-3 rounded">
                                                <div className="text-sm text-gray-500">Longest Streak</div>
                                                <div className="text-xl font-semibold">{stats.longestStreak} days</div>
                                            </div>
                                            <div className="bg-gray-50 p-3 rounded">
                                                <div className="text-sm text-gray-500">Total Days</div>
                                                <div className="text-xl font-semibold">{stats.totalDays}</div>
                                            </div>
                                            <div className="bg-gray-50 p-3 rounded">
                                                <div className="text-sm text-gray-500">Completion Rate</div>
                                                <div className="text-xl font-semibold">{stats.completionRate}%</div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HabitTracker;