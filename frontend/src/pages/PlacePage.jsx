import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from "../context/ThemeContext";

const PlacePage = () => {
  const { stateName, placeId, placeName } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchPlace = async () => {
      try {
        setLoading(true);
        // Use placeId if available, otherwise use placeName
        const identifier = placeId || placeName;
        const response = await fetch(`https://knowindiaback.vercel.app/api/places/${stateName}/${identifier}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data) {
          throw new Error('No data received from server');
        }

        setPlace(data);
        setCurrentImageIndex(0);
      } catch (error) {
        console.error('Error fetching place:', error);
        navigate(`/state/${stateName}`);
      } finally {
        setLoading(false);
      }
    };

    fetchPlace();
  }, [placeId, placeName, stateName, navigate]);

  const handlePrevImage = useCallback(() => {
    setCurrentImageIndex((prev) => (prev - 1 + place.images.length) % place.images.length);
  }, [place?.images?.length]);

  const handleNextImage = useCallback(() => {
    setCurrentImageIndex((prev) => (prev + 1) % place.images.length);
  }, [place?.images?.length]);

  // Add keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (place?.images?.length > 1) {
        if (e.key === 'ArrowLeft') {
          handlePrevImage();
        } else if (e.key === 'ArrowRight') {
          handleNextImage();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handlePrevImage, handleNextImage, place?.images?.length]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (!place) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Place not found</h1>
        <button
          onClick={() => navigate(`/state/${stateName}`)}
          className="px-4 py-2 bg-amber-500 text-white rounded hover:bg-amber-600"
        >
          Return to State Page
        </button>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      {/* Hero Section with Image Slideshow */}
      <div className="relative h-96 w-full">
        {place.images && place.images.length > 0 ? (
          <>
            <img
              src={place.images[currentImageIndex]}
              alt={`${place.name} - ${currentImageIndex + 1}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent">
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <h1 className="text-4xl font-bold text-white mb-2">{place.name}</h1>
                <p className="text-white/80">{place.category_name}</p>
              </div>
            </div>
            {/* Navigation Controls */}
            {place.images.length > 1 && (
              <>
                {/* Navigation Arrows */}
                <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between p-4">
                  <button
                    onClick={handlePrevImage}
                    className="p-4 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/50"
                    aria-label="Previous image"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="p-4 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/50"
                    aria-label="Next image"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
                {/* Dot Indicators */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                  {place.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2.5 h-2.5 rounded-full transition-all duration-300 transform ${
                        index === currentImageIndex 
                          ? 'bg-white scale-125' 
                          : 'bg-white/50 hover:bg-white/75'
                      }`}
                      aria-label={`Go to image ${index + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
            {/* Image Counter */}
            <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/50 text-white text-sm">
              {currentImageIndex + 1} / {place.images.length}
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-800">
            <span className="text-gray-500">No images available</span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Location Information */}
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Location</h2>
            <p className="text-gray-600 dark:text-gray-300">{place.address}</p>
            <p className="text-gray-600 dark:text-gray-300 mt-2">{place.city}, {place.state}</p>
          </div>

          {/* Description */}
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">About</h2>
            <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{place.description}</p>
          </div>
        </div>

        {/* Key Information Section */}
        {place.key_info && place.key_info.length > 0 && (
          <div className="mt-12 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-center">Key Information</h2>
            <div className="space-y-4">
              {place.key_info.map((info, index) => (
                <details key={index} className="bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <summary className="px-4 py-3 cursor-pointer font-medium">
                    {info.question}
                  </summary>
                  <div className="px-4 py-3 text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-700">
                    {info.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlacePage; 