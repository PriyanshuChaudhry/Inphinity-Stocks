// API Configuration
// Automatically uses the correct backend URL based on environment

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3002';

export const API_URL = API_BASE_URL;

export default API_BASE_URL;
