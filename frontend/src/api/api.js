import axios from 'axios';

// Use environment variable or fallback to localhost for development
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
console.log('API_URL configured as:', API_URL);
console.log('Environment variables:', import.meta.env);

// Create an axios instance
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Send cookies with requests
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request logging
api.interceptors.request.use((config) => {
  console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
  return config;
}, error => {
  console.error('Request interceptor error:', error);
  return Promise.reject(error);
});

// Handle response errors
api.interceptors.response.use(response => {
  console.log(`Response from ${response.config.url}:`, response.status);
  return response;
}, error => {
  console.error('API Error:', error.response?.status, error.response?.data?.message || error.message);
  
  // Handle unauthorized errors
  if (error.response && error.response.status === 401) {
    console.log('Auth error - redirecting to login');
    
    // Only redirect if not already on login page
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }
  return Promise.reject(error);
});

export const authAPI = {
  signup: (userData) => api.post('/auth/signup', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me')
};

export const bookingsAPI = {
  getCurrentMonthDates: () => api.get('/bookings/current-month-dates'),
  getCurrentMonthRanges: () => api.get('/bookings/current-month-ranges'),
  createBooking: (bookingData) => api.post('/bookings', bookingData),
  releaseBookings: (dateRange) => api.delete('/bookings/release', { data: dateRange })
};

export default api;