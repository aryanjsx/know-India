import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Calendar, Wallet, Users, Heart, Loader2, Sparkles,
  Sun, Sunset, Moon, Utensils, Lightbulb, AlertCircle, RefreshCw,
  ChevronDown, Check, X, Navigation, IndianRupee,
  Download, Share2, Copy, Save, CheckCircle, ExternalLink
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { API_CONFIG } from '../config';
import { updateSEO } from '../utils/seo';

// Indian states for dropdown
const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  // Union Territories
  'Andaman and Nicobar Islands', 'Chandigarh', 'Delhi',
  'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
];

const BUDGET_OPTIONS = [
  { value: 'low', label: 'Budget-Friendly', icon: '💰', desc: '₹1,000-3,000/day' },
  { value: 'medium', label: 'Moderate', icon: '💎', desc: '₹3,000-8,000/day' },
  { value: 'high', label: 'Luxury', icon: '👑', desc: '₹8,000+/day' },
];

const TRAVEL_TYPES = [
  { value: 'solo', label: 'Solo', icon: '🧳' },
  { value: 'couple', label: 'Couple', icon: '💑' },
  { value: 'family', label: 'Family', icon: '👨‍👩‍👧‍👦' },
  { value: 'friends', label: 'Friends', icon: '👥' },
];

const INTERESTS = [
  { value: 'beach', label: 'Beaches', icon: '🏖️' },
  { value: 'temple', label: 'Temples', icon: '🛕' },
  { value: 'heritage', label: 'Heritage', icon: '🏛️' },
  { value: 'hill', label: 'Hill Stations', icon: '⛰️' },
  { value: 'wildlife', label: 'Wildlife', icon: '🦁' },
  { value: 'nature', label: 'Nature', icon: '🌿' },
  { value: 'adventure', label: 'Adventure', icon: '🎯' },
  { value: 'culture', label: 'Culture', icon: '🎭' },
  { value: 'spiritual', label: 'Spiritual', icon: '🙏' },
  { value: 'food', label: 'Food', icon: '🍛' },
];

