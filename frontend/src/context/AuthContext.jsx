import { createContext, useContext, useState, useEffect } from 'react';
import { isTokenExpired, getUserFromToken } from '../utils/jwt';
import { API_CONFIG } from '../config';

const AuthContext = createContext(null);

const TOKEN_KEY = 'auth_token';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore auth state from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    
    if (storedToken && !isTokenExpired(storedToken)) {
      const userInfo = getUserFromToken(storedToken);
      setToken(storedToken);
      setUser(userInfo);
      
      // Fetch fresh profile data from backend to get name/avatar
      fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PROFILE_SETTINGS}`, {
        headers: {
          'Authorization': `Bearer ${storedToken}`,
        },
      })
        .then(res => res.json())
        .then(data => {
          if (data.user) {
            setUser(prev => ({
              ...prev,
              name: data.user.name || prev?.name,
              avatar: data.user.avatar || prev?.avatar,
            }));
          }
        })
        .catch(err => console.error('Error fetching profile:', err))
        .finally(() => setIsLoading(false));
    } else {
      if (storedToken) {
        // Token exists but is expired, clean up
        localStorage.removeItem(TOKEN_KEY);
      }
      setIsLoading(false);
    }
  }, []);

  /**
   * Login user with JWT token
   * @param {string} newToken - JWT token from backend
   */
  const login = (newToken) => {
    if (!newToken || isTokenExpired(newToken)) {
      console.error('Invalid or expired token');
      return false;
    }

    const userInfo = getUserFromToken(newToken);
    
    if (!userInfo) {
      console.error('Could not decode user from token');
      return false;
    }

    localStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
    setUser(userInfo);
    return true;
  };

  /**
   * Logout user and clear auth state
   */
  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  };

  /**
   * Update user data (e.g., after profile settings change)
   * @param {Object} updatedUser - Updated user data from API
   */
  const updateUser = (updatedUser) => {
    if (updatedUser) {
      setUser(prev => ({
        ...prev,
        ...updatedUser,
      }));
    }
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to access auth context
 * @returns {Object} Auth context value
 */
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

export default AuthContext;

