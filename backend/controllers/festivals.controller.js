const { connectToDatabase } = require('../utils/db');

// Flag to track if tables have been initialized this session
let tablesInitialized = false;

/**
 * Ensure the festivals tables exist
 */
async function ensureTablesExist(connection) {
  if (tablesInitialized) return;
  
  try {
    // Create festivals table with comprehensive fields
    const createFestivalsQuery = `
      CREATE TABLE IF NOT EXISTS festivals (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        religion VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        history TEXT,
        significance TEXT,
        how_celebrated TEXT,
        celebration_regions TEXT,
        festival_type ENUM('FIXED', 'LUNAR') DEFAULT 'LUNAR',
        image_url TEXT,
        gallery_images JSON,
        seo_slug VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;
    await connection.execute(createFestivalsQuery);
    
    // Create festival_dates table with Hindu calendar details
    const createFestivalDatesQuery = `
      CREATE TABLE IF NOT EXISTS festival_dates (
        id INT AUTO_INCREMENT PRIMARY KEY,
        festival_id INT NOT NULL,
        year INT NOT NULL,
        date DATE NOT NULL,
        tithi VARCHAR(100),
        paksha VARCHAR(50),
        hindu_month VARCHAR(100),
        notes TEXT,
        regional_variations TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_festival_year (festival_id, year),
        FOREIGN KEY (festival_id) REFERENCES festivals(id) ON DELETE CASCADE
      )
    `;
    await connection.execute(createFestivalDatesQuery);
    
    // Try to add new columns if they don't exist (for existing tables)
    try {
      await connection.execute(`ALTER TABLE festivals ADD COLUMN gallery_images JSON`);
    } catch (e) { /* Column may already exist */ }
    
    try {
      await connection.execute(`ALTER TABLE festival_dates ADD COLUMN paksha VARCHAR(50)`);
    } catch (e) { /* Column may already exist */ }
    
    try {
      await connection.execute(`ALTER TABLE festival_dates ADD COLUMN hindu_month VARCHAR(100)`);
    } catch (e) { /* Column may already exist */ }
    
    try {
      await connection.execute(`ALTER TABLE festival_dates ADD COLUMN regional_variations TEXT`);
    } catch (e) { /* Column may already exist */ }
    
    tablesInitialized = true;
    console.log('Festivals tables verified/created');
  } catch (err) {
    console.error('Error ensuring festivals tables:', err.message);
  }
}

/**
 * Get all festivals with optional filters
 * GET /api/festivals
 * Query params: religion, month, upcoming, region
 */
async function getAllFestivals(req, res) {
  try {
    const { religion, month, upcoming, region } = req.query;
    const currentYear = new Date().getFullYear();
    
    const connection = await connectToDatabase();
    await ensureTablesExist(connection);
    
    // Build dynamic query based on filters
    let query = `
      SELECT 
        f.id, f.name, f.religion, f.description, f.festival_type, 
        f.image_url, f.seo_slug, f.celebration_regions,
        fd.date as celebration_date, fd.year, fd.tithi, fd.paksha, fd.hindu_month
      FROM festivals f
      LEFT JOIN festival_dates fd ON f.id = fd.festival_id AND fd.year = ?
      WHERE 1=1
    `;
    const params = [currentYear];
    
    // Apply religion filter
    if (religion && religion.trim() !== '') {
      query += ` AND LOWER(f.religion) = LOWER(?)`;
      params.push(religion.trim());
    }
    
    // Apply month filter (filter by month of current year's date)
    if (month && !isNaN(parseInt(month, 10))) {
      const monthNum = parseInt(month, 10);
      query += ` AND MONTH(fd.date) = ?`;
      params.push(monthNum);
    }
    
    // Apply region filter
    if (region && region.trim() !== '') {
      query += ` AND (LOWER(f.celebration_regions) LIKE LOWER(?) OR LOWER(f.celebration_regions) LIKE '%pan-india%')`;
      params.push(`%${region.trim()}%`);
    }
    
    // Apply upcoming filter (festivals in the next 30 days)
    if (upcoming === 'true') {
      const today = new Date().toISOString().split('T')[0];
      const thirtyDaysLater = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      query += ` AND fd.date >= ? AND fd.date <= ?`;
      params.push(today, thirtyDaysLater);
    }
    
    // Order by date (upcoming first), then by name
    query += ` ORDER BY fd.date ASC, f.name ASC`;
    
    const [festivals] = await connection.execute(query, params);
    
    // Transform data for frontend
    const transformedFestivals = festivals.map(festival => ({
      id: festival.id,
      name: festival.name,
      religion: festival.religion,
      description: festival.description,
      festivalType: festival.festival_type,
      imageUrl: festival.image_url,
      seoSlug: festival.seo_slug,
      celebrationRegions: festival.celebration_regions,
      celebrationDate: festival.celebration_date,
      year: festival.year,
      tithi: festival.tithi,
      paksha: festival.paksha,
      hinduMonth: festival.hindu_month,
    }));
    
    res.json({
      success: true,
      festivals: transformedFestivals,
      count: transformedFestivals.length,
      year: currentYear,
    });
  } catch (err) {
    console.error('Error fetching festivals:', err.message);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch festivals',
    });
  }
}

/**
 * Get festival details by slug
 * GET /api/festivals/:slug
 */
async function getFestivalBySlug(req, res) {
  try {
    const { slug } = req.params;
    const currentYear = new Date().getFullYear();
    
    if (!slug || slug.trim() === '') {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Festival slug is required',
      });
    }
    
    const connection = await connectToDatabase();
    await ensureTablesExist(connection);
    
    // Get festival details
    const [festivals] = await connection.execute(
      `SELECT * FROM festivals WHERE seo_slug = ?`,
      [slug.trim()]
    );
    
    if (festivals.length === 0) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Festival not found',
      });
    }
    
    const festival = festivals[0];
    
    // Get celebration date for current year
    const [dates] = await connection.execute(
      `SELECT * FROM festival_dates WHERE festival_id = ? AND year = ?`,
      [festival.id, currentYear]
    );
    
    // Get dates for next 3 years
    const [futureDates] = await connection.execute(
      `SELECT * FROM festival_dates WHERE festival_id = ? AND year >= ? ORDER BY year ASC LIMIT 5`,
      [festival.id, currentYear]
    );
    
    // Parse gallery images if stored as JSON
    let galleryImages = [];
    if (festival.gallery_images) {
      try {
        galleryImages = typeof festival.gallery_images === 'string' 
          ? JSON.parse(festival.gallery_images) 
          : festival.gallery_images;
      } catch (e) {
        galleryImages = [];
      }
    }
    
    // Transform response with comprehensive Hindu calendar details
    const response = {
      id: festival.id,
      name: festival.name,
      religion: festival.religion,
      description: festival.description,
      history: festival.history,
      significance: festival.significance,
      howCelebrated: festival.how_celebrated,
      celebrationRegions: festival.celebration_regions,
      festivalType: festival.festival_type,
      imageUrl: festival.image_url,
      galleryImages: galleryImages,
      seoSlug: festival.seo_slug,
      currentYearDate: dates.length > 0 ? {
        date: dates[0].date,
        tithi: dates[0].tithi,
        paksha: dates[0].paksha,
        hinduMonth: dates[0].hindu_month,
        notes: dates[0].notes,
        regionalVariations: dates[0].regional_variations,
        year: dates[0].year,
      } : null,
      upcomingDates: futureDates.map(d => ({
        date: d.date,
        tithi: d.tithi,
        paksha: d.paksha,
        hinduMonth: d.hindu_month,
        notes: d.notes,
        regionalVariations: d.regional_variations,
        year: d.year,
      })),
      currentYear: currentYear,
    };
    
    res.json({
      success: true,
      festival: response,
    });
  } catch (err) {
    console.error('Error fetching festival:', err.message);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch festival details',
    });
  }
}

/**
 * Get festival details by slug and year
 * GET /api/festivals/:slug/:year
 */
async function getFestivalBySlugAndYear(req, res) {
  try {
    const { slug, year } = req.params;
    const yearNum = parseInt(year, 10);
    
    if (!slug || slug.trim() === '') {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Festival slug is required',
      });
    }
    
    if (isNaN(yearNum) || yearNum < 2000 || yearNum > 2100) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Invalid year provided',
      });
    }
    
    const connection = await connectToDatabase();
    await ensureTablesExist(connection);
    
    // Get festival details
    const [festivals] = await connection.execute(
      `SELECT * FROM festivals WHERE seo_slug = ?`,
      [slug.trim()]
    );
    
    if (festivals.length === 0) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Festival not found',
      });
    }
    
    const festival = festivals[0];
    
    // Get celebration date for specified year
    const [dates] = await connection.execute(
      `SELECT * FROM festival_dates WHERE festival_id = ? AND year = ?`,
      [festival.id, yearNum]
    );
    
    // Transform response
    const response = {
      id: festival.id,
      name: festival.name,
      religion: festival.religion,
      description: festival.description,
      history: festival.history,
      significance: festival.significance,
      howCelebrated: festival.how_celebrated,
      celebrationRegions: festival.celebration_regions,
      festivalType: festival.festival_type,
      imageUrl: festival.image_url,
      seoSlug: festival.seo_slug,
      dateInfo: dates.length > 0 ? {
        date: dates[0].date,
        tithi: dates[0].tithi,
        notes: dates[0].notes,
        year: dates[0].year,
      } : null,
    };
    
    res.json({
      success: true,
      festival: response,
      requestedYear: yearNum,
      dateAvailable: dates.length > 0,
    });
  } catch (err) {
    console.error('Error fetching festival by year:', err.message);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch festival details',
    });
  }
}

/**
 * Get distinct religions for filter dropdown
 * GET /api/festivals/filters/religions
 */
async function getReligions(req, res) {
  try {
    const connection = await connectToDatabase();
    await ensureTablesExist(connection);
    
    const [religions] = await connection.execute(
      `SELECT DISTINCT religion FROM festivals ORDER BY religion ASC`
    );
    
    res.json({
      success: true,
      religions: religions.map(r => r.religion),
    });
  } catch (err) {
    console.error('Error fetching religions:', err.message);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch religions',
    });
  }
}

/**
 * Get regions for filter dropdown
 * GET /api/festivals/filters/regions
 */
async function getRegions(req, res) {
  try {
    const connection = await connectToDatabase();
    await ensureTablesExist(connection);
    
    // Common Indian regions/states for filtering
    const regions = [
      'Pan-India',
      'North India',
      'South India',
      'East India',
      'West India',
      'Central India',
      'Northeast India',
      'Andhra Pradesh',
      'Assam',
      'Bihar',
      'Gujarat',
      'Haryana',
      'Karnataka',
      'Kerala',
      'Madhya Pradesh',
      'Maharashtra',
      'Odisha',
      'Punjab',
      'Rajasthan',
      'Tamil Nadu',
      'Telangana',
      'Uttar Pradesh',
      'West Bengal',
      'Goa',
      'Himachal Pradesh',
      'Uttarakhand',
      'Jammu and Kashmir',
    ];
    
    res.json({
      success: true,
      regions: regions,
    });
  } catch (err) {
    console.error('Error fetching regions:', err.message);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch regions',
    });
  }
}

/**
 * Initialize festivals tables
 * Called from server startup
 */
async function initFestivalsTables() {
  try {
    const connection = await connectToDatabase();
    await ensureTablesExist(connection);
    console.log('Festivals tables initialized');
  } catch (err) {
    console.error('Failed to initialize festivals tables:', err.message);
  }
}

module.exports = {
  getAllFestivals,
  getFestivalBySlug,
  getFestivalBySlugAndYear,
  getReligions,
  getRegions,
  initFestivalsTables,
};
