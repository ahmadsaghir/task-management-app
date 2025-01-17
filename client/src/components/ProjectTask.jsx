import React, { useState, useEffect } from 'react';
import { Plus, Folder, FolderPlus } from "lucide-react";
import TaskItems from './TaskItems';
import TaskModal from './TaskModal';
import { useTaskContext } from './TaskContext';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import PaginatedList from './PaginatedList';

const ProjectTask = () => {
    const [projects, setProjects] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const { setCurrentTask, setIsTaskModalOpen, setDefaultProjectId } = useTaskContext();
    const { projectId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [projectRes, taskRes] = await Promise.all([
                    axios.get('http://localhost:5005/api/projects'),
                    axios.get('http://localhost:5005/api/tasks')
                ]);

                const projectTasks = taskRes.data.filter(task => task.projectId);

                setProjects(projectRes.data);
                setTasks(projectTasks);
                if (projectId) setSelectedProject(projectId);
            } catch (err) {
                console.error('Error fetching data:', err);
            }
        };

        fetchData();

        const handleTasksUpdated = () => fetchData();
        window.addEventListener('tasksUpdated', handleTasksUpdated);
        return () => window.removeEventListener('tasksUpdated', handleTasksUpdated);
    }, [projectId]);

    const handleProjectClick = (projectId) => {
        if (selectedProject === projectId) {
            setSelectedProject(null);
            navigate('/projects'); // Navigate to the base projects route
        } else {
            setSelectedProject(projectId);
            navigate(`/projects/${projectId}`);
        }
    };

    const handleNewTask = () => {
        setCurrentTask(null);
        setDefaultProjectId(selectedProject);
        setIsTaskModalOpen(true);
    };

    const openEditModal = (task) => {
        setCurrentTask(task);
        setDefaultProjectId(selectedProject);
        setIsTaskModalOpen(true);
    };

    const deleteTask = async (id) => {
        try {
            await axios.delete(`http://localhost:5005/api/tasks/${id}`);
            const updatedTasks = tasks.filter(task => task._id !== id);
            setTasks(updatedTasks);
        } catch (err) {
            console.error('Error deleting task:', err);
        }
    };

    const toggle = async (id) => {
        try {
            const task = tasks.find(t => t._id === id);
            await axios.patch(`http://localhost:5005/api/tasks/${id}`, {
                isComplete: !task.isComplete
            });
            const updatedTasks = tasks.map(t =>
                t._id === id ? { ...t, isComplete: !t.isComplete } : t
            );
            setTasks(updatedTasks);
        } catch (err) {
            console.error('Error toggling task:', err);
        }
    };

    const addProject = async (projectName) => {
        if (!projectName.trim()) return;
        try {
            const res = await axios.post('http://localhost:5005/api/projects', { name: projectName });
            setProjects([...projects, res.data]);
            setIsProjectModalOpen(false);
        } catch (err) {
            console.error('Error creating project:', err);
        }
    };

    const deleteProject = async (projectId) => {
        try {
            await axios.delete(`http://localhost:5005/api/projects/${projectId}`);
            const projectTasks = tasks.filter(task => task.projectId === projectId);
            await Promise.all(projectTasks.map(task =>
                axios.delete(`http://localhost:5005/api/tasks/${task._id}`)
            ));
            setProjects(projects.filter(p => p._id !== projectId));
            setTasks(tasks.filter(t => t.projectId !== projectId));
            if (selectedProject === projectId) setSelectedProject(null);
        } catch (err) {
            console.error('Error deleting project:', err);
        }
    };

    useEffect(() => {
        setDefaultProjectId(selectedProject);
    }, [selectedProject, setDefaultProjectId]);

    // Modified filteredTasks logic to show all project tasks when no project is selected
    const filteredTasks = selectedProject
        ? tasks.filter(task => task.projectId?.toString() === selectedProject?.toString())
        : tasks;

    // Sort tasks with completed ones at the bottom
    const sortedTasks = [...filteredTasks].sort((a, b) => {
        if (a.isComplete === b.isComplete) return 0;
        return a.isComplete ? 1 : -1;
    });

    return (
        <div className="bg-white w-full min-h-screen p-7">
            <div className="flex items-center justify-between mt-7 mb-6">
                <h1 className="text-3xl font-semibold">Projects</h1>
                <button
                    onClick={() => setIsProjectModalOpen(true)}
                    className="bg-[#6D70E0] text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                    <FolderPlus/> New Project
                </button>
            </div>

            <hr className="w-full border-gray-300 my-2"/>

            <div className="mt-6">
                <PaginatedList
                    items={projects}
                    itemsPerPage={4}
                    layout="grid"
                    renderItem={(project) => (
                        <div
                            key={project._id}
                            className={`p-4 border rounded-lg cursor-pointer transition-all ${
                                selectedProject === project._id ? 'border-[#6D70E0] bg-indigo-50' : 'hover:border-gray-400'
                            }`}
                            onClick={() => handleProjectClick(project._id)}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <Folder className="text-[#6D70E0]"/>
                                    <h3 className="font-semibold">{project.name}</h3>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteProject(project._id);
                                    }}
                                    className="text-gray-500 hover:text-red-500"
                                >
                                    Delete
                                </button>
                            </div>
                            <p className="text-sm text-gray-500">
                                {tasks.filter(task => task.projectId === project._id).length} tasks
                            </p>
                        </div>
                    )}
                />
            </div>
            <div className="mt-8">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold">Tasks</h2>
                    <button
                        onClick={handleNewTask}
                        className="bg-[#6D70E0] text-white px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                        <Plus/> New Task
                    </button>
                </div>

                {sortedTasks.map(task => (
                    <TaskItems
                        key={task._id}
                        {...task}
                        id={task._id}
                        deleteTask={deleteTask}
                        toggle={toggle}
                        openEditModal={() => openEditModal(task)}
                    />
                ))}
            </div>

            {isProjectModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg max-w-sm w-full">
                        <h2 className="text-2xl font-semibold mb-4">Create New Project</h2>
                        <input
                            id="projectName"
                            className="w-full mb-4 p-2 border rounded"
                            type="text"
                            placeholder="Project Name"
                        />
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => setIsProjectModalOpen(false)}
                                className="px-4 py-2 rounded-full bg-gray-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => addProject(document.getElementById('projectName').value)}
                                className="px-4 py-2 rounded-full bg-[#6D70E0] text-white"
                            >
                                Create Project
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <TaskModal/>
        </div>
    );
};

export default ProjectTask;