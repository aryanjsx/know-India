import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { states as knowIndiaStates, uts as knowIndiaUTs } from 'knowindia';
import { useTheme } from "../context/ThemeContext";
import { standardizeStateName } from "../utils/stateCodeMapping";
import { API_CONFIG, getApiUrl } from '../config';
import "./StatePage.css"; // Import the CSS file

const StatePage = () => {
  const { stateName } = useParams();
  const [stateData, setStateData] = useState(null);
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [placeDetails, setPlaceDetails] = useState(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // Fetch place details
  const fetchPlaceDetails = async (placeId) => {
    try {
      const response = await fetch(getApiUrl(`${API_CONFIG.ENDPOINTS.STATE_PLACE}/${stateName}/place/${placeId}`));
      if (!response.ok) {
        throw new Error('Failed to fetch place details');
      }
      const data = await response.json();
      
      // Ensure images is an array
      if (!Array.isArray(data.images)) {
        data.images = [data.images].filter(Boolean);
      }
      
      setPlaceDetails(data);
    } catch (error) {
      console.error('Error fetching place details:', error);
    }
  };
  
  useEffect(() => {
    const fetchData = async () => {
      try {
    // Format state name: replace hyphens with spaces and lowercase
    const formattedStateName = stateName
      .split("-")
      .join(" ")
      .toLowerCase();
    
    // Standardize the state name using our mapping utility
    const standardizedName = standardizeStateName(formattedStateName);
    
        // Get state data from knowindia package
      const allStates = knowIndiaStates();
      const allUTs = knowIndiaUTs();
      
      let foundStateData = null;
      
      // Check in states
      for (const code in allStates) {
          if (allStates[code].name.toLowerCase() === standardizedName.toLowerCase()) {
            foundStateData = { ...allStates[code], code };
            break;
          }
        }
        
        // Check in UTs if not found in states
        if (!foundStateData) {
          for (const code in allUTs) {
            if (allUTs[code].name.toLowerCase() === standardizedName.toLowerCase()) {
              foundStateData = { ...allUTs[code], code };
              break;
            }
          }
        }
        
        setStateData(foundStateData);
        
        // Fetch places data from backend
        const apiUrl = getApiUrl(`${API_CONFIG.ENDPOINTS.PLACES}/state/${standardizedName}`);
        const response = await fetch(apiUrl);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch places data');
        }
        
        const placesData = await response.json();
        setPlaces(placesData);
    } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
    }
    };
    
    fetchData();
  }, [stateName]);
  
  // Format state name for display: replace hyphens with spaces and capitalize each word
  const displayStateName = stateName
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  // Modal component for place details
  const PlaceDetailsModal = ({ place, onClose }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isAutoPlay, setIsAutoPlay] = useState(true);
    const [activeTab, setActiveTab] = useState('details');
    const timerRef = useRef(null);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
      if (place && place.images && place.images.length > 1 && isAutoPlay) {
        timerRef.current = setInterval(() => {
          setCurrentImageIndex((prev) => (prev + 1) % place.images.length);
        }, 5000);
      }
      return () => clearInterval(timerRef.current);
    }, [place, isAutoPlay]);

    const handleClose = () => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    };

    if (!place) return null;

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div 
          className={`fixed inset-0 bg-gradient-to-br from-indigo-900/90 to-purple-900/90 backdrop-blur-sm transition-opacity duration-300 ${
            isVisible ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={handleClose}
        />
        <div className="flex min-h-screen items-center justify-center p-4">
          <div 
            className={`relative w-full max-w-5xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300 ${
              isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
            }`}
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white backdrop-blur-sm hover:bg-white/20 transition-colors duration-200"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Image Slideshow */}
            <div className="relative h-[400px] overflow-hidden">
              {place.images && place.images.length > 0 ? (
                <>
                  <div className="relative h-full">
                    {place.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`${place.name} - ${index + 1}`}
                        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                          index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                        }`}
                      />
                    ))}
                  </div>
                  {/* Navigation Arrows */}
                  {place.images.length > 1 && (
                    <>
                      <button
                        onClick={() => setCurrentImageIndex((prev) => (prev - 1 + place.images.length) % place.images.length)}
                        className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white backdrop-blur-sm hover:bg-white/20 transition-colors duration-200"
                      >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setCurrentImageIndex((prev) => (prev + 1) % place.images.length)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white backdrop-blur-sm hover:bg-white/20 transition-colors duration-200"
                      >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </>
                  )}
                  {/* Dot Indicators */}
                  {place.images.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {place.images.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`h-2 w-2 rounded-full transition-all duration-300 ${
                            index === currentImageIndex ? 'bg-white scale-125' : 'bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="flex h-full items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
                  <span className="text-white">No images available</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <h1 className="text-4xl font-bold text-white mb-2">{place.name}</h1>
                  <p className="text-lg text-white/80">{place.category_name}</p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700">
              <div className="flex space-x-4 px-8">
                <button
                  onClick={() => setActiveTab('details')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === 'details'
                      ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  Details
                </button>
                <button
                  onClick={() => setActiveTab('map')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === 'map'
                      ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  Map View
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-8 space-y-8">
              {activeTab === 'details' ? (
                <>
                  {/* Location Information */}
                  <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                      <svg className="w-6 h-6 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Location
                    </h2>
                    <div className="space-y-2">
                      <p className="text-gray-600 dark:text-gray-300">{place.address}</p>
                      <p className="text-gray-600 dark:text-gray-300">{place.city}, {place.state}</p>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                      <svg className="w-6 h-6 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      About
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {place.description}
                    </p>
                  </div>

                  {/* Key Information */}
                  {place.keyInformation && place.keyInformation.length > 0 && (
                    <div className="space-y-4">
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                        <svg className="w-6 h-6 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Key Information
                      </h2>
                      <div className="space-y-4">
                        {place.keyInformation.map((info, index) => (
                          <div 
                            key={index} 
                            className="bg-black/80 rounded-lg overflow-hidden"
                          >
                            <details className="group">
                              <summary className="flex cursor-pointer items-center justify-between p-4">
                                <span className="font-medium text-orange-500">{info.question}</span>
                                <svg
                                  className="h-5 w-5 text-orange-500"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </summary>
                              <div className="p-4 text-white">
                                {info.answer}
                              </div>
                            </details>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="h-[400px] rounded-lg overflow-hidden">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3354.0547310286947!2d79.00022211458199!3d32.790808039368954!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3900c7efa402db97%3A0xd8aea36e31a06a4!2sHanle%20194404!5e0!3m2!1sen!2sin!4v1745128314108!5m2!1sen!2sin"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className={`state-page-wrapper min-h-[80vh] w-full flex flex-col items-center justify-center text-center py-20 ${isDark ? 'dark-mode' : 'light-mode'}`}>
        <div className="relative">
          <div className="ashoka-loader"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-white rounded-full opacity-0 animate-ping"></div>
          </div>
        </div>
        <h2 className="mt-8 text-2xl font-bold">Discovering {displayStateName}</h2>
        <p className="mt-2 text-lg opacity-75">Loading cultural heritage and attractions...</p>
        <div className="mt-6 w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-orange-500 via-white to-green-600 animate-shimmer"></div>
        </div>
      </div>
    );
  }

  if (!stateData) {
    return (
      <div className={`min-h-[80vh] w-full flex flex-col items-center justify-center text-center py-20 ${isDark ? 'dark-mode' : 'light-mode'}`}>
        <h1 className="text-3xl font-bold">{`Welcome to ${displayStateName}`}</h1>
        <p className={`text-lg mt-2 mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          We couldn't find detailed information about {displayStateName}. Please try another state or union territory.
        </p>
      </div>
    );
  }

  return (
    <div className={`state-page-wrapper min-h-[80vh] w-full py-12 px-4 ${isDark ? 'dark-mode' : 'light-mode'}`}>
      {/* Decorative floating elements */}
      <div className="floating-element floating-element-1"></div>
      <div className="floating-element floating-element-2"></div>
      
      <div className="max-w-6xl mx-auto state-page-content relative z-10">
        {/* Header */}
        <div className="state-header text-center mt-12 mb-12 p-8 text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {stateData.name}
          </h1>
          <div className="w-32 h-1 bg-white/50 mx-auto mb-6"></div>
          <p className="text-xl max-w-3xl mx-auto">
            Explore the rich culture, heritage, and attractions of {stateData.name}
          </p>
        </div>

        {/* About Section */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-12 p-6 rounded-lg shadow-md info-card">
          <div className="flex-grow">
            <h2 className="text-2xl font-semibold mb-4 section-header tricolor-accent">About {stateData.name}</h2>
            <p className="text-lg leading-relaxed mb-4">
              {stateData.name} is known for its {stateData.famousFor.slice(0, 3).join(", ")}.
              With a population of {stateData.population} and covering an area of {stateData.area},
              it is one of India's diverse and culturally rich {stateData.code && stateData.code.length === 2 ? "states" : "union territories"}.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="text-center">
                <div className="font-semibold">Capital</div>
                <div>{stateData.capital}</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">Languages</div>
                <div>{stateData.officialLanguages.length > 1 
                  ? `${stateData.officialLanguages[0]} +${stateData.officialLanguages.length - 1}` 
                  : stateData.officialLanguages[0]}
                </div>
              </div>
              <div className="text-center">
                <div className="font-semibold">Literacy</div>
                <div>{stateData.literacyRate}</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">Code</div>
                <div>{stateData.code || "N/A"}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <div className="p-6 rounded-lg shadow-md info-card">
            <h2 className="text-xl font-semibold mb-4 section-header tricolor-accent">Basic Information</h2>
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="font-medium mr-2">Capital:</span>
                <span>{stateData.capital}</span>
              </li>
              <li className="flex items-start">
                <span className="font-medium mr-2">Area:</span>
                <span>{stateData.area}</span>
              </li>
              <li className="flex items-start">
                <span className="font-medium mr-2">Population:</span>
                <span>{stateData.population}</span>
              </li>
              <li className="flex items-start">
                <span className="font-medium mr-2">Literacy Rate:</span>
                <span>{stateData.literacyRate}</span>
              </li>
            </ul>
          </div>

          <div className="p-6 rounded-lg shadow-md info-card">
            <h2 className="text-xl font-semibold mb-4 section-header tricolor-accent">Languages & Symbols</h2>
            <ul className="space-y-2">
              <li className="flex flex-col">
                <span className="font-medium">Official Languages:</span>
                <span>{stateData.officialLanguages.join(", ")}</span>
              </li>
              {stateData.stateAnimal && (
                <li className="flex items-start">
                  <span className="font-medium mr-2">State Animal:</span>
                  <span>{stateData.stateAnimal}</span>
                </li>
              )}
              {stateData.utAnimal && (
                <li className="flex items-start">
                  <span className="font-medium mr-2">UT Animal:</span>
                  <span>{stateData.utAnimal}</span>
                </li>
              )}
              {stateData.stateBird && (
                <li className="flex items-start">
                  <span className="font-medium mr-2">State Bird:</span>
                  <span>{stateData.stateBird}</span>
                </li>
              )}
              {stateData.utBird && (
                <li className="flex items-start">
                  <span className="font-medium mr-2">UT Bird:</span>
                  <span>{stateData.utBird}</span>
                </li>
              )}
              {stateData.stateFlower && (
                <li className="flex items-start">
                  <span className="font-medium mr-2">State Flower:</span>
                  <span>{stateData.stateFlower}</span>
                </li>
              )}
              {stateData.utFlower && (
                <li className="flex items-start">
                  <span className="font-medium mr-2">UT Flower:</span>
                  <span>{stateData.utFlower}</span>
                </li>
              )}
              {stateData.stateTree && (
                <li className="flex items-start">
                  <span className="font-medium mr-2">State Tree:</span>
                  <span>{stateData.stateTree}</span>
                </li>
              )}
              {stateData.utTree && (
                <li className="flex items-start">
                  <span className="font-medium mr-2">UT Tree:</span>
                  <span>{stateData.utTree}</span>
                </li>
              )}
            </ul>
          </div>

          <div className="p-6 rounded-lg shadow-md info-card">
            <h2 className="text-xl font-semibold mb-4 section-header tricolor-accent">Famous For</h2>
            <ul className="list-disc pl-5 space-y-1">
              {stateData.famousFor.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="decorative-line"></div>

        {/* History */}
        <div className="mb-12 p-6 rounded-lg shadow-md info-card">
          <h2 className="text-2xl font-semibold mb-4 section-header tricolor-accent">History</h2>
          <p className="text-lg leading-relaxed">{stateData.history}</p>
        </div>

        {/* Culture Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Festivals */}
          <div className="p-6 rounded-lg shadow-md info-card">
            <h2 className="text-2xl font-semibold mb-4 section-header tricolor-accent">Festivals</h2>
            <ul className="list-disc pl-5 space-y-2">
              {stateData.festivals.map((festival, index) => (
                <li key={index} className="text-lg">{festival}</li>
              ))}
            </ul>
          </div>

          {/* Cuisine */}
          <div className="p-6 rounded-lg shadow-md info-card">
            <h2 className="text-2xl font-semibold mb-4 section-header tricolor-accent">Cuisine</h2>
            <ul className="list-disc pl-5 space-y-2">
              {stateData.cuisine.map((dish, index) => (
                <li key={index} className="text-lg">{dish}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="decorative-line"></div>

        {/* Tourist Attractions */}
        <div className="mb-12 p-6 rounded-lg shadow-md info-card">
          <h2 className="text-2xl font-semibold mb-4 section-header tricolor-accent">Tourist Attractions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {stateData.touristAttractions.map((attraction, index) => (
              <div key={index} className="p-4 rounded-md attraction-card shadow">
                <h3 className="text-lg font-medium">{attraction.name}</h3>
                <p className="text-sm opacity-75">{attraction.type}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="decorative-line"></div>

        {/* Places Section */}
        {places.length > 0 && (
          <div className="mt-16">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold mb-4 inline-block relative">
                Places to Visit in {stateData.name}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-orange-500"></div>
              </h2>
              <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Discover the unique attractions and hidden gems that make {stateData.name} special
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {places.map((place) => (
                <div
                  key={place.id}
                  className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="relative h-48 group">
                    {place.images && place.images.length > 0 ? (
                      <img
                        src={place.images[0]}
                        alt={place.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                        <span className="text-gray-500">No image available</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-4 left-4">
                        <span className="bg-amber-500 text-white px-2 py-1 rounded text-sm">
                          {place.category_name}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="text-xl font-bold mb-2">{place.name}</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                      {place.description}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedPlace(place);
                          fetchPlaceDetails(place.id);
                        }}
                        className="flex-1 px-4 py-2 bg-amber-500 text-white rounded hover:bg-amber-600 transition-colors"
                      >
                        Show More
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="decorative-line"></div>

        {/* Interesting Facts */}
        <div className="p-6 rounded-lg shadow-md info-card">
          <h2 className="text-2xl font-semibold mb-4 section-header tricolor-accent">Interesting Facts</h2>
          <ul className="list-disc pl-5 space-y-2">
            {stateData.interestingFacts.map((fact, index) => (
              <li key={index} className="text-lg">{fact}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Place Details Modal */}
      {selectedPlace && (
        <PlaceDetailsModal
          place={placeDetails || selectedPlace}
          onClose={() => {
            setSelectedPlace(null);
            setPlaceDetails(null);
          }}
        />
      )}
    </div>
  );
};

export default StatePage;
