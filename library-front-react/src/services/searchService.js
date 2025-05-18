import axios from 'axios';

const API_URL = 'http://localhost:8084/api/search'; // search-service

export const searchByTitle = (title) => axios.get(`${API_URL}/title?title=${title}`);
export const searchByAuthor = (author) => axios.get(`${API_URL}/author?author=${author}`);
export const searchByCategory = (category) => axios.get(`${API_URL}/category?category=${category}`);
