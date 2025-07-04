import axios from 'axios';
import config from '../config/config';
import { getCurrentUserId } from '../utils/authUtils';

const API_BASE_URL = config.api.booksService.baseUrl;

// Create axios instance for books service
const booksApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: config.api.booksService.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication
booksApi.interceptors.request.use(
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
booksApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Books API Error:', error);
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

class BookService {
  
  // Get current user ID using the utility function
  getCurrentUserId() {
    return getCurrentUserId();
  }

  // Add book to user's library
  async addBookToLibrary(bookData) {
    try {
      const userId = this.getCurrentUserId();
      const response = await booksApi.post('/api/user-books', {
        userId,
        ...bookData
      });
      return response.data;
    } catch (error) {
      console.error('Error adding book to library:', error);
      throw error;
    }
  }

  // Get all books for a user
  async getAllBooks() {
    try {
      const userId = this.getCurrentUserId();
      const response = await booksApi.get(`/api/user-books/user/${userId}`, {
        params: { page: 0, size: 1000, sortBy: 'dateAdded', sortDirection: 'desc' }
      });
      return response.data.content || response.data;
    } catch (error) {
      console.error('Error fetching user books:', error);
      throw error;
    }
  }

  // Get books by status
  async getBooksByStatus(status) {
    try {
      const userId = this.getCurrentUserId();
      const response = await booksApi.get(`/api/user-books/user/${userId}/status/${status}`, {
        params: { page: 0, size: 1000 }
      });
      return response.data.content || response.data;
    } catch (error) {
      console.error('Error fetching books by status:', error);
      throw error;
    }
  }

  // Get books by category
  async getBooksByCategory(category) {
    try {
      const userId = this.getCurrentUserId();
      const response = await booksApi.get(`/api/user-books/user/${userId}/category/${encodeURIComponent(category)}`, {
        params: { page: 0, size: 1000 }
      });
      return response.data.content || response.data;
    } catch (error) {
      console.error('Error fetching books by category:', error);
      throw error;
    }
  }

  // Search user's books
  async searchBooks(searchTerm) {
    try {
      const userId = this.getCurrentUserId();
      const response = await booksApi.get(`/api/user-books/user/${userId}/search`, {
        params: { q: searchTerm, page: 0, size: 1000 }
      });
      return response.data.content || response.data;
    } catch (error) {
      console.error('Error searching user books:', error);
      throw error;
    }
  }

  // Add book (alias for addBookToLibrary)
  async addBook(bookData) {
    return this.addBookToLibrary(bookData);
  }

  // Update book
  async updateBook(bookId, updateData) {
    try {
      const userId = this.getCurrentUserId();
      const response = await booksApi.put(`/api/user-books/${bookId}/user/${userId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating book:', error);
      throw error;
    }
  }

  // Delete book
  async deleteBook(bookId) {
    try {
      const userId = this.getCurrentUserId();
      await booksApi.delete(`/api/user-books/${bookId}/user/${userId}`);
      return true;
    } catch (error) {
      console.error('Error deleting book:', error);
      throw error;
    }
  }

  // Get user book statistics
  async getStats() {
    try {
      const userId = this.getCurrentUserId();
      const response = await booksApi.get(`/api/user-books/user/${userId}/stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching book stats:', error);
      throw error;
    }
  }

  // Get user book categories
  async getCategories() {
    try {
      const userId = this.getCurrentUserId();
      const response = await booksApi.get(`/api/user-books/user/${userId}/categories`);
      return response.data;
    } catch (error) {
      console.error('Error fetching book categories:', error);
      throw error;
    }
  }

  // Get currently reading books
  async getCurrentlyReading() {
    try {
      const userId = this.getCurrentUserId();
      const response = await booksApi.get(`/api/user-books/user/${userId}/currently-reading`);
      return response.data;
    } catch (error) {
      console.error('Error fetching currently reading books:', error);
      throw error;
    }
  }

  // Get recently added books
  async getRecentlyAdded(size = 10) {
    try {
      const userId = this.getCurrentUserId();
      const response = await booksApi.get(`/api/user-books/user/${userId}/recent`, {
        params: { page: 0, size }
      });
      return response.data.content || response.data;
    } catch (error) {
      console.error('Error fetching recently added books:', error);
      throw error;
    }
  }

  // Get available book statuses
  getStatuses() {
    return ['WISHLIST', 'READING', 'READ', 'DNF'];
  }
}

export default new BookService();
