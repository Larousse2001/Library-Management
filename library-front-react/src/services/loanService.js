import axios from 'axios';
import config from '../config/config';

const api = axios.create({
  baseURL: config.api.loanService?.baseUrl || 'http://localhost:8083',
  timeout: config.api.loanService?.timeout || 10000,
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
    console.error('Loan Service API Error:', error);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
    }
    return Promise.reject(error);
  }
);

// Loan Management API calls
export const borrowBook = (borrowData) => 
  api.post('/api/loans/borrow', borrowData);

export const returnBook = (loanId) => 
  api.put(`/api/loans/return/${loanId}`);

export const getUserLoans = (userId, page = 0, size = 10) => 
  api.get(`/api/loans/user/${userId}?page=${page}&size=${size}`);

export const getActiveLoans = (page = 0, size = 10) => 
  api.get(`/api/loans/active?page=${page}&size=${size}`);

export const getOverdueLoans = () => 
  api.get('/api/loans/overdue');

export const getUserStats = (userId) => 
  api.get(`/api/loans/stats/${userId}`);

export const getBookHistory = (bookId) => 
  api.get(`/api/loans/book/${bookId}`);

// Enhanced loan operations
export const renewLoan = (loanId) => 
  api.put(`/api/loans/renew/${loanId}`);

export const calculateFine = (loanId) => 
  api.get(`/api/loans/fine/${loanId}`);

export const payFine = (loanId, amount) => 
  api.post(`/api/loans/pay-fine/${loanId}`, { amount });

// Admin operations
export const getAllLoans = (page = 0, size = 20) => 
  api.get(`/api/loans/admin/all?page=${page}&size=${size}`);

export const getLoansByStatus = (status, page = 0, size = 20) => 
  api.get(`/api/loans/admin/status/${status}?page=${page}&size=${size}`);

export default {
  borrowBook,
  returnBook,
  getUserLoans,
  getActiveLoans,
  getOverdueLoans,
  getUserStats,
  getBookHistory,
  renewLoan,
  calculateFine,
  payFine,
  getAllLoans,
  getLoansByStatus
};