const ItineraryPlanner = () => {
  const { theme } = useTheme();
  const { isAuthenticated, token } = useAuth();
  const isDark = theme === 'dark';

  // Form state
  const [formData, setFormData] = useState({
    destination: '',
    days: 3,
    budget: 'medium',
    travelType: 'couple',
    interests: ['heritage', 'nature'],
  });

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [showDestinationDropdown, setShowDestinationDropdown] = useState(false);
  const [destinationSearch, setDestinationSearch] = useState('');

  // Save state
  const [isSaving, setIsSaving] = useState(false);
  const [savedId, setSavedId] = useState(null);
  const [shareUrl, setShareUrl] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  // SEO
  useEffect(() => {
    updateSEO({
      title: 'AI Trip Planner - Know India',
      description: 'Plan your perfect India trip with AI. Get personalized day-wise itineraries based on your interests, budget, and travel style.',
      keywords: 'AI trip planner, India travel planner, itinerary generator, travel planning',
    });
  }, []);

  // Filter destinations based on search
  const filteredDestinations = INDIAN_STATES.filter(state =>
    state.toLowerCase().includes(destinationSearch.toLowerCase())
  );

  // Handle interest toggle
  const toggleInterest = (interest) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  // Save itinerary to database
  const handleSave = async () => {
    if (!result) return;

    setIsSaving(true);
    try {
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (isAuthenticated && token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ITINERARY}/save`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          destination: result.destination,
          days: result.days,
          budget: formData.budget,
          travelType: formData.travelType,
          interests: formData.interests,
          query: result.query,
          matchedPlaces: result.matchedPlaces,
          stateInfo: result.stateInfo,
          itinerary: result.itinerary,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save itinerary');
      }

      setSavedId(data.id);
      setShareUrl(data.shareUrl);
    } catch (err) {
      console.error('Error saving itinerary:', err);
      setError('Failed to save itinerary. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Copy share URL to clipboard
  const handleCopyUrl = async () => {
    if (!shareUrl) return;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Handle share button click
  const handleShare = async () => {
    if (!savedId) {
      // Save first if not saved
      await handleSave();
    }
    setShowShareModal(true);
  };

  // Download PDF
  const handleDownloadPdf = async () => {
    if (!savedId) {
      // Save first if not saved
      await handleSave();
    }

    const itineraryId = savedId || result?.id;
    if (!itineraryId) {
      setError('Please save the itinerary first to download PDF.');
      return;
    }

    setIsDownloading(true);
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ITINERARY}/${itineraryId}/pdf`);
      
      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${result.destination.replace(/\s+/g, '_')}_${result.days}day_itinerary.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error downloading PDF:', err);
      setError('Failed to download PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.destination) {
      setError('Please select a destination');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);
    setSavedId(null);
    setShareUrl(null);

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ITINERARY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to generate itinerary');
      }

      setResult(data);
    } catch (err) {
      console.error('Error generating itinerary:', err);
      setError(err.message || 'Failed to generate itinerary. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form
  const handleReset = () => {
    setResult(null);
    setError(null);
    setSavedId(null);
    setShareUrl(null);
    setCopied(false);
    setShowShareModal(false);
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-950' : 'bg-gradient-to-br from-orange-50 via-amber-50/50 to-white'}`}>
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {isDark ? (
          <>
            <div className="absolute top-20 -left-32 w-96 h-96 rounded-full blur-3xl opacity-20 bg-orange-600" />
            <div className="absolute bottom-20 -right-32 w-96 h-96 rounded-full blur-3xl opacity-20 bg-purple-600" />
          </>
        ) : (
          <>
            <motion.div
              animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
              transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-20 left-10 w-96 h-96 rounded-full bg-gradient-to-br from-orange-200/60 to-amber-200/50 blur-3xl"
            />
            <motion.div
              animate={{ x: [0, -40, 0], y: [0, 30, 0] }}
              transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
              className="absolute bottom-20 right-0 w-[500px] h-[500px] rounded-full bg-gradient-to-bl from-purple-200/40 to-pink-200/30 blur-3xl"
            />
          </>
        )}
      </div>

      {/* Header */}
      <section className="relative pt-24 pb-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-3 mb-4"
          >
            <div className={`p-3 rounded-2xl ${isDark ? 'bg-gradient-to-br from-orange-500/20 to-purple-500/20' : 'bg-gradient-to-br from-orange-100 to-purple-100'}`}>
              <Sparkles className={`w-8 h-8 ${isDark ? 'text-orange-400' : 'text-orange-600'}`} />
            </div>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`text-3xl md:text-5xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}
          >
            AI Trip{' '}
            <span className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 bg-clip-text text-transparent">
              Planner
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`text-lg max-w-2xl mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
          >
            Let AI craft your perfect Indian adventure. Tell us your preferences and get a personalized day-wise itinerary.
          </motion.p>
        </div>
      </section>

      {/* Main Content */}
      <section className="relative px-4 pb-16">
        <div className="max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            {!result ? (
              // Form
              <motion.form
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                onSubmit={handleSubmit}
                className={`rounded-3xl p-6 md:p-8 ${isDark ? 'bg-gray-900/80 border border-gray-800' : 'bg-white/80 backdrop-blur-sm shadow-xl border border-gray-100'}`}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Destination */}
                  <div className="md:col-span-2">
                    <label className={`flex items-center gap-2 text-sm font-semibold mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      <MapPin size={16} className="text-orange-500" />
                      Destination
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowDestinationDropdown(!showDestinationDropdown)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
                          isDark
                            ? 'bg-gray-800 border-gray-700 text-white hover:border-orange-500/50'
                            : 'bg-white border-gray-200 text-gray-900 hover:border-orange-300'
                        } ${showDestinationDropdown ? (isDark ? 'border-orange-500' : 'border-orange-400') : ''}`}
                      >
                        <span className={formData.destination ? '' : (isDark ? 'text-gray-500' : 'text-gray-400')}>
                          {formData.destination || 'Select a state or UT'}
                        </span>
                        <ChevronDown size={20} className={`transition-transform ${showDestinationDropdown ? 'rotate-180' : ''}`} />
                      </button>

                      <AnimatePresence>
                        {showDestinationDropdown && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className={`absolute z-50 w-full mt-2 rounded-xl border shadow-xl overflow-hidden ${
                              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                            }`}
                          >
                            <div className="p-2">
                              <input
                                type="text"
                                placeholder="Search..."
                                value={destinationSearch}
                                onChange={(e) => setDestinationSearch(e.target.value)}
                                className={`w-full px-3 py-2 rounded-lg text-sm ${
                                  isDark ? 'bg-gray-700 text-white placeholder-gray-400' : 'bg-gray-100 text-gray-900 placeholder-gray-500'
                                }`}
                              />
                            </div>
                            <div className="max-h-60 overflow-y-auto">
                              {filteredDestinations.map(state => (
                                <button
                                  key={state}
                                  type="button"
                                  onClick={() => {
                                    setFormData(prev => ({ ...prev, destination: state }));
                                    setShowDestinationDropdown(false);
                                    setDestinationSearch('');
                                  }}
                                  className={`w-full flex items-center gap-2 px-4 py-2.5 text-left transition-colors ${
                                    formData.destination === state
                                      ? (isDark ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-50 text-orange-600')
                                      : (isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-50 text-gray-700')
                                  }`}
                                >
                                  {formData.destination === state && <Check size={16} />}
                                  {state}
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Days */}
                  <div>
                    <label className={`flex items-center gap-2 text-sm font-semibold mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      <Calendar size={16} className="text-blue-500" />
                      Number of Days
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={formData.days}
                      onChange={(e) => setFormData(prev => ({ ...prev, days: parseInt(e.target.value) || 1 }))}
                      className={`w-full px-4 py-3 rounded-xl border transition-all ${
                        isDark
                          ? 'bg-gray-800 border-gray-700 text-white focus:border-orange-500'
                          : 'bg-white border-gray-200 text-gray-900 focus:border-orange-400'
                      }`}
                    />
                  </div>

                  {/* Budget */}
                  <div>
                    <label className={`flex items-center gap-2 text-sm font-semibold mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      <Wallet size={16} className="text-green-500" />
                      Budget
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {BUDGET_OPTIONS.map(option => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, budget: option.value }))}
                          className={`p-3 rounded-xl border text-center transition-all ${
                            formData.budget === option.value
                              ? (isDark ? 'bg-orange-500/20 border-orange-500 text-orange-400' : 'bg-orange-50 border-orange-400 text-orange-600')
                              : (isDark ? 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300')
                          }`}
                        >
                          <div className="text-xl mb-1">{option.icon}</div>
                          <div className="text-xs font-medium">{option.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Travel Type */}
                  <div className="md:col-span-2">
                    <label className={`flex items-center gap-2 text-sm font-semibold mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      <Users size={16} className="text-purple-500" />
                      Travel Type
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {TRAVEL_TYPES.map(option => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, travelType: option.value }))}
                          className={`p-3 rounded-xl border text-center transition-all ${
                            formData.travelType === option.value
                              ? (isDark ? 'bg-purple-500/20 border-purple-500 text-purple-400' : 'bg-purple-50 border-purple-400 text-purple-600')
                              : (isDark ? 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300')
                          }`}
                        >
                          <div className="text-xl mb-1">{option.icon}</div>
                          <div className="text-xs font-medium">{option.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Interests */}
                  <div className="md:col-span-2">
                    <label className={`flex items-center gap-2 text-sm font-semibold mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      <Heart size={16} className="text-pink-500" />
                      Interests
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {INTERESTS.map(interest => (
                        <button
                          key={interest.value}
                          type="button"
                          onClick={() => toggleInterest(interest.value)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${
                            formData.interests.includes(interest.value)
                              ? (isDark ? 'bg-pink-500/20 border-pink-500 text-pink-400' : 'bg-pink-50 border-pink-400 text-pink-600')
                              : (isDark ? 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300')
                          }`}
                        >
                          <span>{interest.icon}</span>
                          <span className="text-sm font-medium">{interest.label}</span>
                          {formData.interests.includes(interest.value) && <Check size={14} />}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`mt-6 p-4 rounded-xl flex items-center gap-3 ${
                        isDark ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-red-50 border border-red-100 text-red-600'
                      }`}
                    >
                      <AlertCircle size={20} />
                      <span>{error}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={isLoading || !formData.destination}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`mt-8 w-full py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-3 ${
                    isLoading || !formData.destination
                      ? 'bg-gray-400 cursor-not-allowed text-gray-200'
                      : 'bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 text-white shadow-lg hover:shadow-xl hover:shadow-orange-500/25'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={24} className="animate-spin" />
                      Planning your trip...
                    </>
                  ) : (
                    <>
                      <Sparkles size={24} />
                      Generate Itinerary
                    </>
                  )}
                </motion.button>
              </motion.form>
            ) : (
              // Results
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {/* Results Header */}
                <div className={`rounded-3xl p-6 md:p-8 mb-6 ${isDark ? 'bg-gray-900/80 border border-gray-800' : 'bg-white/80 backdrop-blur-sm shadow-xl border border-gray-100'}`}>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h2 className={`text-2xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Your {result.destination} Adventure
                      </h2>
                      <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {result.days} days • {formData.travelType} trip • {formData.budget} budget
                      </p>
                    </div>
                    <button
                      onClick={handleReset}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                        isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <RefreshCw size={18} />
                      Plan Another Trip
                    </button>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-6 flex flex-wrap gap-3">
                    {/* Save Trip Button */}
                    {!savedId ? (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSave}
                        disabled={isSaving}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${
                          isDark
                            ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:shadow-lg hover:shadow-orange-500/25'
                            : 'bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:shadow-lg hover:shadow-orange-500/25'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {isSaving ? (
                          <>
                            <Loader2 size={18} className="animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save size={18} />
                            Save Trip
                          </>
                        )}
                      </motion.button>
                    ) : (
                      <div className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium ${
                        isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700'
                      }`}>
                        <CheckCircle size={18} />
                        Saved!
                      </div>
                    )}

                    {/* Share Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleShare}
                      disabled={isSaving}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${
                        isDark
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30'
                          : 'bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <Share2 size={18} />
                      Share
                    </motion.button>

                    {/* Download PDF Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleDownloadPdf}
                      disabled={isDownloading || isSaving}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${
                        isDark
                          ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30 hover:bg-purple-500/30'
                          : 'bg-purple-50 text-purple-600 border border-purple-200 hover:bg-purple-100'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {isDownloading ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Download size={18} />
                          Download PDF
                        </>
                      )}
                    </motion.button>
                  </div>

                  {/* Matched Places */}
                  {result.matchedPlaces && result.matchedPlaces.length > 0 && (
                    <div className="mt-6">
                      <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        AI-Matched Places for You
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {result.matchedPlaces.slice(0, 8).map((place, idx) => (
                          <span
                            key={idx}
                            className={`px-3 py-1.5 rounded-full text-sm ${
                              isDark ? 'bg-orange-500/10 text-orange-400' : 'bg-orange-100 text-orange-700'
                            }`}
                          >
                            {place.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Day-wise Itinerary */}
                <div className="space-y-6">
                  {result.itinerary?.itinerary?.map((day, dayIndex) => (
                    <motion.div
                      key={day.day || dayIndex}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: dayIndex * 0.1 }}
                      className={`rounded-3xl overflow-hidden ${isDark ? 'bg-gray-900/80 border border-gray-800' : 'bg-white/80 backdrop-blur-sm shadow-xl border border-gray-100'}`}
                    >
                      {/* Day Header */}
                      <div className={`px-6 py-4 ${isDark ? 'bg-gradient-to-r from-orange-500/10 to-purple-500/10' : 'bg-gradient-to-r from-orange-50 to-purple-50'}`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                            isDark ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-100 text-orange-600'
                          }`}>
                            {day.day || dayIndex + 1}
                          </div>
                          <div>
                            <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              Day {day.day || dayIndex + 1}
                            </h3>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              {day.title || 'Exploration Day'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Activities */}
                      <div className="p-6">
                        <div className="space-y-4">
                          {day.activities?.map((activity, actIndex) => (
                            <div key={actIndex} className="flex gap-4">
                              <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                                activity.time?.toLowerCase().includes('morning')
                                  ? (isDark ? 'bg-yellow-500/10 text-yellow-400' : 'bg-yellow-100 text-yellow-600')
                                  : activity.time?.toLowerCase().includes('afternoon')
                                    ? (isDark ? 'bg-orange-500/10 text-orange-400' : 'bg-orange-100 text-orange-600')
                                    : (isDark ? 'bg-purple-500/10 text-purple-400' : 'bg-purple-100 text-purple-600')
                              }`}>
                                {activity.time?.toLowerCase().includes('morning') ? <Sun size={18} /> :
                                 activity.time?.toLowerCase().includes('afternoon') ? <Sunset size={18} /> :
                                 <Moon size={18} />}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                                    isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-500'
                                  }`}>
                                    {activity.time}
                                  </span>
                                  {activity.estimatedCost && (
                                    <span className={`text-xs flex items-center gap-1 ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                                      <IndianRupee size={12} />
                                      {activity.estimatedCost}
                                    </span>
                                  )}
                                </div>
                                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                  {activity.activity}
                                </p>
                                {activity.place && (
                                  <p className={`text-sm flex items-center gap-1 mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    <Navigation size={12} />
                                    {activity.place}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Meals */}
                        {day.meals && (
                          <div className={`mt-6 pt-6 border-t ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
                            <div className="flex items-center gap-2 mb-3">
                              <Utensils size={16} className={isDark ? 'text-orange-400' : 'text-orange-500'} />
                              <span className={`font-semibold text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                Food Recommendations
                              </span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              {Object.entries(day.meals).map(([meal, recommendation]) => (
                                <div key={meal} className={`p-3 rounded-xl ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                                  <div className={`text-xs font-medium uppercase mb-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                    {meal}
                                  </div>
                                  <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                    {recommendation}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Daily Tip */}
                        {day.tip && (
                          <div className={`mt-4 p-4 rounded-xl flex items-start gap-3 ${
                            isDark ? 'bg-blue-500/10' : 'bg-blue-50'
                          }`}>
                            <Lightbulb size={18} className={isDark ? 'text-blue-400' : 'text-blue-500'} />
                            <p className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                              {day.tip}
                            </p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* General Tips */}
                {result.itinerary?.generalTips && result.itinerary.generalTips.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className={`mt-6 rounded-3xl p-6 ${isDark ? 'bg-gray-900/80 border border-gray-800' : 'bg-white/80 backdrop-blur-sm shadow-xl border border-gray-100'}`}
                  >
                    <h3 className={`font-bold text-lg mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      <Lightbulb className="text-yellow-500" />
                      Travel Tips
                    </h3>
                    <ul className="space-y-2">
                      {result.itinerary.generalTips.map((tip, idx) => (
                        <li key={idx} className={`flex items-start gap-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          <Check size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                    {result.itinerary?.totalEstimatedBudget && (
                      <div className={`mt-4 pt-4 border-t ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
                        <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          Estimated Total Budget: <span className="text-green-500">{result.itinerary.totalEstimatedBudget}</span>
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Raw Response Fallback */}
                {result.itinerary?.rawResponse && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-6 rounded-3xl p-6 ${isDark ? 'bg-gray-900/80 border border-gray-800' : 'bg-white/80 backdrop-blur-sm shadow-xl border border-gray-100'}`}
                  >
                    <h3 className={`font-bold text-lg mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      AI Response
                    </h3>
                    <pre className={`whitespace-pre-wrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {result.itinerary.rawResponse}
                    </pre>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && shareUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setShowShareModal(false)}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            
            {/* Modal */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`relative w-full max-w-md rounded-3xl p-6 ${
                isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white shadow-2xl'
              }`}
            >
              {/* Close Button */}
              <button
                onClick={() => setShowShareModal(false)}
                className={`absolute top-4 right-4 p-2 rounded-xl transition-colors ${
                  isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
                }`}
              >
                <X size={20} />
              </button>

              {/* Modal Header */}
              <div className="text-center mb-6">
                <div className={`w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center ${
                  isDark ? 'bg-blue-500/20' : 'bg-blue-100'
                }`}>
                  <Share2 size={32} className={isDark ? 'text-blue-400' : 'text-blue-600'} />
                </div>
                <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Share Your Itinerary
                </h3>
                <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Share your {result?.destination} trip with friends and family
                </p>
              </div>

              {/* Share Link */}
              <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <p className={`text-xs font-semibold mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Shareable Link
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    className={`flex-1 px-3 py-2.5 rounded-lg text-sm ${
                      isDark ? 'bg-gray-900 text-gray-300 border border-gray-700' : 'bg-white text-gray-700 border border-gray-200'
                    }`}
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCopyUrl}
                    className={`p-2.5 rounded-lg transition-colors ${
                      copied
                        ? (isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600')
                        : (isDark ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30' : 'bg-blue-100 text-blue-600 hover:bg-blue-200')
                    }`}
                  >
                    {copied ? <Check size={20} /> : <Copy size={20} />}
                  </motion.button>
                </div>
                {copied && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`text-xs mt-2 ${isDark ? 'text-green-400' : 'text-green-600'}`}
                  >
                    ✓ Link copied to clipboard!
                  </motion.p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex gap-3">
                <a
                  href={shareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${
                    isDark
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <ExternalLink size={18} />
                  Open Link
                </a>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCopyUrl}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                >
                  <Copy size={18} />
                  {copied ? 'Copied!' : 'Copy Link'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ItineraryPlanner;
