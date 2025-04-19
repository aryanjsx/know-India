import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { states as knowIndiaStates, uts as knowIndiaUTs } from 'knowindia';
import { useTheme } from "../context/ThemeContext";
import { standardizeStateName } from "../utils/stateCodeMapping";
import "./StatePage.css"; // Import the CSS file

const StatePage = () => {
  const { stateName } = useParams();
  const [stateData, setStateData] = useState(null);
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [placeDetails, setPlaceDetails] = useState(null);
  const [loadingPlace, setLoadingPlace] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // Fetch place details
  const fetchPlaceDetails = async (placeId) => {
    try {
      setLoadingPlace(true);
      const response = await fetch(`https://knowindiaback.vercel.app/api/state/${stateName}/place/${placeId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch place details');
      }
      const data = await response.json();
      setPlaceDetails(data);
    } catch (error) {
      console.error('Error fetching place details:', error);
    } finally {
      setLoadingPlace(false);
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
        const apiUrl = `https://knowindiaback.vercel.app/api/places/state/${standardizedName}`;
        console.log('Fetching places from:', apiUrl);
        
        const response = await fetch(apiUrl);
        if (!response.ok) {
          const errorData = await response.json();
          console.error('API Error:', errorData);
          throw new Error(errorData.error || 'Failed to fetch places data');
        }
        
        const placesData = await response.json();
        console.log('Places data received:', placesData);
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
    if (!place) return null;

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>

          <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
            {loadingPlace ? (
              <div className="p-6">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500 mx-auto"></div>
              </div>
            ) : (
              <>
                {/* Image Slideshow */}
                <div className="relative h-96">
                  {place.images && place.images.length > 0 ? (
                    <img
                      src={place.images[0]}
                      alt={place.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                      <span className="text-gray-500">No image available</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent">
                    <div className="absolute bottom-0 left-0 right-0 p-8">
                      <h1 className="text-4xl font-bold text-white mb-2">{place.name}</h1>
                      <p className="text-white/80">{place.category_name}</p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {/* Location Information */}
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold mb-4">Location</h2>
                    <p className="text-gray-600 dark:text-gray-300">{place.address}</p>
                    <p className="text-gray-600 dark:text-gray-300 mt-2">{place.city}, {place.state}</p>
                  </div>

                  {/* Description */}
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold mb-4">About</h2>
                    <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{place.description}</p>
                  </div>

                  {/* Key Information */}
                  {place.key_info && place.key_info.length > 0 && (
                    <div className="mt-6">
                      <h2 className="text-2xl font-bold mb-4">Key Information</h2>
                      <div className="space-y-4">
                        {place.key_info.map((info, index) => (
                          <details key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <summary className="px-4 py-3 cursor-pointer font-medium">
                              {info.question}
                            </summary>
                            <div className="px-4 py-3 text-gray-600 dark:text-gray-300">
                              {info.answer}
                            </div>
                          </details>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={onClose}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </>
            )}
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
        
        {/* Debug section */}
        <div className={`mt-8 p-4 border rounded-lg max-w-2xl mx-auto ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <h2 className="text-xl font-semibold mb-2">Debug Information</h2>
          <p className="mb-2">State name from URL: <code className={`px-1 py-0.5 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>{stateName}</code></p>
          <p className="mb-2">Formatted state name: <code className={`px-1 py-0.5 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>{stateName.split("-").join(" ").toLowerCase()}</code></p>
          
          <div className="mt-4">
            <h3 className="font-medium mb-1">Available States:</h3>
            <div className={`grid grid-cols-2 gap-2 text-left text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {Object.entries(knowIndiaStates()).map(([code, data]) => (
                <div key={code} className={`p-1 ${isDark ? 'bg-gray-700/50' : 'bg-gray-100'} rounded`}>
                  <strong>{code}:</strong> {data.name}
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-4">
            <h3 className="font-medium mb-1">Available UTs:</h3>
            <div className={`grid grid-cols-2 gap-2 text-left text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {Object.entries(knowIndiaUTs()).map(([code, data]) => (
                <div key={code} className={`p-1 ${isDark ? 'bg-gray-700/50' : 'bg-gray-100'} rounded`}>
                  <strong>{code}:</strong> {data.name}
                </div>
              ))}
            </div>
          </div>
          
          <button 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => {
              // Try to load all states and UTs data
              try {
                const allStates = knowIndiaStates();
                const allUTs = knowIndiaUTs();
                
                console.log("All states:", allStates);
                console.log("All UTs:", allUTs);
                
                // Try to find a match
                const searchName = stateName.split("-").join(" ").toLowerCase();
                
                for (const code in allStates) {
                  if (allStates[code].name.toLowerCase().includes(searchName)) {
                    console.log(`Found potential match in states: ${code} - ${allStates[code].name}`);
                    setStateData({ ...allStates[code], code });
                    return;
                  }
                }
                
                for (const code in allUTs) {
                  if (allUTs[code].name.toLowerCase().includes(searchName)) {
                    console.log(`Found potential match in UTs: ${code} - ${allUTs[code].name}`);
                    setStateData({ ...allUTs[code], code });
                    return;
                  }
                }
                
                alert("No matching state or UT found in the knowindia package.");
              } catch (error) {
                console.error("Error in debug button:", error);
                alert("Error loading data. Check console for details.");
              }
            }}
          >
            Try to Find State Data
          </button>
        </div>
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
                    <button
                      onClick={() => {
                        setSelectedPlace(place);
                        fetchPlaceDetails(place.id);
                      }}
                      className="w-full px-4 py-2 bg-amber-500 text-white rounded hover:bg-amber-600 transition-colors"
                    >
                      Show More
                    </button>
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
