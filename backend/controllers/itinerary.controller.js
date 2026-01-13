const axios = require('axios');
const { connectToDatabase } = require('../utils/db');
const { v4: uuidv4 } = require('uuid');
const PDFDocument = require('pdfkit');

// Load knowindia package with graceful fallback
let states = null;
let uts = null;
try {
  const knowindia = require('@aryanjsx/knowindia');
  states = knowindia.states;
  uts = knowindia.uts;
  console.log('KnowIndia loaded in itinerary controller');
} catch (err) {
  console.error('KnowIndia not available in controller:', err.message);
}

// Load embedding service with graceful fallback
let embeddingService = null;
try {
  embeddingService = require('../services/embeddingService');
} catch (err) {
  console.error('Embedding service not available:', err.message);
}

/**
 * Find state data by name (fuzzy matching)
 */
function findStateByName(destination) {
  if (!states || !uts) {
    console.error('KnowIndia package not available');
    return null;
  }
  
  const allStates = states();
  const allUts = uts();
  
  // Normalize the destination
  const normalizedDest = destination.toLowerCase().trim();
  
  // Search in states
  for (const [code, stateData] of Object.entries(allStates)) {
    if (stateData.name && stateData.name.toLowerCase() === normalizedDest) {
      return { data: stateData, type: 'state', code };
    }
    // Check if destination contains state name or vice versa
    if (stateData.name && (
      normalizedDest.includes(stateData.name.toLowerCase()) ||
      stateData.name.toLowerCase().includes(normalizedDest)
    )) {
      return { data: stateData, type: 'state', code };
    }
    // Check capital
    if (stateData.capital && normalizedDest.includes(stateData.capital.toLowerCase())) {
      return { data: stateData, type: 'state', code };
    }
  }
  
  // Search in union territories
  for (const [code, utData] of Object.entries(allUts)) {
    if (utData.name && utData.name.toLowerCase() === normalizedDest) {
      return { data: utData, type: 'ut', code };
    }
    if (utData.name && (
      normalizedDest.includes(utData.name.toLowerCase()) ||
      utData.name.toLowerCase().includes(normalizedDest)
    )) {
      return { data: utData, type: 'ut', code };
    }
    if (utData.capital && normalizedDest.includes(utData.capital.toLowerCase())) {
      return { data: utData, type: 'ut', code };
    }
  }
  
  return null;
}

/**
 * Build search query from user inputs
 */
function buildSearchQuery(destination, interests, travelType, budget) {
  const parts = [destination];
  
  // Add interests
  if (interests) {
    if (Array.isArray(interests)) {
      parts.push(...interests);
    } else {
      parts.push(interests);
    }
  }
  
  // Add travel type context
  if (travelType) {
    parts.push(travelType);
    
    // Add contextual keywords based on travel type
    const travelTypeLower = travelType.toLowerCase();
    if (travelTypeLower.includes('family')) {
      parts.push('family-friendly', 'kids', 'safe', 'comfortable');
    } else if (travelTypeLower.includes('couple') || travelTypeLower.includes('honeymoon')) {
      parts.push('romantic', 'peaceful', 'scenic', 'beautiful');
    } else if (travelTypeLower.includes('solo')) {
      parts.push('adventure', 'exploration', 'backpacking');
    } else if (travelTypeLower.includes('group') || travelTypeLower.includes('friends')) {
      parts.push('fun', 'adventure', 'group activities');
    }
  }
  
  // Add budget context
  if (budget) {
    const budgetLower = budget.toLowerCase();
    if (budgetLower.includes('low') || budgetLower.includes('budget')) {
      parts.push('affordable', 'budget-friendly');
    } else if (budgetLower.includes('high') || budgetLower.includes('luxury')) {
      parts.push('luxury', 'premium', 'exclusive');
    }
  }
  
  return parts.filter(p => p && p.trim()).join(' ');
}

/**
 * Build verified places block for prompt
 */
function buildVerifiedPlacesBlock(places) {
  if (places.length === 0) {
    return null;
  }
  
  let block = 'VERIFIED PLACES (You must ONLY use these places):\n';
  places.forEach((place, index) => {
    block += `${index + 1}. ${place.name} (${place.type})${place.location ? ` - ${place.location}` : ''} [${place.state}]\n`;
  });
  
  return block;
}

