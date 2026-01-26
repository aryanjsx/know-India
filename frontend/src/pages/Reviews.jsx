import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { API_CONFIG } from '../config';
import {
  User,
  Star,
  ThumbsUp,
  ThumbsDown,
  Loader2,
  MapPin,
  LogIn,
  X,
} from 'lucide-react';

const Reviews = () => {
  // SECURITY: Use getAuthHeaders for API calls - JWT is now in HttpOnly cookie
  const { isAuthenticated, getAuthHeaders } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Posts state
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userVotes, setUserVotes] = useState({});
  const [votingInProgress, setVotingInProgress] = useState({});
  
  // Login prompt modal state
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // Track if component is mounted to prevent state updates after unmount
  const isMounted = useRef(true);
  
  // Store getAuthHeaders in ref to avoid dependency issues
  const getAuthHeadersRef = useRef(getAuthHeaders);
  useEffect(() => {
    getAuthHeadersRef.current = getAuthHeaders;
  }, [getAuthHeaders]);

  // Fetch posts and user votes
  useEffect(() => {
    isMounted.current = true;
    
    // SECURITY: Use credentials: 'include' for HttpOnly cookie auth
    // PERFORMANCE: Fetch votes in parallel using Promise.all
    const fetchUserVotes = async (postsData, authHeaders) => {
      const votePromises = postsData.map(async (post) => {
        try {
          const response = await fetch(
            `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PROFILE_POSTS}/${post.id}/vote`,
            {
              headers: authHeaders,
              credentials: 'include',
            }
          );
          const data = await response.json();
          if (response.ok && data.userVote) {
            return { postId: post.id, vote: data.userVote };
          }
          return null;
        } catch (err) {
          console.error('Error fetching vote for post:', post.id, err);
          return null;
        }
      });
      
      const results = await Promise.all(votePromises);
      const votes = {};
      results.forEach((result) => {
        if (result) {
          votes[result.postId] = result.vote;
        }
      });
      return votes;
    };

    const fetchPosts = async () => {
      try {
        // PUBLIC ENDPOINT: Fetch approved journals without authentication
        // This endpoint is public and returns only approved journals
        const response = await fetch(
          `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PROFILE_POSTS}`,
          {
            method: 'GET',
            // Note: credentials: 'include' is safe here - backend doesn't require auth
            // but will use cookie if present for user-specific features
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        // Safe fallback for any error response
        if (!response.ok) {
          console.warn('Failed to fetch reviews, status:', response.status);
          if (isMounted.current) {
            setPosts([]);
          }
          return;
        }

        const data = await response.json();

        if (isMounted.current) {
          // Safe fallback for empty or malformed responses
          const fetchedPosts = Array.isArray(data?.posts) ? data.posts : [];
          setPosts(fetchedPosts);
          
          // Fetch user votes only if authenticated and posts exist
          if (isAuthenticated && fetchedPosts.length > 0) {
            const votes = await fetchUserVotes(fetchedPosts, getAuthHeadersRef.current());
            if (isMounted.current) {
              setUserVotes(votes);
            }
          }
        }
      } catch (err) {
        // Network error or JSON parse error - show empty state gracefully
        console.error('Error fetching posts:', err);
        if (isMounted.current) {
          setPosts([]);
        }
      } finally {
        if (isMounted.current) {
          setIsLoading(false);
        }
      }
    };

    fetchPosts();
    
    // Cleanup: prevent state updates after unmount
    return () => {
      isMounted.current = false;
    };
  }, [isAuthenticated]); // FIXED: Removed getAuthHeaders from dependencies to prevent infinite loop

  // Handle voting - requires authentication
  const handleVote = async (postId, voteType) => {
    // SECURITY: Prompt login if user is not authenticated
    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      return;
    }

    // Prevent rapid clicks
    if (votingInProgress[postId]) {
      return;
    }

    setVotingInProgress(prev => ({ ...prev, [postId]: true }));

    try {
      // SECURITY: Use credentials: 'include' for HttpOnly cookie auth
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PROFILE_POSTS}/${postId}/vote`,
        {
          method: 'POST',
          headers: getAuthHeaders(),
          credentials: 'include',
          body: JSON.stringify({ type: voteType }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        // Update post vote counts
        setPosts(prev => prev.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              upvotes: data.upvotes,
              downvotes: data.downvotes,
            };
          }
          return post;
        }));

        // Update user votes
        setUserVotes(prev => {
          const newVotes = { ...prev };
          if (data.userVote === null) {
            delete newVotes[postId];
          } else {
            newVotes[postId] = data.userVote;
          }
          return newVotes;
        });
      }
    } catch (err) {
      console.error('Error voting:', err);
    } finally {
      setVotingInProgress(prev => ({ ...prev, [postId]: false }));
    }
  };

  // Format date helper
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get display name for post author
  const getPostAuthorName = (post) => {
    if (post.user_name && post.user_name.trim().length > 0) {
      return post.user_name.trim();
    }
    return post.user_email?.split('@')[0] || 'Anonymous';
  };

  return (
    <div className={`min-h-screen pt-24 pb-12 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <h1 className={`text-3xl md:text-4xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Travel Reviews
          </h1>
          <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Discover authentic travel experiences shared by our community
          </p>
        </motion.div>

        {/* Posts List */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 size={48} className="animate-spin text-orange-500 mb-4" />
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              Loading reviews...
            </p>
          </div>
        ) : posts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-center py-20 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
          >
            <MapPin size={64} className={`mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
            <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              No reviews yet
            </h3>
            <p className={`${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
              Be the first to share your travel experience!
            </p>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
              >
                {/* Post Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full overflow-hidden flex items-center justify-center ${
                      isDark ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-100 text-orange-600'
                    }`}>
                      {post.user_avatar ? (
                        <img
                          src={post.user_avatar}
                          alt={getPostAuthorName(post)}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User size={24} />
                      )}
                    </div>
                    <div>
                      <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {getPostAuthorName(post)}
                      </p>
                      <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        {formatDate(post.created_at)}
                      </p>
                    </div>
                  </div>
                  {/* Rating */}
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={16}
                        className={star <= post.rating
                          ? 'text-yellow-400 fill-yellow-400'
                          : isDark ? 'text-gray-700' : 'text-gray-200'
                        }
                      />
                    ))}
                  </div>
                </div>

                {/* Place & State */}
                <div className={`flex items-center gap-2 mb-3 text-sm ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>
                  <MapPin size={16} />
                  <span className="font-medium">{post.place_name}</span>
                  <span className={isDark ? 'text-gray-600' : 'text-gray-400'}>•</span>
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{post.state}</span>
                </div>

                {/* Post Content */}
                <p className={`mb-4 leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {post.content}
                </p>

                {/* Post Images */}
                {post.images && post.images.length > 0 && (
                  <div className="flex gap-2 flex-wrap mb-4">
                    {post.images.map((img, imgIndex) => (
                      <img
                        key={imgIndex}
                        src={img}
                        alt={`${post.place_name} ${imgIndex + 1}`}
                        className="w-28 h-28 rounded-xl object-cover hover:opacity-90 transition-opacity cursor-pointer"
                      />
                    ))}
                  </div>
                )}

                {/* Vote Buttons */}
                <div className={`flex items-center gap-3 pt-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                  <button
                    onClick={() => handleVote(post.id, 'upvote')}
                    disabled={!isAuthenticated || votingInProgress[post.id]}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                      userVotes[post.id] === 'upvote'
                        ? 'bg-green-500/20 text-green-500'
                        : isDark
                          ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-300'
                          : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                    } ${!isAuthenticated || votingInProgress[post.id] ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <ThumbsUp size={18} className={userVotes[post.id] === 'upvote' ? 'fill-current' : ''} />
                    <span className="text-sm font-medium">{post.upvotes || 0}</span>
                  </button>

                  <button
                    onClick={() => handleVote(post.id, 'downvote')}
                    disabled={!isAuthenticated || votingInProgress[post.id]}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                      userVotes[post.id] === 'downvote'
                        ? 'bg-red-500/20 text-red-500'
                        : isDark
                          ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-300'
                          : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                    } ${!isAuthenticated || votingInProgress[post.id] ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <ThumbsDown size={18} className={userVotes[post.id] === 'downvote' ? 'fill-current' : ''} />
                    <span className="text-sm font-medium">{post.downvotes || 0}</span>
                  </button>

                  {!isAuthenticated && (
                    <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      Sign in to vote
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Login Prompt Modal */}
      <AnimatePresence>
        {showLoginPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setShowLoginPrompt(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`relative max-w-md w-full mx-4 p-6 rounded-2xl shadow-2xl ${
                isDark ? 'bg-gray-800' : 'bg-white'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setShowLoginPrompt(false)}
                className={`absolute top-4 right-4 p-1 rounded-full transition-colors ${
                  isDark 
                    ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-200' 
                    : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                }`}
              >
                <X size={20} />
              </button>

              {/* Modal content */}
              <div className="text-center">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                  isDark ? 'bg-orange-500/20' : 'bg-orange-100'
                }`}>
                  <LogIn size={32} className="text-orange-500" />
                </div>
                
                <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Sign in to Vote
                </h3>
                
                <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  You need to be signed in to like or dislike reviews. Join our community to share your travel experiences!
                </p>

                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setShowLoginPrompt(false)}
                    className={`px-5 py-2.5 rounded-xl font-medium transition-colors ${
                      isDark 
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    Cancel
                  </button>
                  <a
                    href={`${API_CONFIG.BASE_URL.replace('/api', '')}/auth/google`}
                    className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium transition-colors inline-flex items-center gap-2"
                  >
                    <LogIn size={18} />
                    Sign in with Google
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Reviews;
