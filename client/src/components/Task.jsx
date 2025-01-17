import React, { useEffect, useRef, useState } from 'react';
import TaskItems from './TaskItems';
import TaskModal from './TaskModal';
import PaginatedList from './PaginatedList';
import { useTaskContext } from './TaskContext';
import { Plus, Filter, ChevronDown } from "lucide-react";
import axios from 'axios';

const Task = () => {
    const [tasks, setTasks] = useState([]);
    const [sortBy, setSortBy] = useState('date');
    const [sortOrder, setSortOrder] = useState('asc');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterDueDate, setFilterDueDate] = useState('all');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const filterRef = useRef(null);
    const { openTaskModal, setCurrentTask } = useTaskContext();
    const handleNewTask = () => {
        setCurrentTask(null);
        openTaskModal();
    };
    useEffect(() => {
        fetchTasks();
        const handleTasksUpdated = () => fetchTasks();
        window.addEventListener('tasksUpdated', handleTasksUpdated);
        return () => window.removeEventListener('tasksUpdated', handleTasksUpdated);
    }, []);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:5005/api/tasks');
            setTasks(response.data.filter(task => !task.projectId));
            setLoading(false);
        } catch (err) {
            console.error('Error fetching tasks:', err);
            setError('Failed to fetch tasks');
            setLoading(false);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (filterRef.current && !filterRef.current.contains(event.target)) {
                setIsFilterOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const deleteTask = async (id) => {
        try {
            await axios.delete(`http://localhost:5005/api/tasks/${id}`);
            setTasks(prev => prev.filter(task => task._id !== id));
        } catch (err) {
            console.error('Error deleting task:', err);
        }
    };

    const toggle = async (id) => {
        try {
            const task = tasks.find(t => t._id === id);
            const response = await axios.patch(`http://localhost:5005/api/tasks/${id}`, {
                isComplete: !task.isComplete
            });
            setTasks(prev => prev.map(t => t._id === id ? response.data : t));
        } catch (err) {
            console.error('Error toggling task:', err);
        }
    };

    const filterTasks = (tasks) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        return tasks.filter(task => {
            const taskDate = new Date(task.date);
            taskDate.setHours(0, 0, 0, 0);

            if (filterStatus === 'complete' && !task.isComplete) return false;
            if (filterStatus === 'incomplete' && task.isComplete) return false;

            if (filterDueDate === 'today' && taskDate.getTime() !== today.getTime()) return false;
            if (filterDueDate === 'tomorrow' && taskDate.getTime() !== tomorrow.getTime()) return false;
            if (filterDueDate === 'upcoming' && taskDate <= tomorrow) return false;
            return !(filterDueDate === 'overdue' && taskDate >= today);
        });
    };


    const sortTasks = (tasks) => {
        const sortedByCompletion = [...tasks].sort((a, b) => {
            // First sort by completion status
            if (a.isComplete !== b.isComplete) {
                return a.isComplete ? 1 : -1;
            }

            // Then apply the user's selected sort
            if (sortBy === 'date') {
                const comparison = new Date(a.date) - new Date(b.date);
                return sortOrder === 'asc' ? comparison : -comparison;
            } else {
                const comparison = a.text.localeCompare(b.text);
                return sortOrder === 'asc' ? comparison : -comparison;
            }
        });

        return sortedByCompletion;
    };

    const processedTasks = sortTasks(filterTasks([...tasks]));

    if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
    if (error) return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;

    return (
        <div className="bg-white w-full h-screen flex flex-col p-7">
            <div className="flex items-center mt-7 gap-2 mb-6">
                <h1 className="text-3xl font-semibold">Task List</h1>
            </div>

            <hr className="w-full border-gray-300 my-2"/>

            <div className="flex justify-start items-center gap-4 mt-4">
                <button
                    onClick={handleNewTask}
                    className="bg-[#6D70E0] text-white px-4 py-2 rounded-lg flex items-center gap-2">
                    <Plus/> New Task
                </button>

                <div className="relative" ref={filterRef}>
                    <button
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                        <Filter className="w-4 h-4"/>
                        Filters
                        {(filterStatus !== 'all' || filterDueDate !== 'all') && (
                            <span className="bg-[#6D70E0] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                {(filterStatus !== 'all' ? 1 : 0) + (filterDueDate !== 'all' ? 1 : 0)}
                            </span>
                        )}
                    </button>

                    {isFilterOpen && (
                        <div className="absolute right-0 mt-2 w-64 bg-white border rounded-lg shadow-lg z-10">
                            <div className="p-4">
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Status
                                    </label>
                                    <select
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value)}
                                        className="w-full px-3 py-2 border rounded-lg text-gray-700 focus:outline-none focus:border-[#6D70E0]"
                                    >
                                        <option value="all">All Status</option>
                                        <option value="complete">Complete</option>
                                        <option value="incomplete">Incomplete</option>
                                    </select>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Due Date
                                    </label>
                                    <select
                                        value={filterDueDate}
                                        onChange={(e) => setFilterDueDate(e.target.value)}
                                        className="w-full px-3 py-2 border rounded-lg text-gray-700 focus:outline-none focus:border-[#6D70E0]"
                                    >
                                        <option value="all">All Dates</option>
                                        <option value="today">Due Today</option>
                                        <option value="tomorrow">Due Tomorrow</option>
                                        <option value="upcoming">Upcoming</option>
                                        <option value="overdue">Overdue</option>
                                    </select>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Sort By
                                    </label>
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="w-full px-3 py-2 border rounded-lg text-gray-700 focus:outline-none focus:border-[#6D70E0]"
                                    >
                                        <option value="date">Date</option>
                                        <option value="title">Title</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Sort Order
                                    </label>
                                    <button
                                        onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                                        className="w-full px-3 py-2 border rounded-lg text-gray-700 hover:bg-gray-50 flex items-center justify-between"
                                    >
                                        {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                                        <ChevronDown
                                            className={`w-4 h-4 transition-transform ${
                                                sortOrder === 'desc' ? 'rotate-180' : ''
                                            }`}
                                        />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-6">
                {processedTasks.length === 0 ? (
                    <p className="text-center text-slate-500">No tasks found.</p>
                ) : (
                    <PaginatedList
                        items={processedTasks}
                        itemsPerPage={8}
                        layout="vertical"
                        renderItem={(item) => (
                            <TaskItems
                                key={item._id}
                                text={item.text}
                                description={item.description}
                                date={item.date}
                                id={item._id}
                                isComplete={item.isComplete}
                                deleteTask={deleteTask}
                                toggle={toggle}
                                openEditModal={() => {
                                    openTaskModal(item);
                                }}
                            />
                        )}
                    />
                )}
            </div>

            <TaskModal/>
        </div>
    );
};

export default Task;