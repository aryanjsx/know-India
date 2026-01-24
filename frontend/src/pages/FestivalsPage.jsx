import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { API_CONFIG, getApiUrl } from '../config';
import { updateSEO, SEO_CONFIG } from '../utils/seo';
import { 
  PartyPopper, Calendar, MapPin, Filter, X, ChevronRight, 
  Sparkles, Clock, Search, AlertCircle
} from 'lucide-react';

// Month names for filter
const MONTHS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

// Skeleton loader for festival cards
const FestivalCardSkeleton = ({ isDark }) => (
  <div className={`rounded-2xl overflow-hidden border ${
    isDark 
      ? 'bg-gray-800/50 border-gray-700/50' 
      : 'bg-white border-orange-100'
  }`}>
    <div className={`h-48 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`} />
    <div className="p-5 space-y-3">
      <div className={`h-4 w-20 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`} />
      <div className={`h-6 w-3/4 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`} />
      <div className={`h-4 w-1/2 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`} />
      <div className={`h-16 w-full rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`} />
    </div>
  </div>
);

// Festival card component
const FestivalCard = ({ festival, isDark, index }) => {
  const formatDate = (dateStr) => {
    if (!dateStr) return 'Date TBA';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const getDaysUntil = (dateStr) => {
    if (!dateStr) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const festivalDate = new Date(dateStr);
    festivalDate.setHours(0, 0, 0, 0);
    const diffTime = festivalDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntil = getDaysUntil(festival.celebrationDate);
  const isUpcoming = daysUntil !== null && daysUntil >= 0 && daysUntil <= 30;
  const isPast = daysUntil !== null && daysUntil < 0;

  // Default image if none provided
  const imageUrl = festival.imageUrl || `https://source.unsplash.com/800x600/?${encodeURIComponent(festival.name)},festival,india`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileHover={{ y: -5 }}
      className="group"
    >
      <Link to={`/festivals/${festival.seoSlug}`}>
        <div className={`h-full rounded-2xl overflow-hidden border transition-all duration-300 ${
          isDark 
            ? 'bg-gray-800/70 border-gray-700/50 hover:border-orange-500/50 hover:shadow-lg hover:shadow-orange-500/10' 
            : 'bg-white border-orange-100 hover:border-orange-300 hover:shadow-xl hover:shadow-orange-200/50'
        }`}>
          {/* Image */}
          <div className="relative h-48 overflow-hidden">
            <img 
              src={imageUrl} 
              alt={festival.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            {/* Religion Badge */}
            <div className="absolute top-3 left-3">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm ${
                isDark 
                  ? 'bg-orange-500/80 text-white' 
                  : 'bg-white/90 text-orange-600'
              }`}>
                {festival.religion}
              </span>
            </div>
            
            {/* Upcoming Badge */}
            {isUpcoming && (
              <div className="absolute top-3 right-3">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500 text-white flex items-center gap-1">
                  <Clock size={12} />
                  {daysUntil === 0 ? 'Today!' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil} days`}
                </span>
              </div>
            )}

            {/* Festival Name on Image */}
            <div className="absolute bottom-3 left-3 right-3">
              <h3 className="text-white font-bold text-lg line-clamp-1 drop-shadow-lg">
                {festival.name}
              </h3>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-5">
            {/* Date */}
            <div className={`flex items-center gap-2 mb-3 ${
              isPast ? 'opacity-60' : ''
            }`}>
              <Calendar size={16} className={isDark ? 'text-orange-400' : 'text-orange-500'} />
              <span className={`text-sm font-medium ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {formatDate(festival.celebrationDate)}
              </span>
              {festival.tithi && (
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  isDark ? 'bg-gray-700 text-gray-400' : 'bg-orange-50 text-orange-600'
                }`}>
                  {festival.tithi}
                </span>
              )}
            </div>
            
            {/* Description */}
            <p className={`text-sm line-clamp-3 mb-4 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {festival.description}
            </p>
            
            {/* Regions */}
            {festival.celebrationRegions && (
              <div className={`flex items-center gap-2 text-xs ${
                isDark ? 'text-gray-500' : 'text-gray-500'
              }`}>
                <MapPin size={12} />
                <span className="line-clamp-1">{festival.celebrationRegions}</span>
              </div>
            )}
            
            {/* CTA */}
            <div className={`mt-4 pt-4 border-t flex items-center justify-between ${
              isDark ? 'border-gray-700' : 'border-gray-100'
            }`}>
              <span className={`text-sm font-medium ${
                isDark ? 'text-orange-400' : 'text-orange-600'
              }`}>
                Learn more
              </span>
              <ChevronRight size={18} className={`transition-transform group-hover:translate-x-1 ${
                isDark ? 'text-orange-400' : 'text-orange-600'
              }`} />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

const FestivalsPage = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const [festivals, setFestivals] = useState([]);
  const [religions, setReligions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters
  const [selectedReligion, setSelectedReligion] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [showUpcoming, setShowUpcoming] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch religions for filter dropdown
  useEffect(() => {
    const fetchReligions = async () => {
      try {
        const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.FESTIVALS_RELIGIONS));
        const data = await response.json();
        if (data.success) {
          setReligions(data.religions);
        }
      } catch (err) {
        console.error('Error fetching religions:', err);
      }
    };
    fetchReligions();
  }, []);

  // Fetch festivals with filters
  useEffect(() => {
    const fetchFestivals = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const params = new URLSearchParams();
        if (selectedReligion) params.append('religion', selectedReligion);
        if (selectedMonth) params.append('month', selectedMonth);
        if (showUpcoming) params.append('upcoming', 'true');
        
        const queryString = params.toString();
        const url = getApiUrl(`${API_CONFIG.ENDPOINTS.FESTIVALS}${queryString ? `?${queryString}` : ''}`);
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.success) {
          setFestivals(data.festivals);
        } else {
          setError(data.message || 'Failed to fetch festivals');
        }
      } catch (err) {
        console.error('Error fetching festivals:', err);
        setError('Failed to connect to server');
      } finally {
        setLoading(false);
      }
    };
    
    fetchFestivals();
  }, [selectedReligion, selectedMonth, showUpcoming]);

  // SEO
  useEffect(() => {
    updateSEO(SEO_CONFIG.festivals);
  }, []);

  // Filter festivals by search query (client-side)
  const filteredFestivals = festivals.filter(festival => 
    searchQuery === '' || 
    festival.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    festival.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const clearFilters = () => {
    setSelectedReligion('');
    setSelectedMonth('');
    setShowUpcoming(false);
    setSearchQuery('');
  };

  const hasActiveFilters = selectedReligion || selectedMonth || showUpcoming || searchQuery;

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-950' : 'bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50'}`}>
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {isDark ? (
          <>
            <div className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full bg-orange-600/20 blur-[120px]" />
            <div className="absolute top-1/3 right-0 w-[500px] h-[500px] rounded-full bg-amber-600/15 blur-[100px]" />
            <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] rounded-full bg-orange-500/10 blur-[80px]" />
          </>
        ) : (
          <>
            <motion.div
              animate={{ x: [0, 40, 0], y: [0, -30, 0], scale: [1, 1.15, 1] }}
              transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-20 -left-20 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-orange-300/60 to-amber-300/50 blur-3xl"
            />
            <motion.div
              animate={{ x: [0, -50, 0], y: [0, 40, 0], scale: [1, 1.2, 1] }}
              transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 3 }}
              className="absolute top-1/4 -right-32 w-[700px] h-[700px] rounded-full bg-gradient-to-bl from-rose-200/60 to-orange-200/50 blur-3xl"
            />
          </>
        )}
      </div>

      {/* Hero Section */}
      <section className="relative pt-24 pb-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 ${
              isDark ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-100 text-orange-600'
            }`}>
              <PartyPopper size={18} />
              <span className="font-medium">Festivals of India</span>
            </div>
            
            <h1 className={`text-4xl md:text-5xl lg:text-6xl font-black mb-4 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Celebrate India's
              <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent"> Rich Heritage</span>
            </h1>
            
            <p className={`text-lg max-w-2xl mx-auto ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Discover the vibrant festivals celebrated across India, their rich history, cultural significance, and celebration dates.
            </p>
          </motion.div>

          {/* Search & Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`p-4 md:p-6 rounded-2xl border mb-8 ${
              isDark 
                ? 'bg-gray-800/70 border-gray-700/50 backdrop-blur-sm' 
                : 'bg-white/80 border-orange-100 backdrop-blur-sm shadow-lg'
            }`}
          >
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Input */}
              <div className="flex-1 relative">
                <Search className={`absolute left-4 top-1/2 -translate-y-1/2 ${
                  isDark ? 'text-gray-500' : 'text-gray-400'
                }`} size={20} />
                <input
                  type="text"
                  placeholder="Search festivals..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-12 pr-4 py-3 rounded-xl border transition-colors ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:border-orange-500' 
                      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-orange-500'
                  } outline-none`}
                />
              </div>
              
              {/* Filter Toggle (Mobile) */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`md:hidden flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition-colors ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-gray-50 border-gray-200 text-gray-700'
                }`}
              >
                <Filter size={18} />
                Filters
                {hasActiveFilters && (
                  <span className="w-2 h-2 rounded-full bg-orange-500" />
                )}
              </button>
              
              {/* Desktop Filters */}
              <div className="hidden md:flex items-center gap-3">
                {/* Religion Filter */}
                <select
                  value={selectedReligion}
                  onChange={(e) => setSelectedReligion(e.target.value)}
                  className={`px-4 py-3 rounded-xl border transition-colors ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-200 text-gray-700'
                  } outline-none cursor-pointer`}
                >
                  <option value="">All Religions</option>
                  {religions.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
                
                {/* Month Filter */}
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className={`px-4 py-3 rounded-xl border transition-colors ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-200 text-gray-700'
                  } outline-none cursor-pointer`}
                >
                  <option value="">All Months</option>
                  {MONTHS.map(m => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
                
                {/* Upcoming Toggle */}
                <button
                  onClick={() => setShowUpcoming(!showUpcoming)}
                  className={`px-4 py-3 rounded-xl border transition-colors flex items-center gap-2 ${
                    showUpcoming
                      ? isDark 
                        ? 'bg-orange-500/20 border-orange-500 text-orange-400' 
                        : 'bg-orange-100 border-orange-300 text-orange-600'
                      : isDark 
                        ? 'bg-gray-700 border-gray-600 text-gray-300' 
                        : 'bg-white border-gray-200 text-gray-600'
                  }`}
                >
                  <Clock size={16} />
                  Upcoming
                </button>
                
                {/* Clear Filters */}
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className={`p-3 rounded-xl border transition-colors ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-gray-400 hover:text-white' 
                        : 'bg-gray-50 border-gray-200 text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            </div>
            
            {/* Mobile Filters Dropdown */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="md:hidden mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3"
                >
                  <select
                    value={selectedReligion}
                    onChange={(e) => setSelectedReligion(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-200 text-gray-700'
                    } outline-none`}
                  >
                    <option value="">All Religions</option>
                    {religions.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                  
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-200 text-gray-700'
                    } outline-none`}
                  >
                    <option value="">All Months</option>
                    {MONTHS.map(m => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowUpcoming(!showUpcoming)}
                      className={`flex-1 px-4 py-3 rounded-xl border transition-colors flex items-center justify-center gap-2 ${
                        showUpcoming
                          ? isDark 
                            ? 'bg-orange-500/20 border-orange-500 text-orange-400' 
                            : 'bg-orange-100 border-orange-300 text-orange-600'
                          : isDark 
                            ? 'bg-gray-700 border-gray-600 text-gray-300' 
                            : 'bg-white border-gray-200 text-gray-600'
                      }`}
                    >
                      <Clock size={16} />
                      Upcoming Only
                    </button>
                    
                    {hasActiveFilters && (
                      <button
                        onClick={clearFilters}
                        className={`px-4 py-3 rounded-xl border ${
                          isDark 
                            ? 'bg-gray-700 border-gray-600 text-gray-400' 
                            : 'bg-gray-50 border-gray-200 text-gray-500'
                        }`}
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Results Count */}
          {!loading && !error && (
            <div className={`mb-6 text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
              Showing {filteredFestivals.length} festival{filteredFestivals.length !== 1 ? 's' : ''}
              {hasActiveFilters && ' (filtered)'}
            </div>
          )}
        </div>
      </section>

      {/* Festivals Grid */}
      <section className="relative px-4 md:px-8 pb-16">
        <div className="max-w-7xl mx-auto">
          {/* Loading State */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <FestivalCardSkeleton key={i} isDark={isDark} />
              ))}
            </div>
          )}
          
          {/* Error State */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-center py-16 px-4 rounded-2xl border ${
                isDark 
                  ? 'bg-gray-800/50 border-gray-700/50' 
                  : 'bg-white border-orange-100'
              }`}
            >
              <AlertCircle className={`mx-auto mb-4 ${isDark ? 'text-red-400' : 'text-red-500'}`} size={48} />
              <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Oops! Something went wrong
              </h3>
              <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {error}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium hover:shadow-lg transition-all"
              >
                Try Again
              </button>
            </motion.div>
          )}
          
          {/* No Results State */}
          {!loading && !error && filteredFestivals.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-center py-16 px-4 rounded-2xl border ${
                isDark 
                  ? 'bg-gray-800/50 border-gray-700/50' 
                  : 'bg-white border-orange-100'
              }`}
            >
              <PartyPopper className={`mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} size={64} />
              <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                No festivals found
              </h3>
              <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Try adjusting your filters or search query
              </p>
              <button
                onClick={clearFilters}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium hover:shadow-lg transition-all"
              >
                Clear Filters
              </button>
            </motion.div>
          )}
          
          {/* Festivals Grid */}
          {!loading && !error && filteredFestivals.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFestivals.map((festival, index) => (
                <FestivalCard 
                  key={festival.id} 
                  festival={festival} 
                  isDark={isDark}
                  index={index}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative px-4 md:px-8 pb-16">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`p-8 md:p-12 rounded-3xl text-center ${
              isDark 
                ? 'bg-gradient-to-br from-orange-900/40 to-amber-900/30 border border-orange-800/30' 
                : 'bg-gradient-to-br from-orange-100 to-amber-100 border border-orange-200'
            }`}
          >
            <Sparkles className={`mx-auto mb-4 ${isDark ? 'text-orange-400' : 'text-orange-500'}`} size={40} />
            <h2 className={`text-2xl md:text-3xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Experience India's Cultural Diversity
            </h2>
            <p className={`mb-6 max-w-2xl mx-auto ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              From the colorful Holi to the illuminating Diwali, explore the festivals that bring communities together and celebrate India's unity in diversity.
            </p>
            <Link
              to="/places"
              className={`inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold transition-all ${
                isDark 
                  ? 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm' 
                  : 'bg-white text-orange-600 hover:bg-white/80 shadow-lg'
              }`}
            >
              <MapPin size={18} />
              Explore Places to Visit
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default FestivalsPage;
