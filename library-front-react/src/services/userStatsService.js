import axios from 'axios';
import config from '../config/config';

const api = axios.create({
  baseURL: config.api.userService.baseUrl,
  timeout: config.api.userService.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('User Stats API Error:', error);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
    }
    return Promise.reject(error);
  }
);

// User statistics APIs
export const getUserStats = () => api.get('/api/user/stats');
export const getUserPreferences = () => api.get('/api/user/preferences');
export const updateUserPreferences = (preferences) => 
  api.put('/api/user/preferences', preferences);

// Dashboard specific data aggregation
export const getDashboardData = async () => {
  try {
    const [statsResponse, preferencesResponse] = await Promise.allSettled([
      getUserStats(),
      getUserPreferences()
    ]);

    return {
      stats: statsResponse.status === 'fulfilled' ? statsResponse.value.data : {},
      preferences: preferencesResponse.status === 'fulfilled' ? preferencesResponse.value.data : {}
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
};

const userStatsService = {
  getUserStats,
  getUserPreferences,
  updateUserPreferences,
  getDashboardData
};

export default userStatsService;
