import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { states as knowIndiaStates, uts as knowIndiaUTs } from 'knowindia';
import { useTheme } from "../context/ThemeContext";
import { standardizeStateName } from "../utils/stateCodeMapping";
import { API_CONFIG, getApiUrl } from '../config';
import { 
  MapPin, Building2, Users, BookOpen, Utensils, Calendar, 
  ChevronLeft, ChevronRight, X, ArrowLeft, ArrowRight,
  Globe, Landmark, Star, Camera, Navigation, Play, Pause, Grid3X3, List,
  Sparkles, Heart
} from "lucide-react";

const StatePage = () => {
  const { stateName } = useParams();
  const [stateData, setStateData] = useState(null);
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [placeDetails, setPlaceDetails] = useState(null);
  const [showAllPlacesModal, setShowAllPlacesModal] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const placesScrollRef = useRef(null);
  
  const fetchPlaceDetails = async (placeId) => {
    try {
      const response = await fetch(getApiUrl(`${API_CONFIG.ENDPOINTS.STATE_PLACE}/${stateName}/place/${placeId}`));
      if (!response.ok) throw new Error('Failed to fetch place details');
      const data = await response.json();
      if (!Array.isArray(data.images)) data.images = [data.images].filter(Boolean);
      setPlaceDetails(data);
    } catch (error) {
      console.error('Error fetching place details:', error);
    }
  };
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const formattedStateName = stateName.split("-").join(" ").toLowerCase();
        const standardizedName = standardizeStateName(formattedStateName);
        
        const allStates = knowIndiaStates();
        const allUTs = knowIndiaUTs();
        let foundStateData = null;
        
        for (const code in allStates) {
          if (allStates[code].name.toLowerCase() === standardizedName.toLowerCase()) {
            foundStateData = { ...allStates[code], code };
            break;
          }
        }
        
        if (!foundStateData) {
          for (const code in allUTs) {
            if (allUTs[code].name.toLowerCase() === standardizedName.toLowerCase()) {
              foundStateData = { ...allUTs[code], code };
              break;
            }
          }
        }
        
        setStateData(foundStateData);
        
        const apiUrl = getApiUrl(`${API_CONFIG.ENDPOINTS.PLACES}/state/${standardizedName}`);
        const response = await fetch(apiUrl);
        if (response.ok) {
          const placesData = await response.json();
          setPlaces(placesData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [stateName]);
  
  const displayStateName = stateName.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");

  const scrollPlaces = (direction) => {
    if (placesScrollRef.current) {
      const scrollAmount = 400;
      placesScrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  // Place Details Modal
  const PlaceDetailsModal = ({ place, onClose }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [activeTab, setActiveTab] = useState('about');
    const [isPlaying, setIsPlaying] = useState(true);
    const timerRef = useRef(null);

    useEffect(() => {
      if (place?.images?.length > 1 && isPlaying) {
        timerRef.current = setInterval(() => {
          setCurrentImageIndex((prev) => (prev + 1) % place.images.length);
        }, 4000);
      }
      return () => clearInterval(timerRef.current);
    }, [place, isPlaying]);

    if (!place) return null;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />
        
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          className={`relative w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-3xl shadow-2xl ${
            isDark ? 'bg-gray-900' : 'bg-white'
          }`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
            {/* Left - Image Gallery */}
            <div className="relative h-64 lg:h-auto">
              {place.images?.length > 0 ? (
                <>
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={currentImageIndex}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      src={place.images[currentImageIndex]}
                      alt={place.name}
                      className="w-full h-full object-cover"
                    />
                  </AnimatePresence>
                  
                  {place.images.length > 1 && (
                    <>
                      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setIsPlaying(!isPlaying)}
                            className="p-2 rounded-full bg-black/40 text-white backdrop-blur-sm hover:bg-black/60"
                          >
                            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                          </button>
                          <span className="text-white text-sm bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm">
                            {currentImageIndex + 1} / {place.images.length}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setCurrentImageIndex((prev) => (prev - 1 + place.images.length) % place.images.length)}
                            className="p-2 rounded-full bg-black/40 text-white backdrop-blur-sm hover:bg-black/60"
                          >
                            <ChevronLeft size={16} />
                          </button>
                          <button
                            onClick={() => setCurrentImageIndex((prev) => (prev + 1) % place.images.length)}
                            className="p-2 rounded-full bg-black/40 text-white backdrop-blur-sm hover:bg-black/60"
                          >
                            <ChevronRight size={16} />
                          </button>
                        </div>
                      </div>
                      
                      <div className="absolute top-4 left-4 right-4 flex gap-1 overflow-x-auto">
                        {place.images.slice(0, 6).map((img, idx) => (
                          <button
                            key={idx}
                            onClick={() => setCurrentImageIndex(idx)}
                            className={`flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                              idx === currentImageIndex ? 'border-white scale-105' : 'border-transparent opacity-70'
                            }`}
                          >
                            <img src={img} alt="" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-400 to-amber-500">
                  <Camera className="w-16 h-16 text-white/40" />
                </div>
              )}
              
              <button
                onClick={() => { onClose(); setShowAllPlacesModal(true); }}
                className="absolute top-4 left-4 p-2 rounded-full bg-black/40 text-white backdrop-blur-sm hover:bg-black/60 lg:hidden"
              >
                <ArrowLeft size={20} />
              </button>
            </div>

            {/* Right - Content */}
            <div className="flex flex-col h-full max-h-[60vh] lg:max-h-[90vh]">
              <div className={`p-6 border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-2 ${
                      isDark ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {place.category_name}
                    </span>
                    <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{place.name}</h2>
                    <p className={`flex items-center gap-1 mt-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      <MapPin size={14} /> {place.city}, {place.state}
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className={`p-2 rounded-full ${isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="flex gap-4 mt-4">
                  {['about', 'info', 'map'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`text-sm font-medium capitalize pb-2 border-b-2 transition-colors ${
                        activeTab === tab
                          ? isDark ? 'border-orange-500 text-orange-400' : 'border-orange-500 text-orange-600'
                          : isDark ? 'border-transparent text-gray-500 hover:text-gray-300' : 'border-transparent text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {activeTab === 'about' && (
                  <div className="space-y-4">
                    <p className={`leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      {place.description}
                    </p>
                    {place.address && (
                      <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-orange-50'}`}>
                        <h4 className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>Address</h4>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{place.address}</p>
                      </div>
                    )}
                  </div>
                )}
                
                {activeTab === 'info' && place.keyInformation?.length > 0 && (
                  <div className="space-y-3">
                    {place.keyInformation.map((info, idx) => (
                      <div key={idx} className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-orange-50'}`}>
                        <h4 className={`font-semibold mb-1 ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>{info.question}</h4>
                        <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{info.answer}</p>
                      </div>
                    ))}
                  </div>
                )}
                
                {activeTab === 'map' && (
                  <div className="h-64 rounded-xl overflow-hidden">
                    {place.map_link ? (
                      <iframe src={place.map_link} width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" title={`Map of ${place.name}`} />
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center bg-gradient-to-br from-orange-400 to-amber-500 text-white rounded-xl">
                        <Navigation className="w-10 h-10 mb-2 opacity-60" />
                        <p className="font-medium">Map coming soon</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  // All Places Modal
  const AllPlacesModal = ({ places, onClose }) => {
    const [viewMode, setViewMode] = useState('grid');
    
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50"
      >
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />
        
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25 }}
          className={`fixed bottom-0 left-0 right-0 h-[85vh] rounded-t-3xl overflow-hidden ${
            isDark ? 'bg-gray-900' : 'bg-white'
          }`}
        >
          <div className="flex justify-center pt-3 pb-2">
            <div className={`w-10 h-1 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`} />
          </div>
          
          <div className={`px-6 py-4 border-b flex items-center justify-between ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
            <div>
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                All Places
              </h2>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {places.length} destinations in {stateData?.name}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className={`p-2 rounded-lg ${isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'}`}
              >
                {viewMode === 'grid' ? <List size={18} /> : <Grid3X3 size={18} />}
              </button>
              <button onClick={onClose} className={`p-2 rounded-lg ${isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'}`}>
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="overflow-y-auto h-[calc(85vh-100px)] p-6">
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
              {places.map((place, index) => (
                <motion.div
                  key={place.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => { setSelectedPlace(place); fetchPlaceDetails(place.id); onClose(); }}
                  className={`cursor-pointer group ${
                    viewMode === 'grid'
                      ? `rounded-2xl overflow-hidden border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-md hover:shadow-lg'}`
                      : `flex gap-4 p-4 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' : 'bg-white border-gray-200 hover:bg-gray-50 shadow-sm'}`
                  } transition-all`}
                >
                  {viewMode === 'grid' ? (
                    <>
                      <div className="relative h-36 overflow-hidden">
                        {place.images?.[0] ? (
                          <img src={place.images[0]} alt={place.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className={`w-full h-full flex items-center justify-center ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                            <Camera className={isDark ? 'text-gray-600' : 'text-gray-400'} size={24} />
                          </div>
                        )}
                        <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-500 text-white">
                          {place.category_name}
                        </span>
                      </div>
                      <div className="p-4">
                        <h3 className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{place.name}</h3>
                        <p className={`text-xs line-clamp-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{place.description}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                        {place.images?.[0] ? (
                          <img src={place.images[0]} alt={place.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className={`w-full h-full flex items-center justify-center ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                            <Camera className={isDark ? 'text-gray-600' : 'text-gray-400'} size={20} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className={`text-xs font-medium ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>{place.category_name}</span>
                        <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{place.name}</h3>
                        <p className={`text-xs line-clamp-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{place.description}</p>
                      </div>
                      <ArrowRight className={`flex-shrink-0 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} size={18} />
                    </>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  // Loading
  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-950' : 'bg-gradient-to-br from-orange-50 via-amber-50 to-white'}`}>
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className={`absolute inset-0 rounded-full border-4 ${isDark ? 'border-orange-500/20 border-t-orange-500' : 'border-orange-200 border-t-orange-500'}`}
            />
            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center">
              <MapPin className="text-white" size={24} />
            </div>
          </div>
          <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Loading {displayStateName}</h2>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Fetching destinations...</p>
        </div>
      </div>
    );
  }

  // Not Found
  if (!stateData) {
    return (
      <div className={`min-h-screen flex items-center justify-center px-4 ${isDark ? 'bg-gray-950' : 'bg-gradient-to-br from-orange-50 via-amber-50 to-white'}`}>
        <div className="text-center">
          <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${isDark ? 'bg-gray-800' : 'bg-orange-100'}`}>
            <MapPin className={isDark ? 'text-gray-600' : 'text-orange-400'} size={32} />
          </div>
          <h1 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Not Found</h1>
          <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>We couldn't find {displayStateName}</p>
          <Link to="/places" className="px-6 py-3 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium hover:from-orange-600 hover:to-amber-600 transition-colors">
            Back to Map
          </Link>
        </div>
      </div>
    );
  }


  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-950' : 'bg-gradient-to-br from-orange-50 via-amber-50 to-white'}`}>
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {isDark ? (
          <>
            <div className="absolute top-20 -left-32 w-96 h-96 rounded-full blur-3xl opacity-20 bg-orange-600"></div>
            <div className="absolute top-1/2 -right-32 w-96 h-96 rounded-full blur-3xl opacity-20 bg-amber-600"></div>
            <div className="absolute bottom-0 left-1/3 w-80 h-80 rounded-full blur-3xl opacity-15 bg-orange-500"></div>
          </>
        ) : (
          <>
            <motion.div
              animate={{ x: [0, 30, 0], y: [0, -20, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-20 left-10 w-96 h-96 rounded-full bg-gradient-to-br from-orange-200/60 to-amber-200/50 blur-3xl"
            />
            <motion.div
              animate={{ x: [0, -40, 0], y: [0, 30, 0], scale: [1, 1.15, 1] }}
              transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
              className="absolute top-1/3 right-0 w-[500px] h-[500px] rounded-full bg-gradient-to-bl from-amber-200/50 to-orange-200/40 blur-3xl"
            />
            <motion.div
              animate={{ x: [0, 20, 0], y: [0, -30, 0] }}
              transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 4 }}
              className="absolute bottom-20 left-1/4 w-80 h-80 rounded-full bg-gradient-to-tr from-orange-100/40 to-yellow-100/30 blur-3xl"
            />
            {/* Decorative Elements */}
            <div className="absolute top-40 right-20 w-32 h-32 border-2 border-orange-200/40 rounded-full"></div>
            <div className="absolute bottom-40 left-16 w-24 h-24 border-2 border-amber-200/30 rotate-45"></div>
          </>
        )}
      </div>

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6"
          >
            <Link 
              to="/places" 
              className={`inline-flex items-center gap-2 text-sm font-medium transition-colors ${
                isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ArrowLeft size={16} />
              Back to Map
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left - Main Info */}
            <div className="lg:col-span-7 relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-4 ${
                  isDark ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'bg-orange-100 text-orange-700 border border-orange-200'
                }`}>
                  <Landmark size={14} />
                  {stateData.code?.length === 2 ? 'Indian State' : 'Union Territory'}
                </span>
                
                <h1 className={`text-5xl md:text-7xl font-black mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {stateData.name}
                </h1>
                
                <p className={`text-lg mb-6 max-w-xl leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {stateData.history.slice(0, 200)}...
                </p>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {[
                    { icon: Building2, label: 'Capital', value: stateData.capital },
                    { icon: Users, label: 'Population', value: stateData.population },
                    { icon: Globe, label: 'Area', value: stateData.area },
                    { icon: BookOpen, label: 'Literacy', value: stateData.literacyRate },
                  ].map((stat, idx) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * idx }}
                      className={`p-4 rounded-2xl border backdrop-blur-sm ${
                        isDark 
                          ? 'bg-gray-800/60 border-gray-700/50' 
                          : 'bg-white/80 border-gray-200 shadow-lg shadow-orange-100/50'
                      }`}
                    >
                      <stat.icon className={`w-5 h-5 mb-2 ${isDark ? 'text-orange-400' : 'text-orange-500'}`} />
                      <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{stat.label}</p>
                      <p className={`font-bold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{stat.value}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Languages */}
                <div className="flex flex-wrap gap-2">
                  {stateData.officialLanguages.map((lang, idx) => (
                    <span 
                      key={idx}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                        isDark ? 'bg-gray-800 text-gray-300 border border-gray-700' : 'bg-white text-gray-700 border border-gray-200 shadow-sm'
                      }`}
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Right - Bento Grid */}
            <div className="lg:col-span-5 relative z-10">
              <div className="grid grid-cols-2 gap-3">
                {/* State Symbols */}
                {[
                  { emoji: '🦁', label: 'Animal', value: stateData.stateAnimal || stateData.utAnimal },
                  { emoji: '🦅', label: 'Bird', value: stateData.stateBird || stateData.utBird },
                  { emoji: '🌸', label: 'Flower', value: stateData.stateFlower || stateData.utFlower },
                  { emoji: '🌳', label: 'Tree', value: stateData.stateTree || stateData.utTree },
                ].filter(s => s.value).map((symbol, idx) => (
                  <motion.div
                    key={symbol.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 + idx * 0.1 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    className={`p-4 rounded-2xl border backdrop-blur-sm ${
                      isDark 
                        ? 'bg-gray-800/60 border-gray-700/50' 
                        : 'bg-white/80 border-gray-200 shadow-lg shadow-orange-100/50'
                    }`}
                  >
                    <span className="text-3xl">{symbol.emoji}</span>
                    <p className={`text-xs mt-2 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{symbol.label}</p>
                    <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{symbol.value}</p>
                  </motion.div>
                ))}
                
                {/* Famous For - Full Width */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className={`col-span-2 p-5 rounded-2xl border ${
                    isDark 
                      ? 'bg-gradient-to-br from-orange-900/40 to-amber-900/40 border-orange-800/30' 
                      : 'bg-gradient-to-br from-orange-100 to-amber-100 border-orange-200'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Star className={`w-5 h-5 ${isDark ? 'text-orange-400' : 'text-orange-600'}`} />
                    <span className={`text-sm font-semibold ${isDark ? 'text-orange-300' : 'text-orange-700'}`}>Famous For</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {stateData.famousFor.slice(0, 5).map((item, idx) => (
                      <span key={idx} className={`text-xs px-3 py-1.5 rounded-full font-medium ${
                        isDark ? 'bg-orange-500/30 text-orange-200' : 'bg-white/80 text-orange-700 shadow-sm'
                      }`}>
                        {item}
                      </span>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Culture Section */}
      <section className={`py-16 relative ${isDark ? 'bg-gray-900/50' : ''}`}>
        {!isDark && (
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-transparent pointer-events-none"></div>
        )}
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`text-3xl font-bold mb-8 flex items-center gap-3 ${isDark ? 'text-white' : 'text-gray-900'}`}
          >
            <Heart className={isDark ? 'text-orange-400' : 'text-orange-500'} />
            Culture & Traditions
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Festivals */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`p-6 rounded-3xl border ${
                isDark 
                  ? 'bg-gray-800/60 border-gray-700/50' 
                  : 'bg-white/90 border-gray-200 shadow-xl shadow-orange-100/30'
              }`}
            >
              <div className="flex items-center gap-3 mb-5">
                <div className={`p-3 rounded-xl ${isDark ? 'bg-orange-500/20' : 'bg-gradient-to-br from-orange-100 to-amber-100'}`}>
                  <Calendar className={isDark ? 'text-orange-400' : 'text-orange-600'} size={22} />
                </div>
                <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Festivals</h3>
              </div>
              <div className="space-y-2">
                {stateData.festivals.slice(0, 5).map((festival, idx) => (
                  <div key={idx} className={`flex items-center gap-3 py-2.5 px-4 rounded-xl ${
                    isDark ? 'bg-gray-700/50' : 'bg-orange-50/80'
                  }`}>
                    <span className="text-lg">🎊</span>
                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{festival}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Cuisine */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className={`p-6 rounded-3xl border ${
                isDark 
                  ? 'bg-gray-800/60 border-gray-700/50' 
                  : 'bg-white/90 border-gray-200 shadow-xl shadow-orange-100/30'
              }`}
            >
              <div className="flex items-center gap-3 mb-5">
                <div className={`p-3 rounded-xl ${isDark ? 'bg-amber-500/20' : 'bg-gradient-to-br from-amber-100 to-yellow-100'}`}>
                  <Utensils className={isDark ? 'text-amber-400' : 'text-amber-600'} size={22} />
                </div>
                <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Cuisine</h3>
              </div>
              <div className="space-y-2">
                {stateData.cuisine.slice(0, 5).map((dish, idx) => (
                  <div key={idx} className={`flex items-center gap-3 py-2.5 px-4 rounded-xl ${
                    isDark ? 'bg-gray-700/50' : 'bg-amber-50/80'
                  }`}>
                    <span className="text-lg">🍛</span>
                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{dish}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Tourist Attractions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className={`p-6 rounded-3xl border ${
                isDark 
                  ? 'bg-gray-800/60 border-gray-700/50' 
                  : 'bg-white/90 border-gray-200 shadow-xl shadow-orange-100/30'
              }`}
            >
              <div className="flex items-center gap-3 mb-5">
                <div className={`p-3 rounded-xl ${isDark ? 'bg-teal-500/20' : 'bg-gradient-to-br from-teal-100 to-cyan-100'}`}>
                  <Landmark className={isDark ? 'text-teal-400' : 'text-teal-600'} size={22} />
                </div>
                <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Attractions</h3>
              </div>
              <div className="space-y-2">
                {stateData.touristAttractions.slice(0, 5).map((attraction, idx) => (
                  <div key={idx} className={`py-2.5 px-4 rounded-xl ${
                    isDark ? 'bg-gray-700/50' : 'bg-teal-50/80'
                  }`}>
                    <span className={`text-sm font-medium block ${isDark ? 'text-white' : 'text-gray-900'}`}>{attraction.name}</span>
                    <span className={`text-xs ${isDark ? 'text-teal-400' : 'text-teal-600'}`}>{attraction.type}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Places Section */}
      {places.length > 0 && (
        <section className="py-16 px-4 relative">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-3 ${
                  isDark ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-100 text-orange-700'
                }`}>
                  <Camera size={12} />
                  {places.length} Destinations
                </span>
                <h2 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Explore Places
                </h2>
              </motion.div>
              <div className="flex gap-2">
                <button
                  onClick={() => scrollPlaces('left')}
                  className={`p-3 rounded-full border transition-all ${
                    isDark 
                      ? 'bg-gray-800 border-gray-700 hover:bg-gray-700 text-white' 
                      : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-900 shadow-md'
                  }`}
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={() => scrollPlaces('right')}
                  className={`p-3 rounded-full border transition-all ${
                    isDark 
                      ? 'bg-gray-800 border-gray-700 hover:bg-gray-700 text-white' 
                      : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-900 shadow-md'
                  }`}
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            {/* Horizontal Scroll */}
            <div 
              ref={placesScrollRef}
              className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide"
              style={{ scrollSnapType: 'x mandatory' }}
            >
              {places.map((place, index) => (
                <motion.div
                  key={place.id}
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => { setSelectedPlace(place); fetchPlaceDetails(place.id); }}
                  className={`flex-shrink-0 w-80 cursor-pointer group rounded-3xl overflow-hidden border ${
                    isDark 
                      ? 'bg-gray-800 border-gray-700' 
                      : 'bg-white border-gray-200 shadow-xl shadow-orange-100/20'
                  }`}
                  style={{ scrollSnapAlign: 'start' }}
                >
                  <div className="relative h-52 overflow-hidden">
                    {place.images?.[0] ? (
                      <img 
                        src={place.images[0]} 
                        alt={place.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <Camera className={isDark ? 'text-gray-600' : 'text-gray-400'} size={32} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold bg-white/95 text-gray-900 shadow-sm">
                      {place.category_name}
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className={`text-lg font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{place.name}</h3>
                    <p className={`text-sm line-clamp-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{place.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {places.length > 4 && (
              <div className="text-center mt-8">
                <button
                  onClick={() => setShowAllPlacesModal(true)}
                  className="px-8 py-3 rounded-full font-semibold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg shadow-orange-500/25 transition-all"
                >
                  View All Places
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Facts Section */}
      <section className={`py-16 relative ${isDark ? 'bg-gray-900/50' : ''}`}>
        {!isDark && (
          <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 via-amber-50/50 to-white/50 pointer-events-none"></div>
        )}
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`text-3xl font-bold mb-8 flex items-center gap-3 ${isDark ? 'text-white' : 'text-gray-900'}`}
          >
            <Sparkles className={isDark ? 'text-orange-400' : 'text-orange-500'} />
            Interesting Facts
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stateData.interestingFacts.map((fact, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className={`flex gap-4 p-5 rounded-2xl border ${
                  isDark 
                    ? 'bg-gray-800/60 border-gray-700/50' 
                    : 'bg-white/90 border-gray-200 shadow-lg shadow-orange-100/20'
                }`}
              >
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                  isDark ? 'bg-orange-500/20 text-orange-400' : 'bg-gradient-to-br from-orange-100 to-amber-100 text-orange-600'
                }`}>
                  {idx + 1}
                </div>
                <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{fact}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Modals */}
      <AnimatePresence>
        {selectedPlace && (
          <PlaceDetailsModal
            place={placeDetails || selectedPlace}
            onClose={() => { setSelectedPlace(null); setPlaceDetails(null); }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAllPlacesModal && (
          <AllPlacesModal places={places} onClose={() => setShowAllPlacesModal(false)} />
        )}
      </AnimatePresence>

      {/* Hide scrollbar */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default StatePage;
