// Backend API Configuration
const API_CONFIG = {
  BASE_URL: 'https://knowindiaback.vercel.app',
  ENDPOINTS: {
    PLACES: '/api/places',
    STATE_PLACE: '/api/places/state',
    FEEDBACK: '/api/feedback',
    HEALTH: '/api/health',
    DB_TEST: '/api/db-test'
  }
};

// Helper function to get full API URL
const getApiUrl = (endpoint) => `${API_CONFIG.BASE_URL}${endpoint}`;

export { API_CONFIG, getApiUrl }; 