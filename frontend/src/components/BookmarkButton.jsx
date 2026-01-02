import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, Check } from 'lucide-react';
import { isBookmarked, toggleBookmark, onBookmarksChange } from '../utils/bookmarks';
import { useTheme } from '../context/ThemeContext';

/**
 * BookmarkButton Component
 * A reusable button to bookmark/unbookmark places
 * 
 * @param {Object} props
 * @param {Object} props.place - The place object to bookmark
 * @param {string} props.size - Size variant: 'sm' | 'md' | 'lg'
 * @param {string} props.variant - Style variant: 'icon' | 'button' | 'card'
 * @param {string} props.className - Additional CSS classes
 */
const BookmarkButton = ({ 
  place, 
  size = 'md', 
  variant = 'icon',
  className = '' 
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [bookmarked, setBookmarked] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Check initial bookmark status
  useEffect(() => {
    if (place?.id) {
      setBookmarked(isBookmarked(place.id));
    }
  }, [place?.id]);

  // Listen for bookmark changes from other components
  useEffect(() => {
    const unsubscribe = onBookmarksChange((detail) => {
      if (detail.action === 'add' && detail.place?.id === place?.id) {
        setBookmarked(true);
      } else if (detail.action === 'remove' && detail.placeId === place?.id) {
        setBookmarked(false);
      } else if (detail.action === 'clear') {
        setBookmarked(false);
      }
    });
    return unsubscribe;
  }, [place?.id]);

  const handleClick = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!place?.id) return;

    const newStatus = toggleBookmark(place);
    setBookmarked(newStatus);
    
    // Show toast notification
    setToastMessage(newStatus ? 'Added to favorites!' : 'Removed from favorites');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  }, [place]);

  // Size configurations
  const sizeConfig = {
    sm: { icon: 14, padding: 'p-1.5', text: 'text-xs' },
    md: { icon: 18, padding: 'p-2', text: 'text-sm' },
    lg: { icon: 22, padding: 'p-3', text: 'text-base' },
  };

  const config = sizeConfig[size] || sizeConfig.md;

  // Variant styles
  const getVariantStyles = () => {
    if (variant === 'card') {
      // For use on place cards - subtle overlay style
      return bookmarked
        ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
        : isDark
          ? 'bg-black/50 text-white hover:bg-orange-500 backdrop-blur-sm'
          : 'bg-white/90 text-gray-700 hover:bg-orange-500 hover:text-white backdrop-blur-sm shadow-sm';
    }
    
    if (variant === 'button') {
      // For use as a full button with text
      return bookmarked
        ? isDark
          ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
          : 'bg-orange-100 text-orange-600 border border-orange-200'
        : isDark
          ? 'bg-gray-800 text-gray-300 border border-gray-700 hover:border-orange-500/50 hover:text-orange-400'
          : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-300 hover:text-orange-500';
    }
    
    // Default icon variant
    return bookmarked
      ? isDark
        ? 'text-orange-400 hover:text-orange-300'
        : 'text-orange-500 hover:text-orange-600'
      : isDark
        ? 'text-gray-400 hover:text-orange-400'
        : 'text-gray-500 hover:text-orange-500';
  };

  if (variant === 'button') {
    return (
      <div className="relative">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleClick}
          className={`flex items-center gap-2 ${config.padding} px-4 rounded-xl font-medium transition-all duration-200 ${getVariantStyles()} ${className}`}
          title={bookmarked ? 'Remove from favorites' : 'Add to favorites'}
        >
          <motion.div
            initial={false}
            animate={{ 
              scale: bookmarked ? [1, 1.3, 1] : 1,
              rotate: bookmarked ? [0, -10, 10, 0] : 0
            }}
            transition={{ duration: 0.3 }}
          >
            <Bookmark 
              size={config.icon} 
              fill={bookmarked ? 'currentColor' : 'none'}
            />
          </motion.div>
          <span className={config.text}>
            {bookmarked ? 'Saved' : 'Save'}
          </span>
        </motion.button>
        
        {/* Toast Notification */}
        <AnimatePresence>
          {showToast && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.9 }}
              className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap z-50 ${
                isDark ? 'bg-gray-800 text-white' : 'bg-gray-900 text-white'
              } shadow-lg`}
            >
              <div className="flex items-center gap-1.5">
                <Check size={12} />
                {toastMessage}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Icon or Card variant
  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleClick}
        className={`${config.padding} rounded-xl transition-all duration-200 ${getVariantStyles()} ${className}`}
        title={bookmarked ? 'Remove from favorites' : 'Add to favorites'}
      >
        <motion.div
          initial={false}
          animate={{ 
            scale: bookmarked ? [1, 1.4, 1] : 1,
          }}
          transition={{ duration: 0.3 }}
        >
          <Bookmark 
            size={config.icon} 
            fill={bookmarked ? 'currentColor' : 'none'}
            strokeWidth={bookmarked ? 2.5 : 2}
          />
        </motion.div>
      </motion.button>
      
      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            className={`absolute top-full right-0 mt-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap z-50 ${
              isDark ? 'bg-gray-800 text-white' : 'bg-gray-900 text-white'
            } shadow-lg`}
          >
            <div className="flex items-center gap-1.5">
              <Check size={12} />
              {toastMessage}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BookmarkButton;

