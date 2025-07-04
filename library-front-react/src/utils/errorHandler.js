// Error handling utilities for the application
import config from '../config/config';

class ApiError extends Error {
  constructor(message, status, response) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.response = response;
  }
}

class NetworkError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NetworkError';
  }
}

// Logging functions for API requests and responses
export const logRequest = (service, url, options = {}) => {
  if (config?.debug?.enableApiLogging && config?.debug?.logLevel === 'debug') {
    console.log(`[${service}] Request:`, {
      url,
      method: options.method || 'GET',
      headers: options.headers,
      timestamp: new Date().toISOString()
    });
  }
};

export const logResponse = (service, url, data) => {
  if (config?.debug?.enableApiLogging && config?.debug?.logLevel === 'debug') {
    console.log(`[${service}] Response:`, {
      url,
      data: typeof data === 'object' ? JSON.stringify(data).substring(0, 500) + '...' : data,
      timestamp: new Date().toISOString()
    });
  }
};

export const handleApiError = (error) => {
  if (config?.debug?.logLevel === 'debug') {
    console.error('API Error:', error);
  }

  if (error.response) {
    // Server responded with error status
    const status = error.response.status;
    const message = error.response.data?.message || error.response.statusText || 'Server error';
    
    switch (status) {
      case 400:
        return new ApiError('Invalid request. Please check your input.', status, error.response);
      case 401:
        return new ApiError('Authentication required. Please log in.', status, error.response);
      case 403:
        return new ApiError('Access denied. You don\'t have permission.', status, error.response);
      case 404:
        return new ApiError('Resource not found.', status, error.response);
      case 429:
        return new ApiError('Too many requests. Please try again later.', status, error.response);
      case 500:
        return new ApiError('Server error. Please try again later.', status, error.response);
      default:
        return new ApiError(message, status, error.response);
    }
  } else if (error.request) {
    // Network error
    return new NetworkError('Network error. Please check your connection and try again.');
  } else {
    // Other error
    return new Error(error.message || 'An unexpected error occurred.');
  }
};

export const isNetworkError = (error) => {
  return error instanceof NetworkError || 
         (error.code === 'NETWORK_ERROR') ||
         (error.message && error.message.includes('Network Error'));
};

export const shouldUseMockData = (error) => {
  return config?.features?.enableMockData && (
    isNetworkError(error) || 
    (error instanceof ApiError && error.status >= 500)
  );
};

export const logError = (service, url, error, context = '') => {
  const errorInfo = {
    service,
    url,
    message: error.message,
    name: error.name,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
  };

  if (error instanceof ApiError) {
    errorInfo.status = error.status;
    errorInfo.response = error.response?.data;
  }

  if (config?.debug?.logLevel === 'debug') {
    console.error('Error logged:', errorInfo);
  }

  // In production, you might want to send this to a logging service
  if (config?.debug?.logLevel === 'error' && error instanceof ApiError && error.status >= 500) {
    // Send to error tracking service (e.g., Sentry, LogRocket, etc.)
    console.error('Critical error:', errorInfo);
  }
};

export { ApiError, NetworkError };
