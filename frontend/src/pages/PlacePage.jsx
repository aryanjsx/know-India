import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from "../context/ThemeContext";
import { API_CONFIG, getApiUrl } from '../config';
import { 
  MapPin, ArrowLeft, ChevronLeft, ChevronRight, 
  Play, Pause, Camera, Navigation, Info, Clock, 
  Ticket, Sparkles, Star, 
  Calendar, Users, Share2, Bookmark, X
} from "lucide-react";

const PlacePage = () => {
  const { stateName, placeSlug } = useParams();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showAllImages, setShowAllImages] = useState(false);
  const [showCopied, setShowCopied] = useState(false);
  const timerRef = useRef(null);

  // Share functionality
  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareTitle = place?.name ? `${place.name} - Know India` : 'Know India';
    const shareText = place?.description 
      ? `Discover ${place.name}: ${place.description.substring(0, 100)}...`
      : `Explore amazing places in India!`;

    // Check if Web Share API is available (mainly mobile devices)
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled or share failed - fallback to copy
        if (err.name !== 'AbortError') {
          copyToClipboard(shareUrl);
        }
      }
    } else {
      // Fallback: Copy URL to clipboard
      copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    }
  };

  const displayStateName = stateName.split("-").map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(" ");

  useEffect(() => {
    const fetchPlace = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Pass the state name as-is (with dashes) - backend will handle formatting
        const apiUrl = getApiUrl(`${API_CONFIG.ENDPOINTS.STATE_PLACE}/${stateName}/place/${placeSlug}`);
        console.log('Fetching place from:', apiUrl);
        
        const response = await fetch(apiUrl);
        const data = await response.json();
        console.log('API Response:', response.status, data);
        
        // Check if API returned an error
        if (!response.ok || data.error) {
          const errorMsg = data.details || data.error || `HTTP error! status: ${response.status}`;
          console.error('API Error:', errorMsg);
          setError(errorMsg);
          setPlace(null);
          return;
        }
        
        if (!data || !data.name) {
          setError('Invalid place data received');
          setPlace(null);
          return;
        }

        if (!Array.isArray(data.images)) {
          data.images = [data.images].filter(Boolean);
        }

        setPlace(data);
        setError(null);
        setCurrentImageIndex(0);
      } catch (err) {
        console.error('Error fetching place:', err);
        setError(err.message || 'Failed to fetch place data');
        setPlace(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPlace();
  }, [stateName, placeSlug]);

  useEffect(() => {
    if (place?.images?.length > 1 && isPlaying) {
      timerRef.current = setInterval(() => {
    setCurrentImageIndex((prev) => (prev + 1) % place.images.length);
      }, 4000);
    }
    return () => clearInterval(timerRef.current);
  }, [place, isPlaying]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (place?.images?.length > 1) {
        if (e.key === 'ArrowLeft') {
          setCurrentImageIndex((prev) => (prev - 1 + place.images.length) % place.images.length);
        } else if (e.key === 'ArrowRight') {
          setCurrentImageIndex((prev) => (prev + 1) % place.images.length);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [place?.images?.length]);

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-950' : 'bg-gradient-to-br from-amber-100 via-orange-50 to-rose-50'}`}>
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className={`absolute inset-0 rounded-full border-4 ${isDark ? 'border-orange-500/20 border-t-orange-500' : 'border-orange-200 border-t-orange-500'}`}
            />
            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center">
              <Camera className="text-white" size={24} />
            </div>
          </div>
          <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Loading destination...</h2>
        </div>
      </div>
    );
  }

  if (!place) {
    return (
      <div className={`min-h-screen flex items-center justify-center px-4 ${isDark ? 'bg-gray-950' : 'bg-gradient-to-br from-amber-100 via-orange-50 to-rose-50'}`}>
        <div className="text-center max-w-md">
          <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${isDark ? 'bg-gray-800' : 'bg-orange-100'}`}>
            <MapPin className={isDark ? 'text-gray-600' : 'text-orange-400'} size={32} />
          </div>
          <h1 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Place not found</h1>
          <p className={`mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>We couldn't find this destination</p>
          {error && (
            <p className={`mb-4 text-sm p-3 rounded-lg ${isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-50 text-red-600'}`}>
              {error}
            </p>
          )}
          <p className={`mb-6 text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            State: {stateName} | Place ID: {placeSlug}
          </p>
          <Link 
            to={`/places/${stateName}`} 
            className="px-6 py-3 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium"
          >
            Back to {displayStateName}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen relative ${isDark ? 'bg-gray-950' : 'bg-gradient-to-br from-amber-100 via-orange-50 to-rose-50'}`}>
      
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {isDark ? (
          <>
            {/* Dark theme - Glowing orbs */}
            <div className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full bg-orange-600/20 blur-[120px]" />
            <div className="absolute top-1/3 right-0 w-[500px] h-[500px] rounded-full bg-amber-600/15 blur-[100px]" />
            <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] rounded-full bg-orange-500/10 blur-[80px]" />
            <div className="absolute top-1/2 left-1/4 w-[300px] h-[300px] rounded-full bg-yellow-500/10 blur-[60px]" />
            
            {/* Subtle grid pattern */}
            <div 
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                backgroundSize: '50px 50px'
              }}
            />
          </>
        ) : (
          <>
            {/* Light theme - Vibrant animated orbs */}
            <motion.div
              animate={{ 
                x: [0, 40, 0], 
                y: [0, -30, 0], 
                scale: [1, 1.15, 1] 
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-20 -left-20 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-orange-300/60 to-amber-300/50 blur-3xl"
            />
            <motion.div
              animate={{ 
                x: [0, -50, 0], 
                y: [0, 40, 0], 
                scale: [1, 1.2, 1] 
              }}
              transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 3 }}
              className="absolute top-1/4 -right-32 w-[700px] h-[700px] rounded-full bg-gradient-to-bl from-rose-200/60 to-orange-200/50 blur-3xl"
            />
            <motion.div
              animate={{ 
                x: [0, 30, 0], 
                y: [0, -40, 0] 
              }}
              transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 5 }}
              className="absolute bottom-0 left-1/4 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-yellow-200/50 to-orange-200/40 blur-3xl"
            />
            <motion.div
              animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.6, 0.4] }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-1/2 right-1/4 w-[300px] h-[300px] rounded-full bg-gradient-to-br from-rose-300/40 to-amber-200/30 blur-2xl"
            />
            
            {/* Decorative elements */}
            <div className="absolute top-40 right-20 w-40 h-40 border-2 border-orange-300/40 rounded-full" />
            <div className="absolute bottom-60 left-16 w-28 h-28 border-2 border-amber-300/50 rotate-45" />
            <div className="absolute top-1/3 left-1/2 w-20 h-20 border border-orange-400/30 rounded-full" />
            
            {/* Dot pattern */}
            <div 
              className="absolute inset-0 opacity-[0.5]"
              style={{
                backgroundImage: `radial-gradient(circle, rgba(234, 88, 12, 0.12) 1.5px, transparent 1.5px)`,
                backgroundSize: '28px 28px'
              }}
            />
          </>
        )}
      </div>

      {/* Hero Image Section */}
      <section className="relative h-[55vh] md:h-[65vh] w-full overflow-hidden">
        {place.images?.length > 0 ? (
          <>
            <AnimatePresence mode="wait">
              <motion.img
                key={currentImageIndex}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              src={place.images[currentImageIndex]}
                alt={place.name}
              className="w-full h-full object-cover"
            />
            </AnimatePresence>
            
            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/40" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent" />
            
            {/* Top Navigation Bar */}
            <div className="absolute top-0 left-0 right-0 pt-20 px-4 md:px-8 z-20">
              <div className="max-w-7xl mx-auto flex items-center justify-between">
                <Link 
                  to={`/places/${stateName}`} 
                  className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-black/30 backdrop-blur-md text-white hover:bg-black/50 transition-colors"
                >
                  <ArrowLeft size={18} />
                  <span className="hidden sm:inline font-medium">{displayStateName}</span>
                </Link>
                
                <div className="flex items-center gap-2 relative">
                  <button 
                    onClick={handleShare}
                    className="p-2.5 rounded-full bg-black/30 backdrop-blur-md text-white hover:bg-black/50 transition-colors"
                    title="Share this place"
                  >
                    <Share2 size={18} />
                  </button>
                  
                  {/* Copied notification */}
                  <AnimatePresence>
                    {showCopied && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.9 }}
                        className="absolute top-full right-0 mt-2 px-3 py-1.5 bg-green-500 text-white text-sm font-medium rounded-lg shadow-lg whitespace-nowrap"
                      >
                        ✓ Link copied!
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  <button className="p-2.5 rounded-full bg-black/30 backdrop-blur-md text-white hover:bg-black/50 transition-colors">
                    <Bookmark size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* Image Thumbnails & Controls */}
            {place.images.length > 1 && (
              <div className="absolute bottom-24 sm:bottom-28 left-3 right-3 sm:left-4 sm:right-4 md:left-8 md:right-8 z-20 flex items-end justify-between gap-2">
                {/* Thumbnails - hidden on very small screens */}
                <div className="hidden xs:flex gap-1.5 sm:gap-2">
                  {place.images.slice(0, 4).map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-lg sm:rounded-xl overflow-hidden border-2 transition-all ${
                        idx === currentImageIndex 
                          ? 'border-white scale-105 shadow-xl' 
                          : 'border-white/30 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                  {place.images.length > 4 && (
                    <button 
                      onClick={() => setShowAllImages(true)}
                      className="w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-lg sm:rounded-xl bg-black/50 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center text-white text-xs sm:text-base font-bold hover:bg-black/70 transition-colors"
                    >
                      +{place.images.length - 4}
                    </button>
                  )}
                </div>

                {/* Controls */}
                <div className="flex items-center gap-1.5 sm:gap-2 ml-auto xs:ml-0">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-2 sm:p-3 rounded-full bg-black/30 backdrop-blur-md text-white hover:bg-black/50 transition-colors"
                  >
                    {isPlaying ? <Pause size={16} className="sm:w-[18px] sm:h-[18px]" /> : <Play size={16} className="sm:w-[18px] sm:h-[18px]" />}
                  </button>
                  <div className="flex items-center gap-0.5 sm:gap-1 px-2 sm:px-3 py-1.5 sm:py-2 rounded-full bg-black/30 backdrop-blur-md text-white">
                  <button
                      onClick={() => setCurrentImageIndex((prev) => (prev - 1 + place.images.length) % place.images.length)}
                      className="p-0.5 sm:p-1 hover:bg-white/20 rounded-full transition-colors"
                  >
                      <ChevronLeft size={16} className="sm:w-[18px] sm:h-[18px]" />
                  </button>
                    <span className="text-xs sm:text-sm font-medium min-w-[40px] sm:min-w-[50px] text-center">
                      {currentImageIndex + 1} / {place.images.length}
                    </span>
                    <button
                      onClick={() => setCurrentImageIndex((prev) => (prev + 1) % place.images.length)}
                      className="p-0.5 sm:p-1 hover:bg-white/20 rounded-full transition-colors"
                    >
                      <ChevronRight size={16} className="sm:w-[18px] sm:h-[18px]" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Hero Content */}
            <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 md:p-8 z-10">
              <div className="max-w-7xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <span className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-semibold bg-gradient-to-r from-orange-500 to-amber-500 text-white mb-2 sm:mb-3 shadow-lg">
                    <Sparkles size={10} className="sm:w-3 sm:h-3" />
                    {place.category_name}
                  </span>
                  
                  <h1 className="text-xl sm:text-3xl md:text-5xl lg:text-6xl font-black text-white mb-1 sm:mb-2 drop-shadow-lg leading-tight">
                    {place.name}
                  </h1>
                  
                  <p className="flex items-center gap-1.5 sm:gap-2 text-white/90 text-sm sm:text-lg">
                    <MapPin size={14} className="sm:w-[18px] sm:h-[18px]" />
                    {place.city}, {place.state}
                  </p>
                </motion.div>
              </div>
            </div>
          </>
        ) : (
          <div className={`w-full h-full flex flex-col items-center justify-center ${isDark ? 'bg-gray-800' : 'bg-gradient-to-br from-orange-200 to-amber-200'}`}>
            <Camera className="text-white/50" size={64} />
            <span className="mt-4 text-white/70 text-lg">No images available</span>
          </div>
        )}
      </section>

      {/* Main Content */}
      <section className="relative z-10 px-3 sm:px-4 md:px-8 py-6 sm:py-8 md:py-12">
        <div className="max-w-6xl mx-auto">
          
          {/* Quick Stats Row */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 md:gap-4 -mt-8 sm:-mt-12 md:-mt-16 mb-6 sm:mb-10 relative z-20"
          >
            {[
              { icon: Star, label: 'Rating', value: '4.8', color: 'yellow' },
              { icon: Users, label: 'Visitors', value: '10K+/month', color: 'blue' },
              { icon: Clock, label: 'Timings', value: place.timing || 'All Day', color: 'green' },
              { icon: Ticket, label: 'Entry', value: place.entry_fee || 'Free', color: 'purple' },
            ].map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * idx }}
                className={`p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl border backdrop-blur-sm ${
                  isDark 
                    ? 'bg-gray-800/90 border-gray-700' 
                    : 'bg-white border-orange-100 shadow-lg shadow-orange-200/40'
                }`}
              >
                <stat.icon className={`w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 mb-1.5 sm:mb-2 ${
                  stat.color === 'yellow' ? 'text-yellow-500' :
                  stat.color === 'blue' ? 'text-blue-500' :
                  stat.color === 'green' ? 'text-green-500' : 'text-purple-500'
                }`} />
                <p className={`text-[10px] sm:text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{stat.label}</p>
                <p className={`font-bold text-xs sm:text-sm md:text-base truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{stat.value}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* About Section - Full Width */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`p-6 md:p-8 rounded-3xl border mb-6 ${
              isDark 
                ? 'bg-gray-800/70 border-gray-700/50 backdrop-blur-sm' 
                : 'bg-white border-orange-100 shadow-xl shadow-orange-200/30 backdrop-blur-sm'
            }`}
          >
            <div className="flex items-center gap-3 mb-5">
              <div className={`p-3 rounded-2xl ${isDark ? 'bg-orange-500/20' : 'bg-gradient-to-br from-orange-100 to-amber-100'}`}>
                <Info className={isDark ? 'text-orange-400' : 'text-orange-600'} size={22} />
              </div>
              <h2 className={`text-xl md:text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                About This Place
              </h2>
          </div>

            <p className={`leading-relaxed text-base md:text-lg mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              {place.description}
            </p>
            
            {place.address && (
              <div className={`p-4 md:p-5 rounded-2xl flex items-start gap-4 ${
                isDark ? 'bg-gray-700/50' : 'bg-gradient-to-r from-orange-50 to-amber-50'
              }`}>
                <div className={`p-2.5 rounded-xl flex-shrink-0 ${isDark ? 'bg-orange-500/20' : 'bg-white shadow-sm'}`}>
                  <MapPin className={isDark ? 'text-orange-400' : 'text-orange-600'} size={20} />
                </div>
                <div>
                  <h4 className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>Address</h4>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{place.address}</p>
          </div>
        </div>
            )}
          </motion.div>

        {/* Key Information Section */}
          {place.keyInformation?.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`p-6 md:p-8 rounded-3xl border mb-6 ${
                isDark 
                  ? 'bg-gray-800/70 border-gray-700/50 backdrop-blur-sm' 
                  : 'bg-white border-orange-100 shadow-xl shadow-orange-200/30 backdrop-blur-sm'
              }`}
            >
                <div className="flex items-center gap-3 mb-6">
                  <div className={`p-3 rounded-2xl ${isDark ? 'bg-blue-500/20' : 'bg-gradient-to-br from-blue-100 to-cyan-100'}`}>
                    <Calendar className={isDark ? 'text-blue-400' : 'text-blue-600'} size={22} />
                  </div>
                  <h2 className={`text-xl md:text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Key Information
                  </h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {place.keyInformation.map((info, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.05 }}
                      className={`p-4 rounded-2xl ${isDark ? 'bg-gray-700/50' : 'bg-gray-50/80'}`}
                    >
                      <h4 className={`font-semibold mb-2 text-sm ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>
                        {info.question}
                      </h4>
                      <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        {info.answer}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

          {/* Map Section - Full Width */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`p-6 md:p-8 rounded-3xl border mb-6 ${
              isDark 
                ? 'bg-gray-800/70 border-gray-700/50 backdrop-blur-sm' 
                : 'bg-white border-orange-100 shadow-xl shadow-orange-200/30 backdrop-blur-sm'
            }`}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className={`p-3 rounded-2xl ${isDark ? 'bg-green-500/20' : 'bg-gradient-to-br from-green-100 to-emerald-100'}`}>
                <Navigation className={isDark ? 'text-green-400' : 'text-green-600'} size={22} />
              </div>
              <h2 className={`text-xl md:text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Location & Directions
              </h2>
            </div>
            
            {place.map_link ? (
              <div className="space-y-5">
                <div className={`h-72 md:h-96 rounded-2xl overflow-hidden border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <iframe 
                    src={place.map_link} 
                    width="100%" 
                    height="100%" 
                    style={{ border: 0 }} 
                    allowFullScreen 
                    loading="lazy" 
                    title={`Map of ${place.name}`}
                  />
                </div>
                <div className="flex flex-wrap gap-3">
                  {/* <a
                    href={place.map_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg shadow-orange-500/20"
                  >
                    <ExternalLink size={18} />
                    Open in Google Maps
                  </a> */}
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(place.name + ', ' + place.city)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg shadow-orange-500/20 ${
                      isDark 
                        ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Navigation size={18} />
                    Get Directions
                  </a>
                </div>
              </div>
            ) : (
              <div className={`h-72 md:h-80 rounded-2xl flex flex-col items-center justify-center ${
                isDark ? 'bg-gray-700/50' : 'bg-gradient-to-br from-orange-50 to-amber-50'
              }`}>
                <div className={`p-4 rounded-full mb-4 ${isDark ? 'bg-gray-600' : 'bg-white shadow-lg'}`}>
                  <Navigation className={isDark ? 'text-gray-400' : 'text-orange-400'} size={40} />
                </div>
                <p className={`font-semibold text-lg ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Map Coming Soon</p>
                <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Check back for directions</p>
              </div>
            )}
          </motion.div>

          {/* Back to State CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`p-8 rounded-3xl text-center ${
              isDark 
                ? 'bg-gradient-to-br from-orange-900/40 to-amber-900/30 border border-orange-800/30' 
                : 'bg-gradient-to-br from-orange-100 to-amber-100 border border-orange-200'
            }`}
          >
            <h3 className={`text-xl md:text-2xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Explore More in {displayStateName}
            </h3>
            <p className={`mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Discover other amazing destinations in this beautiful region
            </p>
            <Link 
              to={`/places/${stateName}`}
              className={`inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold transition-all ${
                isDark 
                  ? 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm' 
                  : 'bg-white text-orange-600 hover:bg-white/80 shadow-lg'
              }`}
            >
              <ArrowLeft size={18} />
              Back to {displayStateName}
            </Link>
          </motion.div>
        </div>
      </section>

      {/* All Images Modal */}
      <AnimatePresence>
        {showAllImages && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
            onClick={() => setShowAllImages(false)}
          >
            <button 
              onClick={() => setShowAllImages(false)}
              className="absolute top-6 right-6 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-10"
            >
              <X size={24} />
            </button>
            
            <div className="max-w-6xl w-full max-h-[85vh] overflow-y-auto">
              <h3 className="text-white text-xl font-bold mb-4 px-4">All Photos ({place.images?.length})</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4">
                {place.images?.map((img, idx) => (
                  <motion.button
                    key={idx}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.03 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex(idx);
                      setShowAllImages(false);
                    }}
                    className="aspect-video rounded-xl overflow-hidden hover:ring-4 ring-orange-500 transition-all"
                  >
                    <img src={img} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                  </motion.button>
              ))}
            </div>
          </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PlacePage; 