/**
 * Generate AI-powered travel itinerary using Vector Search + Hugging Face
 * POST /api/itinerary
 */
async function generateItinerary(req, res) {
  try {
    const { destination, days, budget, interests, travelType } = req.body;

    // Validate required fields
    const errors = [];
    if (!destination || typeof destination !== 'string' || destination.trim().length === 0) {
      errors.push('Destination is required');
    }
    if (!days || isNaN(days) || days < 1 || days > 30) {
      errors.push('Days must be a number between 1 and 30');
    }
    if (!budget || typeof budget !== 'string' || budget.trim().length === 0) {
      errors.push('Budget is required (e.g., "low", "medium", "high", or specific amount)');
    }
    if (!travelType || typeof travelType !== 'string' || travelType.trim().length === 0) {
      errors.push('Travel type is required (e.g., "solo", "couple", "family", "group")');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        error: 'Validation failed',
        messages: errors,
      });
    }

    // Check for API key
    const apiKey = process.env.HUGGINGFACE_API_KEY;
    if (!apiKey) {
      console.error('HUGGINGFACE_API_KEY is not configured');
      return res.status(500).json({
        error: 'Configuration error',
        message: 'AI service is not configured. Please contact the administrator.',
      });
    }

    // Find state/UT data from knowindia package
    const stateResult = findStateByName(destination);
    
    if (!stateResult) {
      return res.status(404).json({
        error: 'Destination not found',
        message: `No verified data available for "${destination}". Please provide a valid Indian state or union territory name.`,
        suggestion: 'Try destinations like: Kerala, Rajasthan, Goa, Delhi, Maharashtra, etc.',
      });
    }

    const stateData = stateResult.data;

    // Build search query for vector search
    const searchQuery = buildSearchQuery(
      stateData.name,
      interests,
      travelType,
      budget
    );
    
    console.log(`Search query: "${searchQuery}"`);

    // Use vector search to find relevant places (with fallback)
    const topK = Math.min(Math.max(days * 4, 10), 20); // 4 places per day, min 10, max 20
    let matchedPlaces = [];
    
    if (embeddingService) {
      matchedPlaces = await embeddingService.searchPlaces(
        searchQuery,
        topK,
        stateData.name // Filter by destination state
      );

      if (matchedPlaces.length === 0) {
        // Fallback: get all places for the state
        const statePlaces = embeddingService.getPlacesByState(stateData.name);
        matchedPlaces = statePlaces.slice(0, 10);
      }
    } else {
      // Fallback when embedding service not available - use state attractions directly
      const attractions = [
        ...(stateData.touristAttractions || []),
        ...(stateData.tourismHighlights || []),
      ];
      
      matchedPlaces = attractions.slice(0, topK).map((place, idx) => ({
        id: idx,
        name: place.name,
        type: place.type,
        location: place.city || place.district || '',
        state: stateData.name,
        score: 1,
      }));
    }
    
    if (matchedPlaces.length === 0) {
      return res.status(404).json({
        error: 'No places found',
        message: `No verified places found for ${stateData.name}.`,
      });
    }

    // Build verified places block
    const verifiedPlacesBlock = buildVerifiedPlacesBlock(matchedPlaces);

    // Build the prompt with verified data
    const interestsText = Array.isArray(interests) 
      ? interests.join(', ') 
      : interests || 'general sightseeing';

    const prompt = `<s>[INST] You are a professional Indian travel planner with extensive knowledge of ${stateData.name}.

IMPORTANT: You must ONLY use the verified places listed below. Do NOT invent, assume, or add any new places that are not in this list.

${verifiedPlacesBlock}

State Information:
- Name: ${stateData.name}
- Capital: ${stateData.capital}
- Region: ${stateData.region || 'India'}
- Famous For: ${(stateData.famousFor || []).join(', ')}
- Local Cuisine: ${(stateData.cuisine || []).slice(0, 5).join(', ')}

User Requirements:
- Number of Days: ${days}
- Budget: ${budget.trim()}
- Travel Type: ${travelType.trim()}
- Interests: ${interestsText}

Create a detailed day-wise itinerary using ONLY the verified places listed above.

Include for each day:
1. Morning, afternoon, and evening activities
2. Specific places from the verified list only
3. Food recommendations from local cuisine
4. Estimated costs in INR
5. Travel tips

Return ONLY a valid JSON object with this exact structure:
{
  "destination": "${stateData.name}",
  "totalDays": ${days},
  "budget": "${budget.trim()}",
  "usedPlaces": ["list of place names actually used from verified list"],
  "itinerary": [
    {
      "day": 1,
      "title": "Day title",
      "activities": [
        {
          "time": "Morning/Afternoon/Evening",
          "activity": "Description",
          "place": "Place name from verified list",
          "estimatedCost": "Cost in INR"
        }
      ],
      "meals": {
        "breakfast": "recommendation",
        "lunch": "recommendation",
        "dinner": "recommendation"
      },
      "tip": "Daily tip"
    }
  ],
  "generalTips": ["tip1", "tip2"],
  "totalEstimatedBudget": "Range in INR"
}

Only return the JSON object, no additional text. [/INST]</s>`;

    console.log(`Generating itinerary for ${stateData.name}, ${days} days, ${matchedPlaces.length} vector-matched places`);

    // Call Hugging Face Inference API
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2',
      {
        inputs: prompt,
        parameters: {
          max_new_tokens: 2048,
          temperature: 0.7,
          top_p: 0.95,
          return_full_text: false,
          do_sample: true,
        },
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 120000, // 2 minute timeout for AI generation
      }
    );

    // Extract the generated text
    let generatedText = '';
    if (Array.isArray(response.data) && response.data.length > 0) {
      generatedText = response.data[0].generated_text || '';
    } else if (typeof response.data === 'string') {
      generatedText = response.data;
    } else if (response.data.generated_text) {
      generatedText = response.data.generated_text;
    }

    if (!generatedText) {
      console.error('Empty response from Hugging Face API');
      return res.status(500).json({
        error: 'AI generation failed',
        message: 'The AI model returned an empty response. Please try again.',
      });
    }

    // Try to parse JSON from the response
    let itineraryData = null;
    try {
      // Try to extract JSON from the response
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        itineraryData = JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.log('Could not parse JSON, returning raw text');
      // If JSON parsing fails, return the raw text with metadata
      itineraryData = {
        rawResponse: generatedText,
        destination: stateData.name,
        days: days,
        note: 'AI response could not be parsed as JSON. Raw response provided.',
      };
    }

    console.log(`Successfully generated itinerary for ${stateData.name}`);

    // Return structured response with vector search info
    res.json({
      success: true,
      query: searchQuery,
      destination: stateData.name,
      days: parseInt(days),
      matchedPlaces: matchedPlaces.map(p => ({
        name: p.name,
        type: p.type,
        location: p.location,
        state: p.state,
        relevanceScore: Math.round(p.score * 100) / 100,
      })),
      stateInfo: {
        capital: stateData.capital,
        region: stateData.region,
        famousFor: stateData.famousFor,
        cuisine: stateData.cuisine,
      },
      itinerary: itineraryData,
    });

  } catch (err) {
    console.error('Error generating itinerary:', err.message);

    // Handle specific Hugging Face API errors
    if (err.response) {
      const status = err.response.status;
      
      if (status === 401) {
        return res.status(500).json({
          error: 'Authentication failed',
          message: 'Invalid API key. Please check the configuration.',
        });
      }
      
      if (status === 503) {
        return res.status(503).json({
          error: 'Model loading',
          message: 'The AI model is currently loading. Please try again in 20-30 seconds.',
          retryAfter: 30,
        });
      }
      
      if (status === 429) {
        return res.status(429).json({
          error: 'Rate limited',
          message: 'Too many requests. Please wait a moment and try again.',
        });
      }
    }

    // Handle timeout
    if (err.code === 'ECONNABORTED') {
      return res.status(504).json({
        error: 'Timeout',
        message: 'The AI took too long to respond. Please try again with a simpler request.',
      });
    }

    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to generate itinerary. Please try again later.',
      details: err.message,
    });
  }
}

