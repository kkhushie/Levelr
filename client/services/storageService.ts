import axios from "axios";
import { Goal, User } from "../types";

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach the JWT token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('levelr_token');
  if (token && config.headers) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

export const storageService = {
  login: async (email: string, password: string): Promise<User> => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const data = res.data;
      localStorage.setItem('levelr_user_id', data.id);
      localStorage.setItem('levelr_token', data.token);
      return data;
    } catch (e: any) {
      throw new Error(e.response?.data?.message || e.message || "Login failed");
    }
  },

  register: async (username: string, email: string, password: string): Promise<User> => {
    try {
      const res = await api.post('/auth/register', { username, email, password });
      const data = res.data;
      localStorage.setItem('levelr_user_id', data.id);
      localStorage.setItem('levelr_token', data.token);
      return data;
    } catch (e: any) {
      throw new Error(e.response?.data?.message || e.message || "Registration failed");
    }
  },

  logout: async (): Promise<void> => {
    localStorage.removeItem('levelr_user_id');
    localStorage.removeItem('levelr_token');
  },

  getCurrentUser: async (): Promise<User | null> => {
    const userId = localStorage.getItem('levelr_user_id');
    if (!userId) return null;

    try {
      const res = await api.get(`/users/${userId}`);
      return res.data;
    } catch (e: any) {
      if (e.response && (e.response.status === 401 || e.response.status === 404)) {
        localStorage.removeItem('levelr_user_id');
        localStorage.removeItem('levelr_token');
      }
      console.error("Failed to fetch user, maybe server is down", e);
      return null;
    }
  },

  updateUser: async (user: User): Promise<void> => {
    await api.put(`/users/${user.id}`, user);
  },

  updatePassword: async (userId: string, password: string): Promise<void> => {
    await api.put(`/users/${userId}`, { password });
  },

  getGoals: async (): Promise<Goal[]> => {
    const userId = localStorage.getItem('levelr_user_id');
    if (!userId) return [];

    try {
      const res = await api.get(`/goals?userId=${userId}`);
      return res.data;
    } catch (e) {
      return [];
    }
  },

  saveGoal: async (goal: Goal): Promise<void> => {
    const userId = localStorage.getItem('levelr_user_id');
    if (!userId) throw new Error("No active session");

    await api.post('/goals', { ...goal, userId });
  },

  deleteGoal: async (goalId: string): Promise<void> => {
    await api.delete(`/goals/${goalId}`);
  }
};

// Export the generic api client so other services can use it securely
export default api;