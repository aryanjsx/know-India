/**
 * Embedding Service using FAISS and Xenova Transformers
 * Provides vector search for tourist places
 */

const { IndexFlatL2 } = require('faiss-node');
const { states, uts } = require('@aryanjsx/knowindia');

// Transformer pipeline will be loaded dynamically
let pipeline = null;
let embeddingModel = null;

// FAISS index and place data
let faissIndex = null;
let placesData = [];
let isInitialized = false;
let isInitializing = false;

// Embedding dimension for all-MiniLM-L6-v2
const EMBEDDING_DIM = 384;

/**
 * Load the transformer model
 */
async function loadModel() {
  if (embeddingModel) return embeddingModel;
  
  console.log('Loading embedding model: Xenova/all-MiniLM-L6-v2...');
  
  // Dynamic import for ES module
  const { pipeline: transformerPipeline } = await import('@xenova/transformers');
  pipeline = transformerPipeline;
  
  // Load the feature-extraction pipeline
  embeddingModel = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  
  console.log('Embedding model loaded successfully!');
  return embeddingModel;
}

/**
 * Generate embedding for a text string
 */
async function generateEmbedding(text) {
  if (!embeddingModel) {
    await loadModel();
  }
  
  // Generate embedding
  const output = await embeddingModel(text, { pooling: 'mean', normalize: true });
  
  // Convert to array
  return Array.from(output.data);
}

/**
 * Build searchable text for a place
 */
function buildPlaceSearchText(place, stateName, stateData) {
  const parts = [
    place.name,
    place.type || '',
    place.city || place.district || '',
    stateName,
    stateData.region || '',
    ...(stateData.famousFor || []),
  ];
  
  // Add keywords based on type
  const typeKeywords = getTypeKeywords(place.type || '');
  parts.push(...typeKeywords);
  
  return parts.filter(p => p).join(' ').toLowerCase();
}

/**
 * Get additional keywords based on place type
 */
function getTypeKeywords(type) {
  const typeLower = type.toLowerCase();
  const keywords = [];
  
  if (typeLower.includes('beach')) {
    keywords.push('beach', 'sea', 'ocean', 'coastal', 'sand', 'water', 'swim', 'relaxation');
  }
  if (typeLower.includes('temple') || typeLower.includes('religious')) {
    keywords.push('temple', 'spiritual', 'worship', 'religion', 'pilgrimage', 'sacred', 'prayer');
  }
  if (typeLower.includes('fort') || typeLower.includes('palace') || typeLower.includes('historical')) {
    keywords.push('heritage', 'history', 'ancient', 'architecture', 'monument', 'royal', 'culture');
  }
  if (typeLower.includes('hill') || typeLower.includes('mountain')) {
    keywords.push('hill', 'mountain', 'scenic', 'view', 'cool', 'nature', 'trekking', 'peaceful');
  }
  if (typeLower.includes('wildlife') || typeLower.includes('sanctuary') || typeLower.includes('national park')) {
    keywords.push('wildlife', 'animals', 'safari', 'nature', 'birds', 'forest', 'adventure');
  }
  if (typeLower.includes('waterfall')) {
    keywords.push('waterfall', 'nature', 'scenic', 'photography', 'trekking', 'adventure');
  }
  if (typeLower.includes('lake') || typeLower.includes('backwater')) {
    keywords.push('lake', 'water', 'boating', 'peaceful', 'scenic', 'nature', 'relaxation');
  }
  
  return keywords;
}

/**
 * Load all places from KnowIndia and build FAISS index
 */