/**
 * Search places using vector similarity
 * POST /api/itinerary/search
 */
async function searchPlaces(req, res) {
  try {
    const { query, destination, limit = 10 } = req.body;
    
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Query is required',
      });
    }
    
    if (!embeddingService) {
      return res.status(503).json({
        error: 'Service unavailable',
        message: 'Search service is not available on this deployment.',
      });
    }
    
    const results = await embeddingService.searchPlaces(
      query.trim(),
      Math.min(parseInt(limit) || 10, 50),
      destination || null
    );
    
    res.json({
      success: true,
      query: query.trim(),
      destination: destination || 'All India',
      count: results.length,
      results: results.map(p => ({
        name: p.name,
        type: p.type,
        location: p.location,
        state: p.state,
        region: p.region,
        relevanceScore: Math.round(p.score * 100) / 100,
      })),
    });
  } catch (err) {
    console.error('Error searching places:', err.message);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to search places.',
    });
  }
}

/**
 * Get available states and their attraction types
 * GET /api/itinerary/destinations
 */
async function getDestinations(req, res) {
  try {
    if (!states || !uts) {
      return res.status(503).json({
        error: 'Service unavailable',
        message: 'Destination data is not available.',
      });
    }
    
    const allStates = states();
    const allUts = uts();
    
    const destinations = [];
    
    // Add states
    for (const [code, stateData] of Object.entries(allStates)) {
      const attractions = stateData.touristAttractions || stateData.tourismHighlights || [];
      destinations.push({
        name: stateData.name,
        code: code,
        type: 'state',
        capital: stateData.capital,
        region: stateData.region,
        attractionCount: attractions.length,
        availableTypes: [...new Set(attractions.map(a => a.type))],
      });
    }
    
    // Add union territories
    for (const [code, utData] of Object.entries(allUts)) {
      const attractions = utData.touristAttractions || utData.tourismHighlights || [];
      destinations.push({
        name: utData.name,
        code: code,
        type: 'ut',
        capital: utData.capital,
        attractionCount: attractions.length,
        availableTypes: [...new Set(attractions.map(a => a.type))],
      });
    }
    
    // Get embedding service stats (if available)
    const embeddingStats = embeddingService ? embeddingService.getStats() : { isInitialized: false, totalPlaces: 0 };
    
    res.json({
      success: true,
      count: destinations.length,
      vectorSearch: {
        enabled: !!embeddingService,
        isReady: embeddingStats.isInitialized,
        totalPlacesIndexed: embeddingStats.totalPlaces,
        searchMode: embeddingStats.searchMode || 'text',
      },
      destinations: destinations.sort((a, b) => a.name.localeCompare(b.name)),
    });
  } catch (err) {
    console.error('Error fetching destinations:', err.message);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch destinations.',
    });
  }
}

