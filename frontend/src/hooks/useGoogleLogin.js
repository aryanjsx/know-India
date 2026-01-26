/**
 * useGoogleLogin Hook
 * 
 * Shared hook for Google OAuth login functionality
 * Consolidates duplicated login logic across components
 * 
 * SECURITY:
 * - Uses popup window for OAuth flow
 * - Sets flag for popup detection during cross-domain redirects
 * - Uses centralized API configuration
 */

import { useCallback } from 'react';
import { API_CONFIG } from '../config';

/**
 * Default popup window dimensions
 */
const POPUP_WIDTH = 500;
const POPUP_HEIGHT = 600;

/**
 * Hook for initiating Google OAuth login
 * @returns {Object} Login utilities
 */
const useGoogleLogin = () => {
  /**
   * Open Google OAuth popup window
   * @param {Object} options - Optional configuration
   * @param {number} [options.width] - Popup width
   * @param {number} [options.height] - Popup height
   */
  const openGoogleLogin = useCallback((options = {}) => {
    const width = options.width || POPUP_WIDTH;
    const height = options.height || POPUP_HEIGHT;
    
    // Calculate center position
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    
    // SECURITY: Set flag to indicate a popup login is in progress
    // This helps AuthSuccess detect it's in a popup even if window.opener is lost
    // during cross-domain OAuth redirects
    localStorage.setItem('auth_popup_active', Date.now().toString());
    
    // Open Google OAuth in a popup window
    const popup = window.open(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH_GOOGLE}`,
      'Google Sign In',
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
    );
    
    return popup;
  }, []);

  /**
   * Clear any stale popup flags
   * Call this on component cleanup or when popup closes unexpectedly
   */
  const clearPopupFlag = useCallback(() => {
    localStorage.removeItem('auth_popup_active');
  }, []);

  /**
   * Check if a popup login is in progress
   * @returns {boolean}
   */
  const isPopupActive = useCallback(() => {
    const timestamp = localStorage.getItem('auth_popup_active');
    if (!timestamp) return false;
    
    // Consider popup stale after 5 minutes
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
    const popupTimestamp = parseInt(timestamp, 10);
    
    if (popupTimestamp < fiveMinutesAgo) {
      // Clean up stale flag
      localStorage.removeItem('auth_popup_active');
      return false;
    }
    
    return true;
  }, []);

  return {
    openGoogleLogin,
    clearPopupFlag,
    isPopupActive,
  };
};

export default useGoogleLogin;
