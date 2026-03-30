// API Configuration
// Uses environment variable in production, localhost in development

const API_BASE_URL = import.meta.env.VITE_API_URL ||
  (window.location.hostname === 'localhost'
    ? 'http://localhost:3001'
    : window.location.origin);

export const API_URL = API_BASE_URL;

// Helper function to build API URLs
export const buildApiUrl = (path) => {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  return `${API_URL}/${cleanPath}`;
};

export default API_URL;