/**
 * Get vector search status
 * GET /api/itinerary/status
 */
async function getStatus(req, res) {
  try {
    const stats = embeddingService ? embeddingService.getStats() : {
      isInitialized: false,
      totalPlaces: 0,
      indexSize: 0,
      faissAvailable: false,
      transformersAvailable: false,
      searchMode: 'unavailable',
    };
    
    res.json({
      success: true,
      vectorSearch: {
        isReady: stats.isInitialized,
        totalPlacesIndexed: stats.totalPlaces,
        indexSize: stats.indexSize,
        model: stats.transformersAvailable ? 'Xenova/all-MiniLM-L6-v2' : 'text-based',
        embeddingDimension: stats.faissAvailable ? 384 : 0,
        searchMode: stats.searchMode || 'text',
        faissAvailable: stats.faissAvailable || false,
      },
    });
  } catch (err) {
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get status.',
    });
  }
}

/**
 * Ensure itineraries table exists
 */
async function ensureItinerariesTableExists() {
  const db = await connectToDatabase();
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS itineraries (
      id VARCHAR(36) PRIMARY KEY,
      user_id INT,
      destination VARCHAR(255) NOT NULL,
      days INT NOT NULL,
      budget VARCHAR(50) NOT NULL,
      travel_type VARCHAR(50) NOT NULL,
      interests JSON,
      query TEXT,
      matched_places JSON,
      state_info JSON,
      itinerary_data JSON NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `;
  await db.execute(createTableQuery);
}

/**
 * Save itinerary to database
 * POST /api/itinerary/save
 */
async function saveItinerary(req, res) {
  try {
    const {
      destination,
      days,
      budget,
      travelType,
      interests,
      query,
      matchedPlaces,
      stateInfo,
      itinerary,
    } = req.body;

    // Validate required fields
    if (!destination || !days || !itinerary) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Destination, days, and itinerary data are required.',
      });
    }

    // Ensure table exists
    await ensureItinerariesTableExists();

    const db = await connectToDatabase();
    
    // Generate unique ID
    const id = uuidv4();
    
    // Get user ID if authenticated (optional)
    const userId = req.user?.id || null;

    // Insert into database
    const insertQuery = `
      INSERT INTO itineraries (
        id, user_id, destination, days, budget, travel_type, 
        interests, query, matched_places, state_info, itinerary_data
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await db.execute(insertQuery, [
      id,
      userId,
      destination,
      parseInt(days),
      budget || 'medium',
      travelType || 'couple',
      JSON.stringify(interests || []),
      query || '',
      JSON.stringify(matchedPlaces || []),
      JSON.stringify(stateInfo || {}),
      JSON.stringify(itinerary),
    ]);

    // Generate share URL
    const shareUrl = `https://knowindia.in/itinerary/${id}`;

    console.log(`Itinerary saved: ${id} for ${destination}`);

    res.status(201).json({
      success: true,
      id,
      shareUrl,
      message: 'Itinerary saved successfully',
    });

  } catch (err) {
    console.error('Error saving itinerary:', err.message);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to save itinerary.',
      details: err.message,
    });
  }
}

