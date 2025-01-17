import React, { useEffect, useState } from 'react';
import { Play, Pause, Timer, Trash2, Folder } from 'lucide-react';
import { format } from 'date-fns';
import { useTimerContext } from './TimerContext';

const TimeTracker = () => {
    const {
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
        deleteTimeEntry,
        fetchTimeEntries,
        fetchProjects,
        fetchTasks
    } = useTimerContext();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (!selectedProject) {
            setSelectedTask('');
        }
    }, [selectedProject, setSelectedTask]);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            await Promise.all([
                fetchProjects(),
                fetchTasks(),
                fetchTimeEntries()
            ]);
            setLoading(false);
        } catch (err) {
            console.error('Error loading data:', err);
            setError('Failed to load data');
            setLoading(false);
        }
    };

    const filteredTasks = selectedProject === 'inbox'
        ? tasks.filter(task => !task.projectId)
        : selectedProject
            ? tasks.filter(task => task.projectId === selectedProject)
            : [];

    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const handleStartStop = async () => {
        if (!isTracking) {
            if (!selectedTask) {
                alert('Please select a task before starting the timer');
                return;
            }
            startTracking(selectedProject, selectedTask);
        } else {
            try {
                await stopTracking();
            } catch (err) {
                alert('Failed to save time entry');
            }
        }
    };

    if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
    if (error) return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;

    const calculateProjectTotals = () => {
        const totals = {};

        trackingHistory.forEach(entry => {
            const projectKey = entry.projectId || 'inbox';
            const projectName = entry.projectName;

            if (!totals[projectKey]) {
                totals[projectKey] = {
                    name: projectName,
                    duration: 0
                };
            }
            totals[projectKey].duration += entry.duration;
        });

        return Object.values(totals);
    };
    return (
        <div className="bg-white w-full min-h-screen p-7">
            <div className="flex items-center mt-7 mb-6">
                <h1 className="text-3xl font-semibold">Time Tracker</h1>
            </div>

            <hr className="w-full border-gray-300 my-2"/>

            <div className="mt-6">
                <div className="bg-white border rounded-lg p-6 mb-6">
                    <div className="flex flex-col gap-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <select
                                className="p-3 border rounded-lg focus:outline-none focus:border-[#6D70E0] bg-white"
                                value={selectedProject}
                                onChange={(e) => setSelectedProject(e.target.value)}
                                disabled={isTracking}
                            >
                                <option value="">Select Project or Inbox</option>
                                <option value="inbox">Inbox</option>
                                {projects.map(project => (
                                    <option key={project._id} value={project._id}>
                                        {project.name}
                                    </option>
                                ))}
                            </select>

                            <select
                                className="p-3 border rounded-lg focus:outline-none focus:border-[#6D70E0] bg-white"
                                value={selectedTask}
                                onChange={(e) => setSelectedTask(e.target.value)}
                                disabled={!selectedProject || isTracking}
                            >
                                <option value="">
                                    {!selectedProject
                                        ? 'Select a project first'
                                        : filteredTasks.length === 0
                                            ? 'No tasks available'
                                            : 'Select Task'}
                                </option>
                                {filteredTasks.map(task => (
                                    <option key={task._id} value={task._id}>
                                        {task.text}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center gap-4 justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-4">
                                <Timer className="w-8 h-8 text-[#6D70E0]"/>
                                <span className="text-4xl font-mono text-gray-700">
                                    {formatTime(elapsedTime)}
                                </span>
                            </div>
                            <button
                                onClick={handleStartStop}
                                disabled={!isTracking && !selectedTask}
                                className={`px-8 py-3 rounded-lg flex items-center gap-2 ${
                                    !isTracking && !selectedTask
                                        ? 'bg-gray-300 cursor-not-allowed'
                                        : isTracking
                                            ? 'bg-red-500 text-white hover:bg-red-600'
                                            : 'bg-[#6D70E0] text-white hover:bg-[#5456B3]'
                                }`}
                            >
                                {isTracking ? <Pause className="w-5 h-5"/> : <Play className="w-5 h-5"/>}
                                {isTracking ? 'Stop' : 'Start'}
                            </button>
                        </div>
                    </div>
                </div>
                <div className="mb-6">
                    <h2 className="text-2xl font-semibold mb-4">Project Totals</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {calculateProjectTotals().map((project, index) => (
                            <div key={index} className="bg-white border rounded-lg p-4">
                                <h3 className="font-semibold text-gray-700">{project.name}</h3>
                                <div className="flex items-center gap-2 mt-2">
                                    <Timer className="w-4 h-4 text-[#6D70E0]"/>
                                    <span className="font-mono text-[#6D70E0] font-semibold">
                        {formatTime(project.duration)}
                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div>
                    <h2 className="text-2xl font-semibold mb-4">History</h2>
                    <div className="space-y-3">
                        {trackingHistory.map(entry => (
                            <div
                                key={entry._id}
                                className="border rounded-lg p-4 hover:border-gray-300 transition-colors"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-semibold text-gray-700">{entry.taskName}</h3>
                                        <div className="flex items-center gap-2 text-gray-500 mt-1">
                                            <Folder className="w-4 h-4"/>
                                            <span className="text-sm">{entry.projectName}</span>
                                        </div>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {format(new Date(entry.startTime), 'MMM d, yyyy HH:mm')} -
                                            {format(new Date(new Date(entry.startTime).getTime() + entry.duration * 1000), 'HH:mm')}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="font-mono text-[#6D70E0] font-semibold">
                                            {formatTime(entry.duration)}
                                        </span>
                                        <button
                                            onClick={() => deleteTimeEntry(entry._id)}
                                            className="text-gray-400 hover:text-red-500 p-1"
                                        >
                                            <Trash2 className="w-4 h-4"/>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {trackingHistory.length === 0 && (
                            <p className="text-center text-gray-500 py-8">No tracking history yet</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TimeTracker;