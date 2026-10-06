import axios from 'axios';
import { API_BASE_URL } from '../config/api';

// Public API - no auth interceptor
export const publicApi = axios.create({
  baseURL: API_BASE_URL,
});

// Authenticated API - with auth interceptor
const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token') || localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('Unauthorized request (401). Clearing token and redirecting to login.');
      sessionStorage.removeItem('token');
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// Project Management API helpers (Faculty + Student Workflow)
export const projectApi = {
  createProject: (projectData: any) => api.post('/applications/projects', projectData),
  updateProject: (id: number | string, projectData: any) => api.put(`/applications/projects/${id}`, projectData).catch(() => ({ data: projectData })),
  deleteProject: (id: number | string) => api.delete(`/applications/projects/${id}`).catch(() => ({ data: { deleted: true } })),
  getFacultyProjects: (email: string) => api.get(`/applications/projects/faculty?email=${encodeURIComponent(email)}`).catch(() => ({ data: [] })),
  getStudentProjects: (email: string) => api.get(`/applications/projects/student?email=${encodeURIComponent(email)}`).catch(() => ({ data: [] })),
  getProjectById: (id: number | string) => api.get(`/applications/projects/${id}`).catch(() => ({ data: null })),
  assignTask: (params: any) => {
    const query = new URLSearchParams(params).toString();
    return api.post(`/applications/projects/tasks/assign?${query}`);
  },
  getTasksByProject: (projectId: number | string) => api.get(`/applications/projects/${projectId}/tasks`),
  getTasksByStudent: (email: string) => api.get(`/applications/projects/tasks/student?email=${encodeURIComponent(email)}`),
  submitTask: (taskId: number | string, studentEmail: string, responseText: string, files?: File[]) => {
    const fd = new FormData();
    fd.append('studentEmail', studentEmail);
    if (responseText) fd.append('responseText', responseText);
    if (files && files.length > 0) {
      files.forEach((file) => fd.append('files', file));
    }
    return api.post(`/applications/projects/tasks/${taskId}/submit`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  reviewSubmission: (submissionId: number | string, params: any) => {
    const query = new URLSearchParams(params).toString();
    return api.post(`/applications/projects/submissions/${submissionId}/review?${query}`);
  },
  getTaskDetails: (taskId: number | string) => api.get(`/applications/projects/tasks/${taskId}/details`),
};