/**
 * Get itinerary by ID
 * GET /api/itinerary/:id
 */
async function getItineraryById(req, res) {
  try {
    const { id } = req.params;

    if (!id || id.length !== 36) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Invalid itinerary ID format.',
      });
    }

    // Ensure table exists
    await ensureItinerariesTableExists();

    const db = await connectToDatabase();

    const [rows] = await db.execute(
      'SELECT * FROM itineraries WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Itinerary not found.',
      });
    }

    const itinerary = rows[0];

    // Parse JSON fields
    const result = {
      id: itinerary.id,
      destination: itinerary.destination,
      days: itinerary.days,
      budget: itinerary.budget,
      travelType: itinerary.travel_type,
      interests: JSON.parse(itinerary.interests || '[]'),
      query: itinerary.query,
      matchedPlaces: JSON.parse(itinerary.matched_places || '[]'),
      stateInfo: JSON.parse(itinerary.state_info || '{}'),
      itinerary: JSON.parse(itinerary.itinerary_data || '{}'),
      shareUrl: `https://knowindia.in/itinerary/${itinerary.id}`,
      createdAt: itinerary.created_at,
    };

    res.json({
      success: true,
      ...result,
    });

  } catch (err) {
    console.error('Error fetching itinerary:', err.message);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch itinerary.',
    });
  }
}

/**
 * Generate PDF version of itinerary
 * GET /api/itinerary/:id/pdf
 */
