import { Goal, User } from "../types";

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getHeaders = () => {
  const token = localStorage.getItem('levelr_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const storageService = {
  login: async (email: string, password: string): Promise<User> => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    localStorage.setItem('levelr_user_id', data.id);
    localStorage.setItem('levelr_token', data.token);
    return data;
  },

  register: async (username: string, email: string, password: string): Promise<User> => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    localStorage.setItem('levelr_user_id', data.id);
    localStorage.setItem('levelr_token', data.token);
    return data;
  },

  logout: async (): Promise<void> => {
    localStorage.removeItem('levelr_user_id');
    localStorage.removeItem('levelr_token');
  },

  getCurrentUser: async (): Promise<User | null> => {
    const userId = localStorage.getItem('levelr_user_id');
    if (!userId) return null;

    try {
      const res = await fetch(`${API_BASE}/users/${userId}`, {
        headers: getHeaders()
      });
      if (!res.ok) {
        if (res.status === 401 || res.status === 404) {
          localStorage.removeItem('levelr_user_id');
          localStorage.removeItem('levelr_token');
        }
        return null;
      }
      return await res.json();
    } catch (e) {
      console.error("Failed to fetch user, maybe server is down", e);
      return null;
    }
  },

  updateUser: async (user: User): Promise<void> => {
    await fetch(`${API_BASE}/users/${user.id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(user)
    });
  },

  updatePassword: async (userId: string, password: string): Promise<void> => {
    await fetch(`${API_BASE}/users/${userId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ password })
    });
  },

  getGoals: async (): Promise<Goal[]> => {
    const userId = localStorage.getItem('levelr_user_id');
    if (!userId) return [];

    const res = await fetch(`${API_BASE}/goals?userId=${userId}`, {
      headers: getHeaders()
    });
    if (!res.ok) return [];
    return await res.json();
  },

  saveGoal: async (goal: Goal): Promise<void> => {
    const userId = localStorage.getItem('levelr_user_id');
    if (!userId) throw new Error("No active session");

    await fetch(`${API_BASE}/goals`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ ...goal, userId }) // ensure userId is attached
    });
  },

  deleteGoal: async (goalId: string): Promise<void> => {
    await fetch(`${API_BASE}/goals/${goalId}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
  }
};