import React, { useState, useEffect } from 'react';
import { useTimerContext } from './TimerContext';
import { useTaskContext } from './TaskContext';
import { Timer, BarChart3, CheckCircle2, Calendar as CalendarIcon, Plus } from 'lucide-react';
import { format, isToday, isPast, isBefore } from 'date-fns';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import TaskModal from './TaskModal';

const Dashboard = () => {
    const [projects, setProjects] = useState([]);
    const { trackingHistory, fetchTimeEntries } = useTimerContext();
    const { setCurrentTask, setIsTaskModalOpen, setDefaultProjectId } = useTaskContext();
    const [tasks, setTasks] = useState([]);
    const [timeEntries, setTimeEntries] = useState([]);
    const [habits, setHabits] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchInitialData();
        const handleTasksUpdated = () => fetchInitialData();
        window.addEventListener('tasksUpdated', handleTasksUpdated);
        return () => window.removeEventListener('tasksUpdated', handleTasksUpdated);
    }, []);
    useEffect(() => {
        const fetchHabits = async () => {
            try {
                const response = await axios.get('http://localhost:5005/api/habits');
                setHabits(response.data);
            } catch (error) {
                console.error('Error fetching habits:', error);
            }
        };
        fetchHabits();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [tasksRes, projectsRes, timeEntriesRes] = await Promise.all([
                axios.get('http://localhost:5005/api/tasks'),
                axios.get('http://localhost:5005/api/projects'),
                axios.get('http://localhost:5005/api/time-entries')
            ]);

            setTasks(tasksRes.data);
            setProjects(projectsRes.data);
            setTimeEntries(timeEntriesRes.data);
            await fetchTimeEntries();
        } catch (err) {
            console.error('Error fetching data:', err);
        }
    };

    const getStats = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const overdueTasks = tasks.filter(task =>
            !task.isComplete && isBefore(new Date(task.date), today)
        ).length;

        const completedTasks = tasks.filter(task => task.isComplete).length;
        const totalTrackedTime = timeEntries.reduce((acc, entry) => acc + entry.duration, 0);

        const activeHabits = habits.filter(habit => {
            const dateStr = format(new Date(), 'yyyy-MM-dd');
            return habit.completions[dateStr];
        }).length;

        return {
            overdueTasks,
            completedTasks,
            totalTasks: tasks.length,
            trackedHours: Math.round(totalTrackedTime / 3600),
            activeHabits,
            totalHabits: habits.length
        };
    };

    const getUpcomingTasks = () => {
        return tasks
            .filter(task => !task.isComplete && !isPast(new Date(task.date)))
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .slice(0, 3); // Show only 3 tasks
    };

    const getProjectStats = () => {
        return projects
            .map(project => {
                const projectTasks = tasks.filter(task => task.projectId === project._id);
                const completed = projectTasks.filter(task => task.isComplete).length;
                const total = projectTasks.length;
                const progress = total ? Math.round((completed / total) * 100) : 0;

                return {
                    ...project,
                    completed,
                    total,
                    progress
                };
            })
            .slice(0, 3); // Show only 3 projects
    };

    const handleNewTask = () => {
        setCurrentTask(null);
        setDefaultProjectId(null);
        setIsTaskModalOpen(true);
    };

    const handleTaskClick = (task) => {
        setCurrentTask(task);
        setDefaultProjectId(task.projectId);
        setIsTaskModalOpen(true);
    };

    const stats = {
        ...getStats(),
        totalHabits: habits.length,
        activeHabits: habits.filter(habit => habit.streak > 0).length
    };
    return (
        <div className="bg-white w-full min-h-screen p-7">
            <div className="flex items-center justify-between mt-7 mb-6">
                <h1 className="text-3xl font-semibold">Dashboard</h1>
                <button
                    onClick={handleNewTask}
                    className="bg-[#6D70E0] text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" /> New Task
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg border">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 rounded-full">
                            <CheckCircle2 className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Completed Tasks</p>
                            <h3 className="text-2xl font-semibold">{stats.completedTasks}</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-100 rounded-full">
                            <Timer className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Hours Tracked</p>
                            <h3 className="text-2xl font-semibold">{stats.trackedHours}h</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-red-100 rounded-full">
                            <BarChart3 className="w-6 h-6 text-red-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Overdue Tasks</p>
                            <h3 className="text-2xl font-semibold">{stats.overdueTasks}</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-100 rounded-full">
                            <CalendarIcon className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Active Habits</p>
                            <h3 className="text-2xl font-semibold">{stats.activeHabits}/{stats.totalHabits}</h3>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Upcoming Tasks */}
                <div className="bg-white p-6 rounded-lg border h-[400px]">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">
                            {tasks.filter(task => !task.isComplete && !isPast(new Date(task.date))).length > 0
                                ? 'Upcoming Tasks'
                                : 'Overdue Tasks'}
                        </h2>
                        <Link to="/tasks" className="text-[#6D70E0] text-sm hover:underline">View All</Link>
                    </div>
                    <div className="overflow-y-auto h-[300px] scrollbar-hide">
                        <div className="space-y-4 pr-4">
                            {(() => {
                                const upcomingTasks = tasks.filter(task => !task.isComplete && !isPast(new Date(task.date)))
                                    .sort((a, b) => new Date(a.date) - new Date(b.date));

                                const overdueTasks = tasks.filter(task => !task.isComplete && isPast(new Date(task.date)) && !isToday(new Date(task.date)))
                                    .sort((a, b) => new Date(b.date) - new Date(a.date));

                                return upcomingTasks.length > 0 ? (
                                    upcomingTasks.map(task => (
                                        <div
                                            key={task._id}
                                            onClick={() => handleTaskClick(task)}
                                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                                        >
                                            <div>
                                                <h3 className="font-medium">{task.text}</h3>
                                                <p className="text-sm text-gray-500">
                                                    Due: {format(new Date(task.date), 'MMM d, yyyy')}
                                                </p>
                                            </div>
                                            <div className="w-2 h-2 rounded-full bg-green-500"/>
                                        </div>
                                    ))
                                ) : overdueTasks.map(task => (
                                    <div
                                        key={task._id}
                                        onClick={() => handleTaskClick(task)}
                                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                                    >
                                        <div>
                                            <h3 className="font-medium">{task.text}</h3>
                                            <p className="text-sm text-gray-500">
                                                Overdue: {format(new Date(task.date), 'MMM d, yyyy')}
                                            </p>
                                        </div>
                                        <div className="w-2 h-2 rounded-full bg-red-500"/>
                                    </div>
                                ))
                            })()}
                        </div>
                    </div>
                </div>

                {/* Project Progress */}
                <div className="bg-white p-6 rounded-lg border h-[400px]">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Project Progress</h2>
                        <Link to="/projects" className="text-[#6D70E0] text-sm hover:underline">View All</Link>
                    </div>
                    <div className="overflow-y-auto h-[300px] scrollbar-hide">
                        <div className="space-y-4 pr-4">
                            {projects.map(project => {
                                const projectTasks = tasks.filter(task => task.projectId === project._id);
                                const completed = projectTasks.filter(task => task.isComplete).length;
                                const total = projectTasks.length;
                                const progress = total ? Math.round((completed / total) * 100) : 0;

                                return (
                                    <div
                                        key={project._id}
                                        className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                                        onClick={() => navigate(`/projects/${project._id}`)}
                                    >
                                        <div className="flex justify-between items-center mb-2">
                                            <h3 className="font-medium">{project.name}</h3>
                                            <span className="text-sm text-gray-500">
                                {completed}/{total} tasks
                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-[#6D70E0] h-2 rounded-full"
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white p-6 rounded-lg border lg:col-span-2 h-[400px]">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Recent Activity</h2>
                        <Link to="/timer" className="text-[#6D70E0] text-sm hover:underline">View All</Link>
                    </div>
                    <div className="overflow-y-auto h-[300px] scrollbar-hide">
                        <div className="space-y-4 pr-4">
                            {timeEntries.map(entry => (
                                <div key={entry._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div>
                                        <h3 className="font-medium">{entry.taskName}</h3>
                                        <p className="text-sm text-gray-500">
                                            {format(new Date(entry.startTime), 'MMM d, HH:mm')} -
                                            Duration: {Math.round(entry.duration / 60)}min
                                        </p>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {entry.projectName}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <TaskModal/>
        </div>
    );
};

export default Dashboard;