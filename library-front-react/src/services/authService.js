import axios from 'axios';

const API_URL = 'http://localhost:8081/api'; // user-service

export const login = (credentials) => axios.post(`${API_URL}/auth/login`, credentials);
export const register = (userData) => axios.post(`${API_URL}/auth/register`, userData);

export const getProfile = (token) =>
  axios.get(`${API_URL}/user/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
