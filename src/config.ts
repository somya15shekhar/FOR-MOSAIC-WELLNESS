// API configuration - automatically uses the correct URL for dev vs production
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
