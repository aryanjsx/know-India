import { states, uts, INDIA } from '@aryanjsx/knowindia';

/**
 * Service to handle data from the knowindia package
 */
class IndiaDataService {
  /**
   * Get data for all states and union territories
   * @returns {Object} Combined data for all states and UTs
   */
  getAllData() {
    return INDIA();
  }

  /**
   * Get data for all states
   * @returns {Object} Data for all states
   */
  getAllStates() {
    return states();
  }

  /**
   * Get data for all union territories
   * @returns {Object} Data for all union territories
   */
  getAllUTs() {
    return uts();
  }

  /**
   * Get data for a specific state or union territory by its code
   * @param {string} code - The state or UT code (e.g., 'WB', 'DL')
   * @returns {Object|null} The state or UT data, or null if not found
   */
  getStateOrUTByCode(code) {
    if (!code) return null;
    
    const statesData = states();
    const utsData = uts();
    
    if (statesData[code]) {
      return statesData[code];
    }
    
    if (utsData[code]) {
      return utsData[code];
    }
    
    return null;
  }

  /**
   * Get data for a specific state or union territory by its name
   * @param {string} name - The state or UT name (e.g., 'West Bengal', 'Delhi')
   * @returns {Object|null} The state or UT data, or null if not found
   */
  getStateOrUTByName(name) {
    if (!name) return null;
    
    const formattedName = name.toLowerCase().replace(/-/g, ' ');
    // const allData = INDIA();
    const allStates = states();
    const allUTs = uts();
    
    // Check in states
    for (const code in allStates) {
      if (allStates[code].name.toLowerCase() === formattedName) {
        return { code, ...allStates[code] };
      }
    }
    
    // Check in UTs
    for (const code in allUTs) {
      if (allUTs[code].name.toLowerCase() === formattedName) {
        return { code, ...allUTs[code] };
      }
    }
    
    return null;
  }

  /**
   * Get the state or UT code from its name
   * @param {string} name - The state or UT name
   * @returns {string|null} The state or UT code, or null if not found
   */
  getCodeFromName(name) {
    if (!name) return null;
    
    const formattedName = name.toLowerCase().replace(/-/g, ' ');
    const allStates = states();
    const allUTs = uts();
    
    // Check in states
    for (const code in allStates) {
      if (allStates[code].name.toLowerCase() === formattedName) {
        return code;
      }
    }
    
    // Check in UTs
    for (const code in allUTs) {
      if (allUTs[code].name.toLowerCase() === formattedName) {
        return code;
      }
    }
    
    return null;
  }
}

// eslint-disable-next-line import/no-anonymous-default-export
export default new IndiaDataService(); 