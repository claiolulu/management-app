// API Configuration using environment variables with safe fallbacks
const API_BASE_URL =
  import.meta.env.BACKEND_API_URL ||
  (import.meta.env.MODE === 'production' ? `${window.location.origin}/api` : 'http://localhost:5001/api');

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
