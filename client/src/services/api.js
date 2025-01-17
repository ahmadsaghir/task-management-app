import axios from 'axios';

const API_URL = 'http://localhost:5005/api';

const api = axios.create({
    baseURL: API_URL
});

export const taskService = {
    getAll: () => api.get('/tasks'),
    create: (task) => api.post('/tasks', task),
    update: (id, task) => api.patch(`/tasks/${id}`, task),
    delete: (id) => api.delete(`/tasks/${id}`)
};

export const projectService = {
    getAll: () => api.get('/projects'),
    create: (project) => api.post('/projects', project),
    update: (id, project) => api.patch(`/projects/${id}`, project),
    delete: (id) => api.delete(`/projects/${id}`)
};