import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';

const TaskContext = createContext();

export const useTaskContext = () => useContext(TaskContext);

export const TaskProvider = ({ children }) => {
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [currentTask, setCurrentTask] = useState(null);
    const [defaultProjectId, setDefaultProjectId] = useState(null);
    const [defaultDate, setDefaultDate] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const openTaskModal = (task = null) => {
        setError(null);
        setCurrentTask(task);
        setIsTaskModalOpen(true);
    };

    const closeTaskModal = () => {
        setCurrentTask(null);
        setDefaultProjectId(null);
        setDefaultDate(null);
        setIsTaskModalOpen(false);
        setError(null);
    };

    const saveTask = async (taskData) => {
        try {
            setLoading(true);
            setError(null);

            if (currentTask) {
                await axios.patch(`http://localhost:5005/api/tasks/${currentTask._id}`, taskData);
            } else {
                await axios.post('http://localhost:5005/api/tasks', taskData);
            }

            window.dispatchEvent(new Event('tasksUpdated'));
            closeTaskModal();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save task');
        } finally {
            setLoading(false);
        }
    };

    return (
        <TaskContext.Provider value={{
            isTaskModalOpen,
            setIsTaskModalOpen,
            currentTask,
            setCurrentTask,
            defaultProjectId,
            setDefaultProjectId,
            defaultDate,
            setDefaultDate,
            openTaskModal,
            closeTaskModal,
            saveTask,
            error,
            loading
        }}>
            {children}
        </TaskContext.Provider>
    );
};