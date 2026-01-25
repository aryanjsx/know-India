import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { API_CONFIG } from '../config';
import {
  User,
  Camera,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle,
  X,
  ArrowLeft,
} from 'lucide-react';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const ProfileSettings = () => {
  // SECURITY: Use getAuthHeaders for API calls - JWT is now in HttpOnly cookie
  const { user, isAuthenticated, updateUser, getAuthHeaders } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Form state
  const [name, setName] = useState('');
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [nameError, setNameError] = useState('');
  const [imageError, setImageError] = useState('');

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
    
    // Fetch current profile data
    // SECURITY: Use credentials: 'include' for HttpOnly cookie auth
    const fetchProfile = async () => {
      try {
        const response = await fetch(
          `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PROFILE_SETTINGS}`,
          {
            headers: getAuthHeaders(),
            credentials: 'include',
          }
        );
        
        const data = await response.json();
        
        if (response.ok && data.user) {
          setName(data.user.name || '');
          setAvatarPreview(data.user.avatar || null);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfile();
  }, [isAuthenticated, getAuthHeaders, navigate]);

  // Handle name change
  const handleNameChange = (e) => {
    const value = e.target.value;
    setName(value);
    setSuccess(false);
    
    if (!value.trim()) {
      setNameError('Name is required');
    } else if (value.trim().length > 100) {
      setNameError('Name must be 100 characters or less');
    } else {
      setNameError('');
    }
  };

  // Handle image selection
  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    setImageError('');
    setSuccess(false);
    
    if (!file) return;
    
    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      setImageError('Only JPG, PNG, and WebP images are allowed');
      return;
    }
    
    // Validate file size
    if (file.size > MAX_IMAGE_SIZE) {
      setImageError('Image size must be 5 MB or less');
      return;
    }
    
    setAvatarFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setAvatarPreview(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  // Remove selected image
  const removeImage = () => {
    setAvatarFile(null);
    setAvatarPreview(user?.avatar || null);
    setImageError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate
    if (!name.trim()) {
      setNameError('Name is required');
      return;
    }
    
    if (nameError || imageError) {
      return;
    }
    
    setIsSaving(true);
    setError('');
    setSuccess(false);
    
    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }
      
      // SECURITY: Use credentials: 'include' for HttpOnly cookie auth
      // Note: Don't set Content-Type for FormData - browser sets it automatically
      const headers = {};
      const authHeaders = getAuthHeaders();
      if (authHeaders['X-CSRF-Token']) {
        headers['X-CSRF-Token'] = authHeaders['X-CSRF-Token'];
      }
      if (authHeaders['Authorization']) {
        headers['Authorization'] = authHeaders['Authorization'];
      }
      
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PROFILE_SETTINGS}`,
        {
          method: 'PUT',
          headers,
          credentials: 'include',
          body: formData,
        }
      );
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        // Update AuthContext with new user data
        updateUser({
          name: data.user.name,
          avatar: data.user.avatar,
        });
        
        setSuccess(true);
        setAvatarFile(null);
        
        // Clear file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        setError(data.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('An error occurred while saving. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const isFormValid = name.trim() && !nameError && !imageError;

  if (isLoading) {
    return (
      <div className={`min-h-screen pt-24 pb-12 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 size={40} className="animate-spin text-orange-500 mb-4" />
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Loading settings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pt-24 pb-12 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate(-1)}
            className={`flex items-center gap-2 mb-4 text-sm font-medium transition-colors ${
              isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <ArrowLeft size={16} />
            Back
          </button>
          <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Profile Settings
          </h1>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Update your profile information
          </p>
        </motion.div>

        {/* Settings Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-6 md:p-8 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
        >
          {/* Success Message */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center gap-3"
              >
                <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
                <span className="text-green-500 text-sm font-medium">
                  Profile updated successfully!
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3"
              >
                <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
                <span className="text-red-500 text-sm font-medium">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar Section */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative">
                <div
                  className={`w-28 h-28 rounded-full overflow-hidden flex items-center justify-center ${
                    isDark ? 'bg-gray-700' : 'bg-gray-100'
                  }`}
                >
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={48} className={isDark ? 'text-gray-500' : 'text-gray-400'} />
                  )}
                </div>
                
                {/* Upload Button */}
                <label
                  className={`absolute bottom-0 right-0 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all ${
                    isDark
                      ? 'bg-orange-500 hover:bg-orange-600 text-white'
                      : 'bg-orange-500 hover:bg-orange-600 text-white'
                  } shadow-lg`}
                >
                  <Camera size={18} />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </label>
                
                {/* Remove Button (if custom avatar selected) */}
                {avatarFile && (
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg transition-colors"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              
              <p className={`mt-3 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Click the camera to upload a new photo
              </p>
              
              {imageError && (
                <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {imageError}
                </p>
              )}
            </div>

            {/* Name Field */}
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
              >
                Display Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={handleNameChange}
                placeholder="Enter your name"
                className={`w-full px-4 py-3 rounded-xl border transition-colors ${
                  nameError
                    ? 'border-red-500 focus:border-red-500'
                    : isDark
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-orange-500'
                      : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-orange-500'
                } focus:outline-none focus:ring-2 focus:ring-orange-500/20`}
              />
              {nameError && (
                <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {nameError}
                </p>
              )}
            </div>

            {/* Email Field (Read-only) */}
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
              >
                Email
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className={`w-full px-4 py-3 rounded-xl border ${
                  isDark
                    ? 'bg-gray-700/50 border-gray-600 text-gray-400'
                    : 'bg-gray-100 border-gray-200 text-gray-500'
                } cursor-not-allowed`}
              />
              <p className={`mt-1 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                Email cannot be changed
              </p>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSaving || !isFormValid}
                className={`flex items-center justify-center gap-2 w-full px-8 py-3 rounded-xl font-medium transition-all ${
                  isFormValid && !isSaving
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:shadow-lg hover:shadow-orange-500/25'
                    : isDark
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isSaving ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfileSettings;

