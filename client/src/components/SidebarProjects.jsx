import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, FolderPlus, Plus, Folder } from 'lucide-react';
import axios from 'axios';

const SidebarProjects = ({ expanded }) => {
    const [projects, setProjects] = useState([]);
    const [isExpanded, setIsExpanded] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const response = await axios.get('http://localhost:5005/api/projects');
            setProjects(response.data);
        } catch (error) {
            console.error('Error fetching projects:', error);
        }
    };

    const addProject = async (projectName) => {
        if (projectName.trim() === '') return;

        try {
            const response = await axios.post('http://localhost:5005/api/projects', {
                name: projectName,
            });
            setProjects(prev => [...prev, response.data]);
            setIsModalOpen(false);
            navigate(`/projects/${response.data._id}`);
        } catch (error) {
            console.error('Error creating project:', error);
        }
    };

    return (
        <div className="mb-4">
            <div
                className="flex items-center justify-between py-2 px-3 my-1 cursor-pointer hover:bg-indigo-50 rounded-md"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center">
                    <ChevronDown
                        className={`w-4 h-4 mr-2 transition-transform ${
                            isExpanded ? '' : '-rotate-90'
                        }`}
                    />
                    {expanded && <span>All Projects</span>}
                </div>
                {expanded && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsModalOpen(true);
                        }}
                        className="hover:text-[#6D70E0]"
                    >
                        <FolderPlus className="w-4 h-4" />
                    </button>
                )}
            </div>

            {isExpanded && (
                <div className={`ml-4 ${expanded ? '' : 'hidden'}`}>
                    <div
                        className="flex items-center py-2 px-3 my-1 cursor-pointer hover:bg-indigo-50 rounded-md"
                        onClick={() => navigate('/projects')}
                    >
                        <Folder className="w-4 h-4 mr-2 text-[#6D70E0]" />
                        <span className="text-sm">View All</span>
                    </div>
                    {projects.map((project) => (
                        <div
                            key={project._id}
                            onClick={() => navigate(`/projects/${project._id}`)}
                            className="flex items-center py-2 px-3 my-1 cursor-pointer hover:bg-indigo-50 rounded-md"
                        >
                            <Folder className="w-4 h-4 mr-2 text-[#6D70E0]" />
                            <span className="text-sm">{project.name}</span>
                        </div>
                    ))}
                </div>
            )}

            {isModalOpen && (
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
                                onClick={() => setIsModalOpen(false)}
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
        </div>
    );
};

export default SidebarProjects;