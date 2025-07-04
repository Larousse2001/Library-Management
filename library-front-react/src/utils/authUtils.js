// Authentication utility functions
export const getCurrentUserId = () => {
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userId = payload.userId;
      if (userId && userId !== 'null') {
        return userId;
      }
    } catch (error) {
      console.error('Error parsing token:', error);
    }
  }
  
  const storedUserId = localStorage.getItem('userId');
  if (storedUserId && storedUserId !== 'null') {
    return storedUserId;
  }
  
  return null; // Return null instead of undefined or string "null"
};

export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  const userId = getCurrentUserId();
  return !!(token && userId);
};

export const getAuthToken = () => {
  return localStorage.getItem('token');
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userId');
  localStorage.removeItem('username');
  localStorage.removeItem('role');
  window.location.href = '/login';
};
