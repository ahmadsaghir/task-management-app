import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isToday, isSameDay } from 'date-fns';
import TaskModal from './TaskModal';
import { useTaskContext } from './TaskContext';
import axios from 'axios';

const Calendar = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [tasks, setTasks] = useState([]);
    const { openTaskModal, setCurrentTask, setIsTaskModalOpen, setDefaultDate } = useTaskContext();

    useEffect(() => {
        fetchTasks();
        const handleTasksUpdated = () => fetchTasks();
        window.addEventListener('tasksUpdated', handleTasksUpdated);
        return () => window.removeEventListener('tasksUpdated', handleTasksUpdated);
    }, []);

    const fetchTasks = async () => {
        try {
            const response = await axios.get('http://localhost:5005/api/tasks');
            setTasks(response.data);
        } catch (err) {
            console.error('Error fetching tasks:', err);
        }
    };

    const handleNewTask = (date) => {
        setCurrentTask(null);
        setDefaultDate(date); // Set the default date for the new task
        openTaskModal();
    };


    const getCalendarDays = () => {
        const start = startOfWeek(startOfMonth(currentDate));
        const end = endOfWeek(endOfMonth(currentDate));
        return eachDayOfInterval({ start, end });
    };

    const getTasksForDate = (date) => {
        return tasks.filter(task => isSameDay(new Date(task.date), date));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const renderHeader = () => {
        return (
            <div className="flex items-center justify-between mt-7 mb-6">
                <h1 className="text-3xl font-semibold">Calendar</h1>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setCurrentDate(new Date())}
                        className="px-4 py-2 text-sm text-[#6D70E0] hover:bg-indigo-50 rounded-lg"
                    >
                        Today
                    </button>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={prevMonth}
                            className="p-2 hover:bg-gray-100 rounded-full"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <h2 className="text-lg font-medium min-w-[200px] text-center">
                            {format(currentDate, 'MMMM yyyy')}
                        </h2>
                        <button
                            onClick={nextMonth}
                            className="p-2 hover:bg-gray-100 rounded-full"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="bg-white min-h-screen w-full p-7">
            {renderHeader()}
            <hr className="w-full border-gray-300 my-2"/>
            <div className="p-4">
                <div className="grid grid-cols-7 gap-4 mb-4">
                    {days.map(day => (
                        <div key={day} className="text-center text-sm font-medium text-gray-500">
                            {day}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-4">
                    {getCalendarDays().map((day, index) => {
                        const tasksForDay = getTasksForDate(day);
                        const isCurrentMonth = isSameMonth(day, currentDate);

                        return (
                            <div
                                key={index}
                                className={`min-h-[120px] p-2 border rounded-lg ${
                                    isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                                } ${isToday(day) ? 'border-[#6D70E0]' : 'border-gray-200'}`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                <span className={`text-sm font-medium ${
                                    isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                                }`}>
                                    {format(day, 'd')}
                                </span>
                                    <button
                                        onClick={() => handleNewTask(day)}
                                        className="p-1 hover:bg-gray-100 rounded-full"
                                    >
                                        <Plus className="w-4 h-4 text-gray-500"/>
                                    </button>
                                </div>
                                <div className="space-y-1">
                                    {tasksForDay.map(task => (
                                        <div
                                            key={task._id}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setCurrentTask({
                                                    _id: task._id,
                                                    text: task.text,
                                                    description: task.description,
                                                    date: task.date,
                                                    isComplete: task.isComplete,
                                                    projectId: task.projectId
                                                });
                                                setIsTaskModalOpen(true);
                                            }}
                                            className={`text-xs p-1 rounded cursor-pointer hover:brightness-95 ${
                                                task.isComplete
                                                    ? 'bg-gray-100 text-gray-500 line-through'
                                                    : 'bg-indigo-50 text-indigo-600'
                                            }`}
                                        >
                                            {task.text}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <TaskModal/>
        </div>
    );
};

export default Calendar;