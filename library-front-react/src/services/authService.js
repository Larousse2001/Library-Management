import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8081/api/auth',
});

export const register = (form) => api.post('/register', form);
export const login = (form) => api.post('/login', form);

export const getProfile = (token) =>
  axios.get(`${api}/user/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
