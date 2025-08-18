// API Configuration using environment variables with fallback
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

console.log('Environment:', import.meta.env.MODE); // For debugging
console.log('API Base URL:', API_BASE_URL); // For debugging

const config = {
  API_BASE_URL: API_BASE_URL,
  
  FILES_BASE_URL: `${API_BASE_URL.replace('/api', '')}/api/files`,
    
  FRONTEND_URL: import.meta.env.MODE === 'production' 
    ? window.location.origin 
    : 'http://localhost:5173'
};

export default config;
