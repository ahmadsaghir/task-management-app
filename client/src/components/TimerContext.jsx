import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import axios from 'axios';

const TimerContext = createContext();

export const TimerProvider = ({ children }) => {
    const [selectedProject, setSelectedProject] = useState('');
    const [selectedTask, setSelectedTask] = useState('');
    const [isTracking, setIsTracking] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [startTime, setStartTime] = useState(null);
    const [trackingHistory, setTrackingHistory] = useState([]);
    const [projects, setProjects] = useState([]);
    const [tasks, setTasks] = useState([]);
    const timeTrackerRef = useRef(null);

    const [pomodoroMode, setPomodoroMode] = useState('work');
    const [pomodoroIsRunning, setPomodoroIsRunning] = useState(false);
    const [pomodoroTimeLeft, setPomodoroTimeLeft] = useState(25 * 60);
    const [pomodoroSessions, setPomodoroSessions] = useState(0);
    const [pomodoroSettings, setPomodoroSettings] = useState({
        workTime: 25,
        shortBreakTime: 5,
        longBreakTime: 15,
        sessionsUntilLongBreak: 4
    });
    const pomodoroRef = useRef(null);
    const audioRef = useRef(typeof Audio !== 'undefined' ? new Audio('/notification.mp3') : null);

    useEffect(() => {
        if (isTracking) {
            timeTrackerRef.current = setInterval(() => {
                setElapsedTime(prev => prev + 1);
            }, 1000);
        } else {
            clearInterval(timeTrackerRef.current);
        }

        return () => clearInterval(timeTrackerRef.current);
    }, [isTracking]);

    const fetchProjects = async () => {
        const response = await axios.get('http://localhost:5005/api/projects');
        setProjects(response.data);
        return response.data;
    };

    const fetchTasks = async () => {
        const response = await axios.get('http://localhost:5005/api/tasks');
        const activeTasks = response.data.filter(task => !task.isComplete);
        setTasks(activeTasks);
        return activeTasks;
    };

    const fetchTimeEntries = async () => {
        const response = await axios.get('http://localhost:5005/api/time-entries');
        setTrackingHistory(response.data);
    };

    const startTracking = (projectId, taskId) => {
        setSelectedProject(projectId);
        setSelectedTask(taskId);
        setStartTime(new Date());
        setIsTracking(true);
    };

    const stopTracking = async () => {
        try {
            // Fetch fresh task data to ensure it exists
            await fetchTasks();

            const task = tasks.find(t => t._id === selectedTask);
            const project = projects.find(p => p._id === selectedProject);

            if (!task) {
                // If task not found, keep the state and throw error
                throw new Error(`Task ${selectedTask} not found. It may have been deleted.`);
            }

            const timeEntry = {
                taskId: selectedTask,
                projectId: selectedProject === 'inbox' ? null : selectedProject,
                startTime: startTime,
                duration: elapsedTime,
                taskName: task.text,
                projectName: selectedProject === 'inbox' ? 'Inbox' : project?.name
            };

            console.log('Saving time entry:', timeEntry); // Debug log

            const response = await axios.post('http://localhost:5005/api/time-entries', timeEntry);
            console.log('Save response:', response.data); // Debug log

            await fetchTimeEntries();

            // Only reset if save was successful
            setIsTracking(false);
            setElapsedTime(0);
            setStartTime(null);
            setSelectedProject('');
            setSelectedTask('');
        } catch (err) {
            console.error('Full error details:', err);
            throw err;
        }
    };

    const deleteTimeEntry = async (id) => {
        await axios.delete(`http://localhost:5005/api/time-entries/${id}`);
        await fetchTimeEntries();
    };

    const handlePomodoroComplete = () => {
        if (audioRef.current) {
            audioRef.current.play();
        }
        clearInterval(pomodoroRef.current);
        setPomodoroIsRunning(false);

        if (pomodoroMode === 'work') {
            const newSessions = pomodoroSessions + 1;
            setPomodoroSessions(newSessions);

            if (newSessions % pomodoroSettings.sessionsUntilLongBreak === 0) {
                setPomodoroMode('longBreak');
                setPomodoroTimeLeft(pomodoroSettings.longBreakTime * 60);
            } else {
                setPomodoroMode('shortBreak');
                setPomodoroTimeLeft(pomodoroSettings.shortBreakTime * 60);
            }
        } else {
            setPomodoroMode('work');
            setPomodoroTimeLeft(pomodoroSettings.workTime * 60);
        }
    };

    const togglePomodoro = () => {
        setPomodoroIsRunning(!pomodoroIsRunning);
    };

    const resetPomodoro = () => {
        clearInterval(pomodoroRef.current);
        setPomodoroIsRunning(false);
        setPomodoroMode('work');
        setPomodoroTimeLeft(pomodoroSettings.workTime * 60);
        setPomodoroSessions(0);
    };

    return (
        <TimerContext.Provider value={{
            selectedProject,
            setSelectedProject,
            selectedTask,
            setSelectedTask,
            isTracking,
            elapsedTime,
            trackingHistory,
            projects,
            tasks,
            startTracking,
            stopTracking,
            fetchTimeEntries,
            fetchProjects,
            fetchTasks,
            deleteTimeEntry,
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
        }}>
            {children}
        </TimerContext.Provider>
    );
};

export const useTimerContext = () => useContext(TimerContext);