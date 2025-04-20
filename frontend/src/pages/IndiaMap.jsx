import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import IndiaMap from "react-svgmap-india";
import "./IndiaMap.css"; // We'll create this CSS file
import mandalaLogo from "../Assets/mandala logo.png";
import { useTheme } from "../context/ThemeContext";
import { states as knowIndiaStates, uts as knowIndiaUTs } from 'knowindia';
import { convertMapCodeToKnowIndia } from "../utils/stateCodeMapping";
import { API_CONFIG, getApiUrl } from '../config';

const IndiaMapComponent = () => {
  const [selectedState, setSelectedState] = useState("");
  const [statesList, setStatesList] = useState({});
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Initialize states list from knowindia package
  useEffect(() => {
    const fetchStates = async () => {
      try {
        const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.STATES));
        if (!response.ok) {
          throw new Error('Failed to fetch states');
        }
        const data = await response.json();
        setStatesList(data);
      } catch (error) {
        console.error('Error fetching states:', error);
      }
    };

    fetchStates();
  }, []);

  // Original states list as fallback
  const states = {
    'AN': 'Andaman and Nicobar Islands',
    'AP': 'Andhra Pradesh',
    'AR': 'Arunachal Pradesh',
    'AS': 'Assam',
    'BR': 'Bihar',
    'CH': 'Chandigarh',
    'CT': 'Chhattisgarh',
    'DD': 'Dadra and Nagar Haveli',
    'DL': 'Delhi',
    'DN': 'Daman and Diu',
    'GA': 'Goa',
    'GJ': 'Gujarat',
    'HP': 'Himachal Pradesh',
    'HR': 'Haryana',
    'JH': 'Jharkhand',
    'JK': 'Jammu and Kashmir',
    'KA': 'Karnataka',
    'KL': 'Kerala',
    'LA': 'Ladakh',
    'LD': 'Lakshadweep',
    'MH': 'Maharashtra',
    'ML': 'Meghalaya',
    'MN': 'Manipur',
    'MP': 'Madhya Pradesh',
    'MZ': 'Mizoram',
    'NL': 'Nagaland',
    'OR': 'Odisha',
    'PB': 'Punjab',
    'PY': 'Puducherry',
    'RJ': 'Rajasthan',
    'SK': 'Sikkim',
    'TG': 'Telangana',
    'TN': 'Tamil Nadu',
    'TR': 'Tripura',
    'UP': 'Uttar Pradesh',
    'UT': 'Uttarakhand',
    'WB': 'West Bengal'
  };

  const handleClick = (stateCode) => {
    // Use the combined list of states and UTs
    const stateName = statesList[stateCode] || states[stateCode] || stateCode;
    
    setSelectedState(stateName);

    // Convert the map state code to knowindia state code
    const knowIndiaCode = convertMapCodeToKnowIndia(stateCode);
    
    // Get the state data from the knowindia package
    let stateData = null;
    
    try {
      // Try to get state data from knowindia package
      const allStates = knowIndiaStates();
      const allUTs = knowIndiaUTs();
      
      if (allStates[knowIndiaCode]) {
        stateData = allStates[knowIndiaCode];
      } else if (allUTs[knowIndiaCode]) {
        stateData = allUTs[knowIndiaCode];
      }
    } catch (error) {
      console.error("Error getting state data:", error);
    }
    
    if (stateData) {
      // Format the state name for the URL
      const stateUrl = stateData.name.toLowerCase().replace(/\s+/g, "-");
      navigate(`/places/${stateUrl}`);
    } else {
      // Fallback to the original behavior if state data is not found
      const stateUrl = stateName.toLowerCase().replace(/\s+/g, "-");
      navigate(`/places/${stateUrl}`);
    }
  };

  const quotes = [
    { 
      text: "India is the cradle of the human race, the birthplace of human speech, the mother of history, the grandmother of legend, and the great-grandmother of tradition.", 
      author: "Mark Twain" 
    },
    { 
      text: "We owe a lot to the Indians, who taught us how to count, without which no worthwhile scientific discovery could have been made.", 
      author: "Albert Einstein" 
    },
    { 
      text: "If there is one place on the face of earth where all the dreams of living men have found a home from the very earliest days when man began the dream of existence, it is India.", 
      author: "Romain Rolland" 
    },
    { 
      text: "India is not a country, but a home; not a nation, but a family.", 
      author: "Mahatma Gandhi" 
    },
    { 
      text: "In India, I found a race of mortals living upon the Earth, but not adhering to it, inhabiting cities, but not being fixed to them, possessing everything, but possessed by nothing.", 
      author: "Apollonius Tyanaeus" 
    }
  ];

  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  
  // Change quote every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuoteIndex((prevIndex) => (prevIndex + 1) % quotes.length);
    }, 8000);
    
    return () => clearInterval(interval);
  }, [quotes.length]);

  return (
    <div className={`gradient-background py-8 px-4 flex flex-col items-center ${isDark ? 'dark-mode' : 'light-mode'}`}>
      <div className="decorative-corner top-left"></div>
      <div className="decorative-corner top-right"></div>
      <div className="decorative-corner bottom-left"></div>
      <div className="decorative-corner bottom-right"></div>
      
      <div className={`w-full max-w-5xl mx-auto p-6 mt-10 rounded-xl shadow-lg border ${isDark ? 'bg-gray-800/95 border-gray-700' : 'bg-white/95 border-gray-100'}`}>
        <div className="flex flex-col md:flex-row items-center mb-8">
          <div className="mandala-container mr-0 md:mr-6 mb-4 md:mb-0 relative">
            <img src={mandalaLogo} alt="Mandala Logo" className="w-24 h-24 mandala-logo relative z-10" />
            <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full -z-0 opacity-50`}></div>
          </div>
          <div className="flex flex-col items-center md:items-start">
            <h1 className={`text-4xl font-bold text-center md:text-left mb-2 ${isDark ? 'text-indigo-300' : 'text-indigo-900'}`}>Explore India's Diversity</h1>
            <div className="w-24 h-1 bg-orange-500 mb-6"></div>
            <p className={`text-lg text-center md:text-left max-w-3xl ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Discover the rich cultural heritage, breathtaking landscapes, and unique traditions of each Indian state.
              From the snow-capped Himalayas to the tropical beaches, from ancient temples to modern marvels - 
              India offers a world of experiences waiting to be explored.
            </p>
          </div>
        </div>

        <div className={`border-l-4 border-amber-500 p-4 mb-8 rounded-r-md relative overflow-hidden ${isDark ? 'bg-amber-900/30' : 'bg-amber-50'}`}>
          <div className="absolute top-0 right-0 w-24 h-24 opacity-5">
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <path d="M50,0 C77.6,0 100,22.4 100,50 C100,77.6 77.6,100 50,100 C22.4,100 0,77.6 0,50 C0,22.4 22.4,0 50,0 Z M50,10 C27.9,10 10,27.9 10,50 C10,72.1 27.9,90 50,90 C72.1,90 90,72.1 90,50 C90,27.9 72.1,10 50,10 Z M50,20 C66.5,20 80,33.5 80,50 C80,66.5 66.5,80 50,80 C33.5,80 20,66.5 20,50 C20,33.5 33.5,20 50,20 Z M50,30 C39.0,30 30,39.0 30,50 C30,61.0 39.0,70 50,70 C61.0,70 70,61.0 70,50 C70,39.0 61.0,30 50,30 Z M50,40 C55.5,40 60,44.5 60,50 C60,55.5 55.5,60 50,60 C44.5,60 40,55.5 40,50 C40,44.5 44.5,40 50,40 Z" fill="#e67e22"/>
            </svg>
          </div>
          <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-amber-300' : 'text-amber-800'}`}>How to Use This Map</h3>
          <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Simply click on any state or union territory on the map to explore its attractions, culture, and highlights.
            Each region is color-coded for easy identification. Hover over a state to see its outline highlighted.
          </p>
        </div>

        {selectedState && (
          <div className={`mb-6 p-4 rounded-md border text-center ${isDark ? 'bg-blue-900/30 border-blue-800' : 'bg-blue-50 border-blue-200'}`}>
            <h3 className="text-xl font-semibold">You selected: {selectedState}</h3>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Loading information about {selectedState}...</p>
          </div>
        )}
        
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="w-full md:w-1/3 mb-8 md:mb-0 pr-0 md:pr-8">
            <h2 className={`text-2xl font-bold mb-4 flex items-center ${isDark ? 'text-indigo-300' : 'text-indigo-800'}`}>
              <span className="w-2 h-8 bg-orange-500 mr-3 rounded-sm"></span>
              India: A Land of Diversity
            </h2>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="text-orange-500 mr-2">•</span>
                <span className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>28 States and 8 Union Territories</span>
              </li>
              <li className="flex items-start">
                <span className="text-orange-500 mr-2">•</span>
                <span className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Over 19,500 languages and dialects</span>
              </li>
              <li className="flex items-start">
                <span className="text-orange-500 mr-2">•</span>
                <span className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Diverse geography from mountains to deserts</span>
              </li>
              <li className="flex items-start">
                <span className="text-orange-500 mr-2">•</span>
                <span className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Rich cultural heritage spanning thousands of years</span>
              </li>
              <li className="flex items-start">
                <span className="text-orange-500 mr-2">•</span>
                <span className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Home to numerous UNESCO World Heritage sites</span>
              </li>
            </ul>
            
            <div className={`mt-8 quote-container ${isDark ? 'quote-container-dark' : 'quote-container-light'}`}>
              <div className="quote-header">
                <div className="quote-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path fillRule="evenodd" d="M4.804 21.644A6.707 6.707 0 006 21.75a6.721 6.721 0 003.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 01-.814 1.686.75.75 0 00.44 1.223zM8.25 10.875a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25zM10.875 12a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875-1.125a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className={`quote-title ${isDark ? 'text-indigo-300' : 'text-indigo-800'}`}>Voices on India</h3>
              </div>
              
              <div className="quote-content">
                {quotes.map((quote, index) => (
                  <div 
                    key={index} 
                    className={`quote-item ${currentQuoteIndex === index ? 'active' : 'inactive'}`}
                  >
                    <p className="quote-text">"{quote.text}"</p>
                    <div className="quote-author">
                      <div className="quote-author-line"></div>
                      <span>{quote.author}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="quote-navigation">
                {quotes.map((_, index) => (
                  <button 
                    key={index} 
                    className={`quote-nav-dot ${currentQuoteIndex === index ? 'active' : ''}`}
                    onClick={() => setCurrentQuoteIndex(index)}
                    aria-label={`View quote ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
          
          <div className="w-full md:w-2/3 flex justify-center">
            <div className="map-container relative">
              <IndiaMap
                onClick={handleClick}
                size="600px"
                mapColor="transparent"
                strokeColor={isDark ? "#cccccc" : "#333333"}
                strokeWidth="0.5"
                className={`colorful-india-map ${isDark ? 'dark-map' : ''}`}
              />
              <div className={`absolute bottom-4 right-4 px-3 py-1 rounded-full text-sm shadow-sm ${isDark ? 'bg-gray-700/80 text-gray-300' : 'bg-white/80 text-gray-600'}`}>
                Click on a state to explore
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );    
};

export default IndiaMapComponent;