async function initializeIndex() {
  if (isInitialized) return true;
  if (isInitializing) {
    // Wait for initialization to complete
    while (isInitializing) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return isInitialized;
  }
  
  isInitializing = true;
  
  try {
    console.log('Initializing FAISS index with KnowIndia places...');
    
    // Load the model first
    await loadModel();
    
    // Get all states and UTs
    const allStates = states();
    const allUts = uts();
    
    // Collect all places
    placesData = [];
    
    // Process states
    for (const [code, stateData] of Object.entries(allStates)) {
      const attractions = [
        ...(stateData.touristAttractions || []),
        ...(stateData.tourismHighlights || []),
      ];
      
      for (const place of attractions) {
        const searchText = buildPlaceSearchText(place, stateData.name, stateData);
        placesData.push({
          id: placesData.length,
          name: place.name,
          type: place.type,
          location: place.city || place.district || '',
          state: stateData.name,
          stateCode: code,
          region: stateData.region,
          searchText: searchText,
        });
      }
    }
    
    // Process union territories
    for (const [code, utData] of Object.entries(allUts)) {
      const attractions = [
        ...(utData.touristAttractions || []),
        ...(utData.tourismHighlights || []),
      ];
      
      for (const place of attractions) {
        const searchText = buildPlaceSearchText(place, utData.name, utData);
        placesData.push({
          id: placesData.length,
          name: place.name,
          type: place.type,
          location: place.city || place.district || '',
          state: utData.name,
          stateCode: code,
          region: utData.region || 'India',
          searchText: searchText,
        });
      }
    }
    
    console.log(`Loaded ${placesData.length} places from KnowIndia`);
    
    // Generate embeddings for all places
    console.log('Generating embeddings for all places...');
    const embeddings = [];
    
    for (let i = 0; i < placesData.length; i++) {
      const embedding = await generateEmbedding(placesData[i].searchText);
      embeddings.push(embedding);
      
      // Progress log every 50 places
      if ((i + 1) % 50 === 0) {
        console.log(`Generated embeddings: ${i + 1}/${placesData.length}`);
      }
    }
    
    console.log('Building FAISS index...');
    
    // Create FAISS index
    faissIndex = new IndexFlatL2(EMBEDDING_DIM);
    
    // Add all embeddings to the index
    for (const embedding of embeddings) {
      faissIndex.add(embedding);
    }
    
    console.log(`FAISS index built with ${faissIndex.ntotal()} vectors`);
    
    isInitialized = true;
    isInitializing = false;
    
    return true;
  } catch (error) {
    console.error('Error initializing FAISS index:', error);
    isInitializing = false;
    throw error;
  }
}

/**
 * Search for places using vector similarity
 * @param {string} query - Search query
 * @param {number} topK - Number of results to return
 * @param {string} destinationFilter - Optional: filter by destination/state
 * @returns {Array} Array of matching places with scores
 */
async function searchPlaces(query, topK = 10, destinationFilter = null) {
  if (!isInitialized) {
    await initializeIndex();
  }
  
  // Generate query embedding
  const queryEmbedding = await generateEmbedding(query.toLowerCase());
  
  // Search in FAISS
  // We search for more results if filtering, to ensure we get enough matches
  const searchK = destinationFilter ? Math.min(topK * 5, placesData.length) : topK;
  const results = faissIndex.search(queryEmbedding, searchK);
  
  // Map results to place data
  let matchedPlaces = [];
  
  for (let i = 0; i < results.labels.length; i++) {
    const placeId = results.labels[i];
    const distance = results.distances[i];
    
    if (placeId >= 0 && placeId < placesData.length) {
      const place = placesData[placeId];
      
      // Apply destination filter if provided
      if (destinationFilter) {
        const filterLower = destinationFilter.toLowerCase();
        const stateLower = place.state.toLowerCase();
        
        // Check if destination matches
        if (!stateLower.includes(filterLower) && !filterLower.includes(stateLower)) {
          continue;
        }
      }
      
      matchedPlaces.push({
        ...place,
        score: 1 / (1 + distance), // Convert distance to similarity score (0-1)
        distance: distance,
      });
    }
  }
  
  // Limit to topK after filtering
  matchedPlaces = matchedPlaces.slice(0, topK);
  
  return matchedPlaces;
}

/**
 * Get all places for a specific state/UT
 */
function getPlacesByState(stateName) {
  const stateLower = stateName.toLowerCase();
  return placesData.filter(place => 
    place.state.toLowerCase().includes(stateLower) ||
    stateLower.includes(place.state.toLowerCase())
  );
}

/**
 * Check if index is ready
 */
function isReady() {
  return isInitialized;
}

/**
 * Get index stats
 */
function getStats() {
  return {
    isInitialized,
    totalPlaces: placesData.length,
    indexSize: faissIndex ? faissIndex.ntotal() : 0,
  };
}

module.exports = {
  initializeIndex,
  searchPlaces,
  generateEmbedding,
  getPlacesByState,
  isReady,
  getStats,
};
