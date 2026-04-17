import axios from 'axios';

/**
 * API Base URL
 */
export const API_URL = import.meta.env.VITE_API_URL || (
  window.location.hostname === 'localhost'
    ? 'http://localhost:3001'
    : window.location.origin
);

/**
 * Centralized API client with interceptors
 * Eliminates duplicate token handling
 */
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - automatically add auth token
apiClient.interceptors.request.use(
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

// Response interceptor - handle common errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      // Unauthorized - clear token and redirect to login
      if (status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        // Only redirect if not already on login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }

      // Rate limited
      if (status === 429) {
        const retryAfter = data.retryAfter || 60;
        error.message = `Príliš veľa pokusov. Skúste znova o ${retryAfter}s.`;
      }

      // Attach user-friendly message
      error.userMessage = data.message || 'Nastala chyba';
    } else if (error.request) {
      // Request made but no response
      error.userMessage = 'Server neodpovedá. Skontrolujte pripojenie.';
    } else {
      // Something else happened
      error.userMessage = 'Nastala neočakávaná chyba.';
    }

    return Promise.reject(error);
  }
);

/**
 * API methods with consistent error handling
 */
export const api = {
  get: (url, config) => apiClient.get(url, config),
  post: (url, data, config) => apiClient.post(url, data, config),
  put: (url, data, config) => apiClient.put(url, data, config),
  delete: (url, config) => apiClient.delete(url, config),
  patch: (url, data, config) => apiClient.patch(url, data, config)
};

export default apiClient;
