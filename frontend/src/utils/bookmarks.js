/**
 * Bookmark/Favorites Utility Functions
 * Uses localStorage to persist bookmarked places
 */

const STORAGE_KEY = 'knowindia_bookmarks';

/**
 * Get all bookmarked places from localStorage
 * @returns {Array} Array of bookmarked place objects
 */
export const getBookmarks = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading bookmarks:', error);
    return [];
  }
};

/**
 * Save bookmarks array to localStorage
 * @param {Array} bookmarks - Array of bookmark objects
 */
const saveBookmarks = (bookmarks) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
  } catch (error) {
    console.error('Error saving bookmarks:', error);
  }
};

/**
 * Check if a place is bookmarked
 * @param {string} placeId - The unique identifier for the place
 * @returns {boolean} True if bookmarked
 */
export const isBookmarked = (placeId) => {
  const bookmarks = getBookmarks();
  return bookmarks.some(b => b.id === placeId);
};

/**
 * Add a place to bookmarks
 * @param {Object} place - Place object with id, name, state, image, etc.
 * @returns {boolean} True if added successfully
 */
export const addBookmark = (place) => {
  if (!place || !place.id) {
    console.error('Invalid place object');
    return false;
  }
  
  const bookmarks = getBookmarks();
  
  // Check if already bookmarked
  if (bookmarks.some(b => b.id === place.id)) {
    return false;
  }
  
  // Create a minimal bookmark object to save storage space
  const bookmark = {
    id: place.id,
    name: place.name,
    state: place.state || place.stateName,
    stateSlug: place.stateSlug || (place.state || '').toLowerCase().replace(/\s+/g, '-'),
    category: place.category_name || place.category || 'Place',
    image: place.images?.[0] || place.image || null,
    description: place.description?.substring(0, 150) || '',
    addedAt: Date.now(),
  };
  
  bookmarks.unshift(bookmark); // Add to beginning
  saveBookmarks(bookmarks);
  
  // Dispatch custom event for reactivity across components
  window.dispatchEvent(new CustomEvent('bookmarksUpdated', { detail: { action: 'add', place: bookmark } }));
  
  return true;
};

/**
 * Remove a place from bookmarks
 * @param {string} placeId - The unique identifier for the place
 * @returns {boolean} True if removed successfully
 */
export const removeBookmark = (placeId) => {
  const bookmarks = getBookmarks();
  const filtered = bookmarks.filter(b => b.id !== placeId);
  
  if (filtered.length === bookmarks.length) {
    return false; // Nothing was removed
  }
  
  saveBookmarks(filtered);
  
  // Dispatch custom event for reactivity
  window.dispatchEvent(new CustomEvent('bookmarksUpdated', { detail: { action: 'remove', placeId } }));
  
  return true;
};

/**
 * Toggle bookmark status for a place
 * @param {Object} place - Place object
 * @returns {boolean} New bookmark status (true = bookmarked)
 */
export const toggleBookmark = (place) => {
  if (isBookmarked(place.id)) {
    removeBookmark(place.id);
    return false;
  } else {
    addBookmark(place);
    return true;
  }
};

/**
 * Get bookmark count
 * @returns {number} Number of bookmarked places
 */
export const getBookmarkCount = () => {
  return getBookmarks().length;
};

/**
 * Clear all bookmarks
 */
export const clearAllBookmarks = () => {
  saveBookmarks([]);
  window.dispatchEvent(new CustomEvent('bookmarksUpdated', { detail: { action: 'clear' } }));
};

/**
 * Custom hook-like function to subscribe to bookmark changes
 * @param {Function} callback - Function to call when bookmarks change
 * @returns {Function} Unsubscribe function
 */
export const onBookmarksChange = (callback) => {
  const handler = (event) => callback(event.detail);
  window.addEventListener('bookmarksUpdated', handler);
  return () => window.removeEventListener('bookmarksUpdated', handler);
};

