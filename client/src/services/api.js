import axios from "axios";
import toast from "react-hot-toast";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// global error handling
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;

    if (status === 500) {
      toast.error("Server error. Try again later.");
    }

    // Don’t auto-redirect on 401 — let AuthContext handle that
    return Promise.reject(err);
  }
);

export const authAPI = {
  login: (creds) => api.post("/auth/login", creds),
  logout: () => api.post("/auth/logout"),
  getCurrentUser: () => api.get("/auth/me"),
  verifyMFA: (data) => api.post("/auth/verify-mfa", data),
  setupMFA: () => api.post("/auth/setup-mfa"),
  confirmMFA: (data) => api.post("/auth/confirm-mfa", data),
  disableMFA: () => api.post("/auth/disable-mfa"),
  changePassword: (data) => api.put("/auth/change-password", data),
};

export const userAPI = {
  getAllUsers: () => api.get("/users"),
  getRecentUsers: () => axios.get('/api/users/recent'),
  createUser: (d) => api.post("/users", d),
  updateUser: (id, d) => api.put(`/users/${id}`, d),
  deleteUser: (id) => api.delete(`/users/${id}`),
  getUserById: (id) => api.get(`/users/${id}`),
  //  New method to get only developers
  getDevelopers: () => api.get("/users/developers"),
};

export const projectAPI = {
  getAllProjects: () => api.get("/projects"),
  getProjectById: (id) => api.get(`/projects/${id}`),
  createProject: (d) => api.post("/projects", d),
  updateProject: (id, d) => api.put(`/projects/${id}`, d),
  deleteProject: (id) => api.delete(`/projects/${id}`),
  assignDeveloper: (id, devId) =>
    api.post(`/projects/${id}/assign`, { developerId: devId }),
  removeDeveloper: (id, devId) => api.delete(`/projects/${id}/assign/${devId}`),
  getMyProjects: () => api.get("/projects/my"),
};

export const documentAPI = {
  uploadDocument: (pid, fd) =>
    api.post(`/documents/upload/${pid}`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  getProjectDocuments: (pid) => api.get(`/documents/project/${pid}`),
  downloadDocument: (id) =>
    api.get(`/documents/download/${id}`, { responseType: "blob" }),
  deleteDocument: (id) => api.delete(`/documents/${id}`),
};

export default api;
