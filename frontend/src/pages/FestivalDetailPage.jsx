import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { API_CONFIG, getApiUrl } from '../config';
import { updateSEO, generateStructuredData } from '../utils/seo';
import { 
  PartyPopper, Calendar, MapPin, ArrowLeft, 
  Sparkles, History, Heart, Users,
  Share2, AlertCircle, BookOpen, Globe
} from 'lucide-react';

// Skeleton loader
const DetailSkeleton = ({ isDark }) => (
  <div className={`min-h-screen ${isDark ? 'bg-gray-950' : 'bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50'}`}>
    <div className="pt-20 pb-8 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <div className={`h-8 w-24 rounded ${isDark ? 'bg-gray-800' : 'bg-gray-200'} animate-pulse mb-4`} />
        <div className={`h-12 w-3/4 rounded ${isDark ? 'bg-gray-800' : 'bg-gray-200'} animate-pulse mb-6`} />
        <div className={`h-80 rounded-3xl ${isDark ? 'bg-gray-800' : 'bg-gray-200'} animate-pulse mb-8`} />
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {[1, 2, 3].map(i => (
            <div key={i} className={`h-24 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-gray-200'} animate-pulse`} />
          ))}
        </div>
        <div className={`h-48 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-gray-200'} animate-pulse`} />
      </div>
    </div>
  </div>
);

