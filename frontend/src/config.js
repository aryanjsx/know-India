// Backend API Configuration
export const API_CONFIG = {
  // BASE_URL: 'http://localhost:5000',
  BASE_URL: 'https://knowindiaback.vercel.app',
  ENDPOINTS: {
    STATES: '/api/states',
    PLACES: '/api/places',
    FEEDBACK: '/api/feedback',
    HEALTH: '/api/health',
    DB_TEST: '/api/db-test',
    STATE_PLACE: '/api/state'
  }
};

// Helper function to get full API URL
export const getApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
}; 
