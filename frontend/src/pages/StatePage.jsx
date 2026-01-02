import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { states as knowIndiaStates, uts as knowIndiaUTs } from 'knowindia';
import { useTheme } from "../context/ThemeContext";
import { standardizeStateName } from "../utils/stateCodeMapping";
import { API_CONFIG, getApiUrl } from '../config';
import BookmarkButton from '../components/BookmarkButton';
import { updateSEO, SEO_CONFIG } from '../utils/seo';
import { 
  MapPin, Building2, Users, BookOpen, Utensils, Calendar, 
  ChevronLeft, ChevronRight, ArrowLeft, ArrowRight,
  Globe, Landmark, Star, Camera,
  Sparkles, Heart
} from "lucide-react";

const StatePage = () => {
  const { stateName } = useParams();
  const [stateData, setStateData] = useState(null);
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const placesScrollRef = useRef(null);
  
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

  // SEO: Update meta tags when state data is loaded
  useEffect(() => {
    if (stateData) {
      const seoConfig = SEO_CONFIG.state(stateData.name || displayStateName, stateData.capital);
      updateSEO({
        ...seoConfig,
        url: window.location.href,
        image: stateData.touristAttractions?.[0]?.image
      });
    } else if (!loading) {
      updateSEO({
        title: `${displayStateName} Tourism - Places to Visit`,
        description: `Explore ${displayStateName}, India. Discover top tourist attractions, heritage sites, culture, and best places to visit.`,
        keywords: `${displayStateName} tourism, ${displayStateName} travel, places to visit in ${displayStateName}, India tourism`
      });
    }
  }, [stateData, displayStateName, loading]);

  const scrollPlaces = (direction) => {
    if (placesScrollRef.current) {
      const scrollAmount = 400;
      placesScrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
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
              className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide"
              style={{ scrollSnapType: 'x mandatory' }}
            >
              {places.map((place, index) => (
                <motion.div
                  key={place.id}
                  initial={{ opacity: 0, x: 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                  style={{ scrollSnapAlign: 'start' }}
                  className="flex-shrink-0"
                >
                  <Link
                    to={`/places/${stateName}/${place.id}`}
                    className={`block w-64 group rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 ${
                      isDark 
                        ? 'bg-gray-800/90 ring-1 ring-gray-700/50 hover:ring-orange-500/30' 
                        : 'bg-white ring-1 ring-gray-200 shadow-lg hover:shadow-xl hover:ring-orange-300'
                    }`}
                  >
                    {/* Image Container */}
                    <div className="relative h-40 overflow-hidden">
                      {place.images?.[0] ? (
                        <img
                          src={place.images[0]}
                          alt={`${place.name} - ${place.category_name || 'Tourist destination'} in ${displayStateName}, India`}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className={`w-full h-full flex items-center justify-center ${isDark ? 'bg-gray-700' : 'bg-gradient-to-br from-orange-100 to-amber-100'}`}>
                          <Camera className={isDark ? 'text-gray-600' : 'text-orange-300'} size={32} />
                        </div>
                      )}
                      
                      {/* Category Badge */}
                      <div className="absolute top-3 left-3">
                        <span className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold ${
                          isDark 
                            ? 'bg-black/60 text-white backdrop-blur-sm' 
                            : 'bg-white/90 text-gray-800 backdrop-blur-sm shadow-sm'
                        }`}>
                          {place.category_name}
                        </span>
                      </div>
                      
                      {/* Bookmark Button */}
                      <div className="absolute top-3 right-3">
                        <BookmarkButton 
                          place={{
                            id: place.id,
                            name: place.name,
                            state: stateData?.name || displayStateName,
                            stateSlug: stateName,
                            category_name: place.category_name,
                            images: place.images,
                            description: place.description,
                          }}
                          variant="card"
                          size="sm"
                        />
                      </div>
                    </div>
                    
                    {/* Content Container - Fixed Heights */}
                    <div className="p-4">
                      {/* Title - Fixed 2 lines */}
                      <div className="h-12 mb-2">
                        <h3 className={`text-sm font-bold leading-snug line-clamp-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {place.name}
                        </h3>
                      </div>
                      
                      {/* Description - Fixed 3 lines */}
                      <div className="h-[60px]">
                        <p className={`text-xs leading-relaxed line-clamp-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {place.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* View All Places Grid */}
            {places.length > 4 && (
              <div className="mt-12">
                <h3 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  All Destinations
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {places.map((place, index) => (
                    <motion.div
                      key={`grid-${place.id}`}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.03 }}
                    >
                      <Link
                        to={`/places/${stateName}/${place.id}`}
                        className={`flex gap-4 p-4 rounded-xl border group transition-all hover:scale-[1.01] ${
                          isDark 
                            ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' 
                            : 'bg-white border-gray-200 hover:bg-gray-50 shadow-sm hover:shadow-md'
                        }`}
                      >
                        <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                          {place.images?.[0] ? (
                            <img src={place.images[0]} alt={`${place.name} - ${place.category_name || 'destination'} in ${displayStateName}`} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          ) : (
                            <div className={`w-full h-full flex items-center justify-center ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                              <Camera className={isDark ? 'text-gray-600' : 'text-gray-400'} size={20} />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className={`text-xs font-medium ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>{place.category_name}</span>
                          <h4 className={`font-semibold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{place.name}</h4>
                          <p className={`text-xs line-clamp-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{place.description}</p>
                        </div>
                        <BookmarkButton 
                          place={{
                            id: place.id,
                            name: place.name,
                            state: stateData?.name || displayStateName,
                            stateSlug: stateName,
                            category_name: place.category_name,
                            images: place.images,
                            description: place.description,
                          }}
                          variant="icon"
                          size="sm"
                        />
                        <ArrowRight className={`flex-shrink-0 self-center ${isDark ? 'text-gray-600 group-hover:text-orange-400' : 'text-gray-400 group-hover:text-orange-500'} transition-colors`} size={18} />
                      </Link>
                    </motion.div>
                  ))}
                </div>
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

      {/* Hide scrollbar */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default StatePage;
