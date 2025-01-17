import React, { useRef, useEffect, useState } from 'react';
import { useTaskContext } from './TaskContext';
import { format } from 'date-fns';
import axios from 'axios';

const TaskModal = () => {
    const {
        isTaskModalOpen,
        closeTaskModal,
        currentTask,
        defaultProjectId,
        defaultDate,
        error: contextError,
        loading: contextLoading
    } = useTaskContext();

    const [projects, setProjects] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const inputRef = useRef();
    const descriptionRef = useRef();
    const dateRef = useRef();
    const projectSelectRef = useRef();

    useEffect(() => {
        if (isTaskModalOpen) {
            fetchProjects();
            if (inputRef.current) {
                inputRef.current.focus();

                if (currentTask) {
                    inputRef.current.value = currentTask.text || '';
                    descriptionRef.current.value = currentTask.description || '';
                    dateRef.current.value = currentTask.date ? format(new Date(currentTask.date), 'yyyy-MM-dd') : '';
                    projectSelectRef.current.value = currentTask.projectId || defaultProjectId || '';
                } else {
                    inputRef.current.value = '';
                    descriptionRef.current.value = '';
                    dateRef.current.value = defaultDate ? format(new Date(defaultDate), 'yyyy-MM-dd') : '';
                    projectSelectRef.current.value = defaultProjectId || '';
                }
            }
        }
    }, [isTaskModalOpen, currentTask, defaultProjectId, defaultDate]);

    const fetchProjects = async () => {
        try {
            const response = await axios.get('http://localhost:5005/api/projects');
            setProjects(response.data);
        } catch (err) {
            setError('Failed to load projects');
        }
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            setError(null);

            const taskData = {
                text: inputRef.current.value.trim(),
                description: descriptionRef.current.value.trim(),
                date: new Date(dateRef.current.value).toISOString(),
                projectId: projectSelectRef.current.value || null,
                isComplete: currentTask ? currentTask.isComplete : false
            };

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

    if (!isTaskModalOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-sm w-full">
                <h2 className="text-2xl font-semibold mb-4">
                    {currentTask ? 'Edit Task' : 'Add New Task'}
                </h2>

                {(error || contextError) && (
                    <div className="mb-4 p-2 bg-red-50 text-red-600 rounded">
                        {error || contextError}
                    </div>
                )}

                <select
                    ref={projectSelectRef}
                    className="w-full mb-3 p-2 border rounded focus:outline-none focus:border-[#6D70E0]"
                    defaultValue={currentTask?.projectId || defaultProjectId || ''}
                    disabled={loading || contextLoading}
                >
                    <option value="">Inbox</option>
                    {projects.map(project => (
                        <option key={project._id} value={project._id}>
                            {project.name}
                        </option>
                    ))}
                </select>

                <input
                    ref={inputRef}
                    className="w-full mb-3 p-2 border rounded focus:outline-none focus:border-[#6D70E0]"
                    type="text"
                    placeholder="Task Title"
                    disabled={loading || contextLoading}
                />

                <textarea
                    ref={descriptionRef}
                    className="w-full mb-3 p-2 border rounded resize-none focus:outline-none focus:border-[#6D70E0]"
                    rows="3"
                    placeholder="Task Description (optional)"
                    disabled={loading || contextLoading}
                />

                <input
                    ref={dateRef}
                    className="w-full mb-3 p-2 border rounded focus:outline-none focus:border-[#6D70E0]"
                    type="date"
                    disabled={loading || contextLoading}
                />

                <div className="flex justify-end gap-4">
                    <button
                        onClick={closeTaskModal}
                        className="px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                        disabled={loading || contextLoading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-4 py-2 rounded-full bg-[#6D70E0] text-white hover:bg-[#5456B3] transition-colors disabled:opacity-50"
                        disabled={loading || contextLoading}
                    >
                        {loading || contextLoading ? 'Saving...' : currentTask ? 'Update Task' : 'Add Task'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TaskModal;