const FestivalDetailPage = () => {
  const { slug } = useParams();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const [festival, setFestival] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCopied, setShowCopied] = useState(false);

  // Fetch festival details
  useEffect(() => {
    const fetchFestival = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(getApiUrl(`${API_CONFIG.ENDPOINTS.FESTIVALS}/${slug}`));
        const data = await response.json();
        
        if (data.success) {
          setFestival(data.festival);
        } else {
          setError(data.message || 'Festival not found');
        }
      } catch (err) {
        console.error('Error fetching festival:', err);
        setError('Failed to connect to server');
      } finally {
        setLoading(false);
      }
    };
    
    if (slug) {
      fetchFestival();
    }
  }, [slug]);

  // SEO
  useEffect(() => {
    if (festival) {
      const currentYear = new Date().getFullYear();
      const seoTitle = `${festival.name} ${currentYear} Date | Festivals of India`;
      const seoDescription = `${festival.history?.substring(0, 100) || festival.description?.substring(0, 100)}... Learn about ${festival.name}, its history, significance, and celebration dates.`;
      
      updateSEO({
        title: seoTitle,
        description: seoDescription,
        keywords: `${festival.name}, ${festival.religion} festival, Indian festivals, ${festival.name} ${currentYear}, ${festival.name} date`,
        url: window.location.href,
        image: festival.imageUrl,
        type: 'article'
      });
      
      // Generate JSON-LD structured data for cultural event
      generateStructuredData({
        '@context': 'https://schema.org',
        '@type': 'Event',
        name: festival.name,
        description: festival.description,
        startDate: festival.currentYearDate?.date,
        location: {
          '@type': 'Place',
          name: festival.celebrationRegions || 'India',
          address: {
            '@type': 'PostalAddress',
            addressCountry: 'India'
          }
        },
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        eventStatus: 'https://schema.org/EventScheduled',
        image: festival.imageUrl,
        organizer: {
          '@type': 'Organization',
          name: 'Know India'
        }
      }, 'Event');
    }
  }, [festival]);

  // Share functionality
  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareTitle = festival?.name ? `${festival.name} - Festivals of India` : 'Festival of India';
    const shareText = festival?.description 
      ? `Discover ${festival.name}: ${festival.description.substring(0, 100)}...`
      : `Explore amazing Indian festivals!`;

    if (navigator.share) {
      try {
        await navigator.share({ title: shareTitle, text: shareText, url: shareUrl });
      } catch (err) {
        if (err.name !== 'AbortError') {
          copyToClipboard(shareUrl);
        }
      }
    } else {
      copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    } catch (err) {
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

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Date not available';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { 
      weekday: 'long',
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
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  if (loading) return <DetailSkeleton isDark={isDark} />;

  if (error || !festival) {
    return (
      <div className={`min-h-screen flex items-center justify-center px-4 ${isDark ? 'bg-gray-950' : 'bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50'}`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <AlertCircle className={`mx-auto mb-4 ${isDark ? 'text-red-400' : 'text-red-500'}`} size={64} />
          <h1 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Festival Not Found
          </h1>
          <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {error || "We couldn't find the festival you're looking for."}
          </p>
          <Link
            to="/festivals"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium hover:shadow-lg transition-all inline-flex items-center gap-2"
          >
            <ArrowLeft size={18} />
            Back to Festivals
          </Link>
        </motion.div>
      </div>
    );
  }

  const daysUntil = festival.currentYearDate ? getDaysUntil(festival.currentYearDate.date) : null;
  const imageUrl = festival.imageUrl || `https://source.unsplash.com/1200x800/?${encodeURIComponent(festival.name)},festival,india`;

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-950' : 'bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50'}`}>
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {isDark ? (
          <>
            <div className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full bg-orange-600/20 blur-[120px]" />
            <div className="absolute top-1/3 right-0 w-[500px] h-[500px] rounded-full bg-amber-600/15 blur-[100px]" />
          </>
        ) : (
          <>
            <motion.div
              animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
              transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-20 -left-20 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-orange-300/60 to-amber-300/50 blur-3xl"
            />
            <motion.div
              animate={{ x: [0, -50, 0], y: [0, 40, 0] }}
              transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 3 }}
              className="absolute top-1/4 -right-32 w-[700px] h-[700px] rounded-full bg-gradient-to-bl from-rose-200/60 to-orange-200/50 blur-3xl"
            />
          </>
        )}
      </div>

      {/* Header Section */}
      <section className="relative pt-24 pb-8 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Navigation */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-6"
          >
            <Link
              to="/festivals"
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
                isDark 
                  ? 'text-gray-400 hover:text-white hover:bg-white/10' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <ArrowLeft size={18} />
              <span>Back to Festivals</span>
            </Link>
            
            <div className="relative">
              <button
                onClick={handleShare}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
                  isDark 
                    ? 'text-gray-400 hover:text-white hover:bg-white/10' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Share2 size={18} />
                <span className="hidden sm:inline">Share</span>
              </button>
              
              <AnimatePresence>
                {showCopied && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.9 }}
                    className="absolute top-full right-0 mt-2 px-3 py-1.5 bg-green-500 text-white text-sm font-medium rounded-lg shadow-lg whitespace-nowrap"
                  >
                    Link copied!
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Title & Religion Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 ${
              isDark ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-100 text-orange-600'
            }`}>
              <PartyPopper size={16} />
              <span className="font-medium">{festival.religion} Festival</span>
              {festival.festivalType && (
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  isDark ? 'bg-gray-700 text-gray-300' : 'bg-white text-gray-600'
                }`}>
                  {festival.festivalType === 'LUNAR' ? 'Lunar Calendar' : 'Fixed Date'}
                </span>
              )}
            </div>
            
            <h1 className={`text-4xl md:text-5xl lg:text-6xl font-black mb-4 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              {festival.name}
            </h1>
            
            {festival.currentYearDate && (
              <div className={`flex flex-wrap items-center gap-4 ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                <div className="flex items-center gap-2">
                  <Calendar size={18} className={isDark ? 'text-orange-400' : 'text-orange-500'} />
                  <span className="font-medium">{formatDate(festival.currentYearDate.date)}</span>
                </div>
                {festival.currentYearDate.tithi && (
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    isDark ? 'bg-gray-800 text-gray-300' : 'bg-orange-50 text-orange-700'
                  }`}>
                    {festival.currentYearDate.tithi}
                  </span>
                )}
                {daysUntil !== null && daysUntil >= 0 && (
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    daysUntil <= 7 
                      ? 'bg-green-500 text-white' 
                      : isDark 
                        ? 'bg-gray-800 text-gray-300' 
                        : 'bg-gray-100 text-gray-700'
                  }`}>
                    {daysUntil === 0 ? 'Today!' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil} days to go`}
                  </span>
                )}
              </div>
            )}
          </motion.div>

          {/* Hero Image */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative rounded-3xl overflow-hidden mb-8"
          >
            <img
              src={imageUrl}
              alt={festival.name}
              className="w-full h-64 md:h-96 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </motion.div>

          {/* Quick Info Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10"
          >
            {/* Religion */}
            <div className={`p-4 rounded-2xl border ${
              isDark 
                ? 'bg-gray-800/70 border-gray-700/50' 
                : 'bg-white border-orange-100 shadow-sm'
            }`}>
              <Globe className={`mb-2 ${isDark ? 'text-orange-400' : 'text-orange-500'}`} size={22} />
              <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Religion</p>
              <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{festival.religion}</p>
            </div>
            
            {/* Type */}
            <div className={`p-4 rounded-2xl border ${
              isDark 
                ? 'bg-gray-800/70 border-gray-700/50' 
                : 'bg-white border-orange-100 shadow-sm'
            }`}>
              <Calendar className={`mb-2 ${isDark ? 'text-blue-400' : 'text-blue-500'}`} size={22} />
              <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Calendar Type</p>
              <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {festival.festivalType === 'LUNAR' ? 'Lunar' : 'Fixed'}
              </p>
            </div>
            
            {/* Celebration Regions */}
            <div className={`p-4 rounded-2xl border col-span-2 ${
              isDark 
                ? 'bg-gray-800/70 border-gray-700/50' 
                : 'bg-white border-orange-100 shadow-sm'
            }`}>
              <MapPin className={`mb-2 ${isDark ? 'text-green-400' : 'text-green-500'}`} size={22} />
              <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Celebrated In</p>
              <p className={`font-semibold line-clamp-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {festival.celebrationRegions || 'All over India'}
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Content Sections */}
      <section className="relative px-4 md:px-8 pb-16">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Description */}
          {festival.description && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`p-6 md:p-8 rounded-3xl border ${
                isDark 
                  ? 'bg-gray-800/70 border-gray-700/50' 
                  : 'bg-white border-orange-100 shadow-lg'
              }`}
            >
              <div className="flex items-center gap-3 mb-5">
                <div className={`p-3 rounded-2xl ${isDark ? 'bg-orange-500/20' : 'bg-gradient-to-br from-orange-100 to-amber-100'}`}>
                  <Sparkles className={isDark ? 'text-orange-400' : 'text-orange-600'} size={22} />
                </div>
                <h2 className={`text-xl md:text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  About {festival.name}
                </h2>
              </div>
              <p className={`leading-relaxed text-base md:text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {festival.description}
              </p>
            </motion.div>
          )}

          {/* History & Mythology */}
          {festival.history && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`p-6 md:p-8 rounded-3xl border ${
                isDark 
                  ? 'bg-gray-800/70 border-gray-700/50' 
                  : 'bg-white border-orange-100 shadow-lg'
              }`}
            >
              <div className="flex items-center gap-3 mb-5">
                <div className={`p-3 rounded-2xl ${isDark ? 'bg-amber-500/20' : 'bg-gradient-to-br from-amber-100 to-yellow-100'}`}>
                  <History className={isDark ? 'text-amber-400' : 'text-amber-600'} size={22} />
                </div>
                <h2 className={`text-xl md:text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  History & Mythology
                </h2>
              </div>
              <div className={`leading-relaxed text-base md:text-lg whitespace-pre-line ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {festival.history}
              </div>
            </motion.div>
          )}

          {/* Cultural Significance */}
          {festival.significance && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`p-6 md:p-8 rounded-3xl border ${
                isDark 
                  ? 'bg-gray-800/70 border-gray-700/50' 
                  : 'bg-white border-orange-100 shadow-lg'
              }`}
            >
              <div className="flex items-center gap-3 mb-5">
                <div className={`p-3 rounded-2xl ${isDark ? 'bg-red-500/20' : 'bg-gradient-to-br from-red-100 to-rose-100'}`}>
                  <Heart className={isDark ? 'text-red-400' : 'text-red-600'} size={22} />
                </div>
                <h2 className={`text-xl md:text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Cultural Significance
                </h2>
              </div>
              <div className={`leading-relaxed text-base md:text-lg whitespace-pre-line ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {festival.significance}
              </div>
            </motion.div>
          )}

          {/* How It Is Celebrated */}
          {festival.howCelebrated && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`p-6 md:p-8 rounded-3xl border ${
                isDark 
                  ? 'bg-gray-800/70 border-gray-700/50' 
                  : 'bg-white border-orange-100 shadow-lg'
              }`}
            >
              <div className="flex items-center gap-3 mb-5">
                <div className={`p-3 rounded-2xl ${isDark ? 'bg-green-500/20' : 'bg-gradient-to-br from-green-100 to-emerald-100'}`}>
                  <Users className={isDark ? 'text-green-400' : 'text-green-600'} size={22} />
                </div>
                <h2 className={`text-xl md:text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  How It Is Celebrated
                </h2>
              </div>
              <div className={`leading-relaxed text-base md:text-lg whitespace-pre-line ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {festival.howCelebrated}
              </div>
            </motion.div>
          )}

          {/* Upcoming Dates */}
          {festival.upcomingDates && festival.upcomingDates.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`p-6 md:p-8 rounded-3xl border ${
                isDark 
                  ? 'bg-gray-800/70 border-gray-700/50' 
                  : 'bg-white border-orange-100 shadow-lg'
              }`}
            >
              <div className="flex items-center gap-3 mb-5">
                <div className={`p-3 rounded-2xl ${isDark ? 'bg-blue-500/20' : 'bg-gradient-to-br from-blue-100 to-cyan-100'}`}>
                  <Calendar className={isDark ? 'text-blue-400' : 'text-blue-600'} size={22} />
                </div>
                <h2 className={`text-xl md:text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Celebration Dates
                </h2>
              </div>
              
              <div className="grid gap-4">
                {festival.upcomingDates.map((dateInfo, index) => {
                  const isCurrentYear = dateInfo.year === new Date().getFullYear();
                  const days = getDaysUntil(dateInfo.date);
                  const isPast = days !== null && days < 0;
                  
                  return (
                    <div
                      key={dateInfo.year}
                      className={`p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isCurrentYear
                          ? isDark 
                            ? 'bg-orange-500/20 border border-orange-500/30' 
                            : 'bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200'
                          : isDark 
                            ? 'bg-gray-700/50' 
                            : 'bg-gray-50'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {dateInfo.year}
                          </span>
                          {isCurrentYear && (
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              isDark ? 'bg-orange-500/30 text-orange-300' : 'bg-orange-200 text-orange-700'
                            }`}>
                              Current Year
                            </span>
                          )}
                        </div>
                        <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          {formatDate(dateInfo.date)}
                        </p>
                        {dateInfo.tithi && (
                          <p className={`text-sm mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                            {dateInfo.tithi}
                          </p>
                        )}
                      </div>
                      
                      {!isPast && days !== null && (
                        <div className={`px-4 py-2 rounded-xl text-center ${
                          days <= 30
                            ? 'bg-green-500 text-white'
                            : isDark 
                              ? 'bg-gray-600 text-gray-300' 
                              : 'bg-gray-200 text-gray-700'
                        }`}>
                          <span className="font-bold">
                            {days === 0 ? 'Today!' : days === 1 ? 'Tomorrow' : `${days} days`}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Related Places CTA */}
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
            <BookOpen className={`mx-auto mb-4 ${isDark ? 'text-orange-400' : 'text-orange-500'}`} size={40} />
            <h2 className={`text-2xl md:text-3xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Explore More Festivals
            </h2>
            <p className={`mb-6 max-w-2xl mx-auto ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Discover other vibrant festivals celebrated across India and learn about their rich traditions and customs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/festivals"
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold hover:shadow-lg transition-all inline-flex items-center justify-center gap-2"
              >
                <PartyPopper size={18} />
                View All Festivals
              </Link>
              <Link
                to="/places"
                className={`px-8 py-4 rounded-xl font-semibold transition-all inline-flex items-center justify-center gap-2 ${
                  isDark 
                    ? 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm' 
                    : 'bg-white text-orange-600 hover:bg-white/80 shadow-lg'
                }`}
              >
                <MapPin size={18} />
                Explore Places
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default FestivalDetailPage;
