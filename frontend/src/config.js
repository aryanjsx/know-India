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
    STATE_PLACE: '/api/state',
    // Auth endpoints
    AUTH_GOOGLE: '/auth/google',
    // Posts endpoints
    POSTS: '/api/posts',
    // Profile posts endpoints
    PROFILE_POSTS: '/api/profile/posts',
    // Profile settings endpoint
    PROFILE_SETTINGS: '/api/profile/settings',
    // Saved places endpoints
    SAVED_PLACES: '/api/saved-places',
    // Festivals endpoints
    FESTIVALS: '/api/festivals',
    FESTIVALS_RELIGIONS: '/api/festivals/filters/religions',
  }
};

// Helper function to get full API URL
export const getApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
}; 
