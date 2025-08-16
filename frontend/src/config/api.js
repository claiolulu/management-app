// API Configuration
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

const config = {
  API_BASE_URL: isDevelopment 
    ? 'http://localhost:5001/api' 
    : 'https://api.your-domain.com/api',
  
  FILES_BASE_URL: isDevelopment 
    ? 'http://localhost:5001/api/files' 
    : 'https://api.your-domain.com/api/files',
    
  FRONTEND_URL: isDevelopment 
    ? 'http://localhost:5173' 
    : 'https://your-domain.com'
};

export default config;