async function generateItineraryPdf(req, res) {
  try {
    const { id } = req.params;

    if (!id || id.length !== 36) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Invalid itinerary ID format.',
      });
    }

    // Ensure table exists
    await ensureItinerariesTableExists();

    const db = await connectToDatabase();

    const [rows] = await db.execute(
      'SELECT * FROM itineraries WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Itinerary not found.',
      });
    }

    const data = rows[0];
    const itinerary = JSON.parse(data.itinerary_data || '{}');
    const matchedPlaces = JSON.parse(data.matched_places || '[]');
    const stateInfo = JSON.parse(data.state_info || '{}');

    // Create PDF document
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
      info: {
        Title: `${data.destination} Travel Itinerary - Know India`,
        Author: 'Know India',
        Subject: `${data.days}-Day Trip to ${data.destination}`,
      },
    });

    // Set response headers for PDF download
    const filename = `${data.destination.replace(/\s+/g, '_')}_${data.days}day_itinerary.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Pipe PDF to response
    doc.pipe(res);

    // Color palette
    const colors = {
      primary: '#f97316',      // Orange
      secondary: '#8b5cf6',    // Purple
      text: '#1f2937',         // Dark gray
      lightText: '#6b7280',    // Light gray
      accent: '#10b981',       // Green
      background: '#fef3e2',   // Light orange bg
    };

    // Header with gradient effect
    doc.rect(0, 0, doc.page.width, 120).fill(colors.primary);
    
    // Title
    doc.fillColor('#ffffff')
       .fontSize(28)
       .font('Helvetica-Bold')
       .text('Know India', 50, 35, { align: 'left' });
    
    doc.fontSize(12)
       .font('Helvetica')
       .text('AI-Powered Travel Planner', 50, 70);

    // Destination title
    doc.fillColor(colors.text)
       .fontSize(24)
       .font('Helvetica-Bold')
       .text(`${data.destination} Adventure`, 50, 145);
    
    doc.fontSize(14)
       .font('Helvetica')
       .fillColor(colors.lightText)
       .text(`${data.days} Days • ${data.travel_type} Trip • ${data.budget} Budget`, 50, 175);

    // Horizontal line
    doc.moveTo(50, 200).lineTo(545, 200).stroke(colors.primary);

    let yPosition = 220;

    // State info section
    if (stateInfo && (stateInfo.capital || stateInfo.famousFor)) {
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .fillColor(colors.secondary)
         .text('About ' + data.destination, 50, yPosition);
      yPosition += 25;

      if (stateInfo.capital) {
        doc.fontSize(11)
           .font('Helvetica')
           .fillColor(colors.text)
           .text(`Capital: ${stateInfo.capital}`, 50, yPosition);
        yPosition += 18;
      }

      if (stateInfo.famousFor && stateInfo.famousFor.length > 0) {
        const famousText = `Famous For: ${stateInfo.famousFor.slice(0, 5).join(', ')}`;
        doc.text(famousText, 50, yPosition, { width: 495 });
        yPosition += doc.heightOfString(famousText, { width: 495 }) + 10;
      }

      if (stateInfo.cuisine && stateInfo.cuisine.length > 0) {
        const cuisineText = `Local Cuisine: ${stateInfo.cuisine.slice(0, 5).join(', ')}`;
        doc.text(cuisineText, 50, yPosition, { width: 495 });
        yPosition += doc.heightOfString(cuisineText, { width: 495 }) + 10;
      }

      yPosition += 15;
    }

    // Matched Places section
    if (matchedPlaces && matchedPlaces.length > 0) {
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .fillColor(colors.secondary)
         .text('AI-Matched Places', 50, yPosition);
      yPosition += 25;

      const placesText = matchedPlaces.slice(0, 8).map(p => p.name).join(' • ');
      doc.fontSize(10)
         .font('Helvetica')
         .fillColor(colors.lightText)
         .text(placesText, 50, yPosition, { width: 495 });
      yPosition += doc.heightOfString(placesText, { width: 495 }) + 20;
    }

    // Day-wise itinerary
    const itineraryDays = itinerary.itinerary || [];
    
    for (const day of itineraryDays) {
      // Check if we need a new page
      if (yPosition > 680) {
        doc.addPage();
        yPosition = 50;
      }

      // Day header
      doc.rect(50, yPosition, 495, 35)
         .fill(colors.background);
      
      doc.fontSize(16)
         .font('Helvetica-Bold')
         .fillColor(colors.primary)
         .text(`Day ${day.day}`, 60, yPosition + 10);
      
      if (day.title) {
        doc.fontSize(12)
           .font('Helvetica')
           .fillColor(colors.text)
           .text(day.title, 120, yPosition + 12);
      }
      
      yPosition += 45;

      // Activities
      if (day.activities && day.activities.length > 0) {
        for (const activity of day.activities) {
          if (yPosition > 700) {
            doc.addPage();
            yPosition = 50;
          }

          // Time badge
          const timeColor = activity.time?.toLowerCase().includes('morning') ? '#fbbf24' :
                           activity.time?.toLowerCase().includes('afternoon') ? '#f97316' : '#8b5cf6';
          
          doc.fontSize(9)
             .font('Helvetica-Bold')
             .fillColor(timeColor)
             .text(activity.time || 'Activity', 60, yPosition);
          
          yPosition += 15;

          // Activity description
          doc.fontSize(11)
             .font('Helvetica')
             .fillColor(colors.text)
             .text(activity.activity || '', 60, yPosition, { width: 475 });
          yPosition += doc.heightOfString(activity.activity || '', { width: 475 }) + 5;

          // Place and cost
          if (activity.place || activity.estimatedCost) {
            let detailText = '';
            if (activity.place) detailText += `📍 ${activity.place}`;
            if (activity.estimatedCost) detailText += `  💰 ${activity.estimatedCost}`;
            
            doc.fontSize(9)
               .fillColor(colors.lightText)
               .text(detailText, 60, yPosition);
            yPosition += 18;
          }

          yPosition += 5;
        }
      }

      // Meals section
      if (day.meals) {
        if (yPosition > 680) {
          doc.addPage();
          yPosition = 50;
        }

        doc.fontSize(10)
           .font('Helvetica-Bold')
           .fillColor(colors.accent)
           .text('🍽️ Food Recommendations', 60, yPosition);
        yPosition += 18;

        doc.fontSize(9)
           .font('Helvetica')
           .fillColor(colors.text);

        if (day.meals.breakfast) {
          doc.text(`Breakfast: ${day.meals.breakfast}`, 70, yPosition, { width: 465 });
          yPosition += 14;
        }
        if (day.meals.lunch) {
          doc.text(`Lunch: ${day.meals.lunch}`, 70, yPosition, { width: 465 });
          yPosition += 14;
        }
        if (day.meals.dinner) {
          doc.text(`Dinner: ${day.meals.dinner}`, 70, yPosition, { width: 465 });
          yPosition += 14;
        }
        yPosition += 5;
      }

      // Daily tip
      if (day.tip) {
        if (yPosition > 700) {
          doc.addPage();
          yPosition = 50;
        }

        doc.fontSize(9)
           .font('Helvetica-Oblique')
           .fillColor(colors.secondary)
           .text(`💡 Tip: ${day.tip}`, 60, yPosition, { width: 475 });
        yPosition += doc.heightOfString(`💡 Tip: ${day.tip}`, { width: 475 }) + 10;
      }

      yPosition += 15;
    }

    // General Tips section
    if (itinerary.generalTips && itinerary.generalTips.length > 0) {
      if (yPosition > 600) {
        doc.addPage();
        yPosition = 50;
      }

      doc.moveTo(50, yPosition).lineTo(545, yPosition).stroke(colors.primary);
      yPosition += 20;

      doc.fontSize(14)
         .font('Helvetica-Bold')
         .fillColor(colors.secondary)
         .text('Travel Tips', 50, yPosition);
      yPosition += 25;

      for (const tip of itinerary.generalTips) {
        if (yPosition > 720) {
          doc.addPage();
          yPosition = 50;
        }

        doc.fontSize(10)
           .font('Helvetica')
           .fillColor(colors.text)
           .text(`✓ ${tip}`, 60, yPosition, { width: 475 });
        yPosition += doc.heightOfString(`✓ ${tip}`, { width: 475 }) + 8;
      }
    }

    // Budget summary
    if (itinerary.totalEstimatedBudget) {
      if (yPosition > 700) {
        doc.addPage();
        yPosition = 50;
      }
      yPosition += 10;

      doc.fontSize(12)
         .font('Helvetica-Bold')
         .fillColor(colors.accent)
         .text(`Estimated Total Budget: ${itinerary.totalEstimatedBudget}`, 50, yPosition);
    }

    // Footer
    doc.fontSize(8)
       .font('Helvetica')
       .fillColor(colors.lightText)
       .text(
         'Generated by Know India AI Trip Planner • https://knowindia.in',
         50,
         doc.page.height - 40,
         { align: 'center', width: 495 }
       );

    // Finalize PDF
    doc.end();

    console.log(`PDF generated for itinerary: ${id}`);

  } catch (err) {
    console.error('Error generating PDF:', err.message);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to generate PDF.',
      details: err.message,
    });
  }
}

/**
 * Get user's saved itineraries
 * GET /api/itinerary/my-itineraries
 */
async function getMyItineraries(req, res) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Please sign in to view your saved itineraries.',
      });
    }

    await ensureItinerariesTableExists();
    const db = await connectToDatabase();

    const [rows] = await db.execute(
      'SELECT id, destination, days, budget, travel_type, created_at FROM itineraries WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
      [req.user.id]
    );

    const itineraries = rows.map(row => ({
      id: row.id,
      destination: row.destination,
      days: row.days,
      budget: row.budget,
      travelType: row.travel_type,
      shareUrl: `https://knowindia.in/itinerary/${row.id}`,
      createdAt: row.created_at,
    }));

    res.json({
      success: true,
      count: itineraries.length,
      itineraries,
    });

  } catch (err) {
    console.error('Error fetching user itineraries:', err.message);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch itineraries.',
    });
  }
}

module.exports = {
  generateItinerary,
  searchPlaces,
  getDestinations,
  getStatus,
  saveItinerary,
  getItineraryById,
  generateItineraryPdf,
  getMyItineraries,
};
