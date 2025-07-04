import axios from 'axios';
import config from '../config/config';
import { handleApiError, logError } from '../utils/errorHandler';
import { getCurrentUserId } from '../utils/authUtils';
import eventService from './eventService';

const API_URL = config.api.gamificationService.baseUrl; // Gamification microservice URL

// Create axios instance with common config
const gamificationApi = axios.create({
  baseURL: API_URL,
  timeout: config.api.gamificationService.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token if available
gamificationApi.interceptors.request.use(
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
gamificationApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Gamification API Error:', error);
    return Promise.reject(error);
  }
);

// Event APIs
// Event service is now in its own file - import from './eventService'
// export const eventService = {
//   createEvent: (eventData) => gamificationApi.post('/events', eventData),
//   getEvents: (params = {}) => gamificationApi.get('/events', { params }),
//   getUserEvents: (userId, params = {}) => 
//     gamificationApi.get(`/events/user/${userId}`, { params }),
//   getEventById: (eventId) => gamificationApi.get(`/events/${eventId}`),
// };

// User Progress APIs
export const userProgressService = {
  createProgress: (progressData) => gamificationApi.post('/progress', progressData),
  getUserProgress: (userId) => gamificationApi.get(`/progress/user/${userId}`),
  getChallengeProgress: (challengeId) => 
    gamificationApi.get(`/progress/challenge/${challengeId}`),
  getUserChallengeProgress: (userId, challengeId) => 
    gamificationApi.get(`/progress/user/${userId}/challenge/${challengeId}`),
  updateProgress: (userId, challengeId, updateData) => 
    gamificationApi.patch(`/progress/user/${userId}/challenge/${challengeId}`, updateData),
};

// Leaderboard APIs
export const leaderboardService = {
  getLeaderboard: (params = {}) => gamificationApi.get('/leaderboard', { params }),
  getUserRank: (userId, params = {}) => 
    gamificationApi.get(`/leaderboard/user/${userId}/rank`, { params }),
  updateLeaderboard: (userId, category, updateData) => 
    gamificationApi.patch(`/leaderboard/user/${userId}/category/${category}`, updateData),
  resetLeaderboard: (category, period) => 
    gamificationApi.post(`/leaderboard/reset/${category}/${period}`),
};

// Notification APIs
export const notificationService = {
  createNotification: (notificationData) => 
    gamificationApi.post('/notifications', notificationData),
  getUserNotifications: (userId, params = {}) => 
    gamificationApi.get(`/notifications/user/${userId}`, { params }),
  markAsRead: (notificationId) => 
    gamificationApi.patch(`/notifications/${notificationId}/read`),
  markAllAsRead: (userId) => 
    gamificationApi.patch(`/notifications/user/${userId}/read-all`),
  deleteNotification: (notificationId) => 
    gamificationApi.delete(`/notifications/${notificationId}`),
  getUnreadCount: (userId) => 
    gamificationApi.get(`/notifications/user/${userId}/unread-count`),
};

// WebSocket connection for real-time updates
export const createWebSocketConnection = (userId) => {
  // Use the current user ID if none provided
  const actualUserId = userId || getCurrentUserId();
  if (!actualUserId) {
    console.error('No user ID available for WebSocket connection');
    return null;
  }

  // Use the gamification service URL from config, but convert to WebSocket URL
  const baseUrl = config.api.gamificationService.baseUrl;
  let wsUrl;
  
  if (baseUrl.includes('localhost:8082')) {
    // If using API Gateway, connect to the gamification service directly for WebSocket
    wsUrl = 'ws://localhost:3000';
  } else {
    // Convert HTTP URL to WebSocket URL
    wsUrl = baseUrl.replace('http://', 'ws://').replace('https://', 'wss://');
  }
  
  const ws = new WebSocket(`${wsUrl}?userId=${actualUserId}`);
  
  ws.onopen = () => {
    if (config.debug?.logLevel === 'debug') {
      console.log('WebSocket connected to gamification service');
    }
  };
  
  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
  
  ws.onclose = () => {
    if (config.debug?.logLevel === 'debug') {
      console.log('WebSocket connection closed');
    }
  };
  
  return ws;
};

const gamificationServices = {
  eventService,
  userProgressService,
  leaderboardService,
  notificationService,
  createWebSocketConnection,
};

export default gamificationServices;
