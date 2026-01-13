import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MapPin, Calendar, Wallet, Users, Loader2,
  Sun, Sunset, Moon, Utensils, Lightbulb, AlertCircle,
  Download, Share2, Copy, Check, ExternalLink, Sparkles, ArrowLeft
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { API_CONFIG } from '../config';
import { updateSEO } from '../utils/seo';

const SharedItinerary = () => {
  const { id } = useParams();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const fetchItinerary = async () => {
      try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ITINERARY}/${id}`);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || 'Failed to fetch itinerary');
        }

        setData(result);
        updateSEO({
          title: `${result.destination} ${result.days}-Day Itinerary - Know India`,
          description: `Explore this AI-generated ${result.days}-day travel itinerary for ${result.destination}, India.`,
          keywords: `${result.destination} itinerary, India travel, trip planner`,
        });
      } catch (err) {
        console.error('Error fetching itinerary:', err);
        setError(err.message || 'Failed to load itinerary');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchItinerary();
    }
  }, [id]);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ITINERARY}/${id}/pdf`);
      
      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${data.destination.replace(/\s+/g, '_')}_${data.days}day_itinerary.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error downloading PDF:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-950' : 'bg-gradient-to-br from-orange-50 via-amber-50/50 to-white'}`}>
        <div className="text-center">
          <Loader2 size={48} className={`animate-spin mx-auto mb-4 ${isDark ? 'text-orange-400' : 'text-orange-500'}`} />
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Loading itinerary...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen flex items-center justify-center px-4 ${isDark ? 'bg-gray-950' : 'bg-gradient-to-br from-orange-50 via-amber-50/50 to-white'}`}>
        <div className={`max-w-md w-full p-8 rounded-3xl text-center ${isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white shadow-xl'}`}>
          <AlertCircle size={48} className={`mx-auto mb-4 ${isDark ? 'text-red-400' : 'text-red-500'}`} />
          <h2 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Itinerary Not Found
          </h2>
          <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {error}
          </p>
          <Link
            to="/trip-planner"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium bg-gradient-to-r from-orange-500 to-pink-500 text-white"
          >
            <Sparkles size={18} />
            Create Your Own Itinerary
          </Link>
        </div>
      </div>
    );
  }

  const itinerary = data?.itinerary;

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
            <div className="absolute top-20 left-10 w-96 h-96 rounded-full bg-gradient-to-br from-orange-200/60 to-amber-200/50 blur-3xl" />
            <div className="absolute bottom-20 right-0 w-[500px] h-[500px] rounded-full bg-gradient-to-bl from-purple-200/40 to-pink-200/30 blur-3xl" />
          </>
        )}
      </div>

      {/* Header */}
      <section className="relative pt-24 pb-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Link
            to="/trip-planner"
            className={`inline-flex items-center gap-2 mb-6 text-sm font-medium ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
          >
            <ArrowLeft size={16} />
            Create Your Own Itinerary
          </Link>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-4"
          >
            <div className={`p-3 rounded-2xl ${isDark ? 'bg-gradient-to-br from-orange-500/20 to-purple-500/20' : 'bg-gradient-to-br from-orange-100 to-purple-100'}`}>
              <MapPin className={`w-8 h-8 ${isDark ? 'text-orange-400' : 'text-orange-600'}`} />
            </div>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`text-3xl md:text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}
          >
            {data.destination}{' '}
            <span className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 bg-clip-text text-transparent">
              Adventure
            </span>
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap items-center gap-4 mb-6"
          >
            <span className={`flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <Calendar size={16} />
              {data.days} Days
            </span>
            <span className={`flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <Users size={16} />
              {data.travelType}
            </span>
            <span className={`flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <Wallet size={16} />
              {data.budget} budget
            </span>
          </motion.div>
        </div>
      </section>

      {/* Action Buttons */}
      <section className="relative px-4 pb-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${
                isDark
                  ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:shadow-lg hover:shadow-orange-500/25'
                  : 'bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:shadow-lg hover:shadow-orange-500/25'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isDownloading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Generating PDF...
                </>
              ) : (
                <>
                  <Download size={18} />
                  Download PDF
                </>
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCopyUrl}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${
                copied
                  ? (isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700')
                  : (isDark ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30' : 'bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100')
              }`}
            >
              {copied ? (
                <>
                  <Check size={18} />
                  Copied!
                </>
              ) : (
                <>
                  <Copy size={18} />
                  Copy Link
                </>
              )}
            </motion.button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="relative px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          {/* Matched Places */}
          {data.matchedPlaces && data.matchedPlaces.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-3xl p-6 mb-6 ${isDark ? 'bg-gray-900/80 border border-gray-800' : 'bg-white/80 backdrop-blur-sm shadow-xl border border-gray-100'}`}
            >
              <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                AI-Matched Places
              </h3>
              <div className="flex flex-wrap gap-2">
                {data.matchedPlaces.slice(0, 10).map((place, idx) => (
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
            </motion.div>
          )}

          {/* Day-wise Itinerary */}
          <div className="space-y-6">
            {itinerary?.itinerary?.map((day, dayIndex) => (
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
                          </div>
                          <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {activity.activity}
                          </p>
                          {activity.place && (
                            <p className={`text-sm flex items-center gap-1 mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              <MapPin size={12} />
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
          {itinerary?.generalTips && itinerary.generalTips.length > 0 && (
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
                {itinerary.generalTips.map((tip, idx) => (
                  <li key={idx} className={`flex items-start gap-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    <Check size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
              {itinerary?.totalEstimatedBudget && (
                <div className={`mt-4 pt-4 border-t ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
                  <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Estimated Total Budget: <span className="text-green-500">{itinerary.totalEstimatedBudget}</span>
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* Create Your Own CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className={`mt-8 rounded-3xl p-8 text-center ${isDark ? 'bg-gradient-to-r from-orange-500/10 to-purple-500/10 border border-gray-800' : 'bg-gradient-to-r from-orange-50 to-purple-50 border border-gray-100'}`}
          >
            <Sparkles size={32} className={`mx-auto mb-4 ${isDark ? 'text-orange-400' : 'text-orange-500'}`} />
            <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Ready to Plan Your Own Adventure?
            </h3>
            <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Create a personalized itinerary with our AI Trip Planner
            </p>
            <Link
              to="/trip-planner"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:shadow-lg hover:shadow-orange-500/25 transition-all"
            >
              <Sparkles size={18} />
              Create Itinerary
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default SharedItinerary;
