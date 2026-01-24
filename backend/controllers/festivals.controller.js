const { connectToDatabase } = require('../utils/db');

// Flag to track if tables have been initialized this session
let tablesInitialized = false;

/**
 * Ensure the festivals tables exist
 */
async function ensureTablesExist(connection) {
  if (tablesInitialized) return;
  
  try {
    // Create festivals table
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
        seo_slug VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;
    await connection.execute(createFestivalsQuery);
    
    // Create festival_dates table
    const createFestivalDatesQuery = `
      CREATE TABLE IF NOT EXISTS festival_dates (
        id INT AUTO_INCREMENT PRIMARY KEY,
        festival_id INT NOT NULL,
        year INT NOT NULL,
        date DATE NOT NULL,
        tithi VARCHAR(100),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_festival_year (festival_id, year),
        FOREIGN KEY (festival_id) REFERENCES festivals(id) ON DELETE CASCADE
      )
    `;
    await connection.execute(createFestivalDatesQuery);
    
    tablesInitialized = true;
    console.log('Festivals tables verified/created');
  } catch (err) {
    console.error('Error ensuring festivals tables:', err.message);
  }
}

/**
 * Get all festivals with optional filters
 * GET /api/festivals
 * Query params: religion, month, upcoming
 */
async function getAllFestivals(req, res) {
  try {
    const { religion, month, upcoming } = req.query;
    const currentYear = new Date().getFullYear();
    
    const connection = await connectToDatabase();
    await ensureTablesExist(connection);
    
    // Build dynamic query based on filters
    let query = `
      SELECT 
        f.id, f.name, f.religion, f.description, f.festival_type, 
        f.image_url, f.seo_slug, f.celebration_regions,
        fd.date as celebration_date, fd.year, fd.tithi
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
    
    // Apply upcoming filter (festivals in the next 30 days)
    if (upcoming === 'true') {
      const today = new Date().toISOString().split('T')[0];
      const thirtyDaysLater = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      query += ` AND fd.date >= ? AND fd.date <= ?`;
      params.push(today, thirtyDaysLater);
    }
    
    // Order by date (upcoming first)
    query += ` ORDER BY fd.date ASC`;
    
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
    
    // Get dates for next 2 years as well
    const [futureDates] = await connection.execute(
      `SELECT * FROM festival_dates WHERE festival_id = ? AND year >= ? ORDER BY year ASC LIMIT 3`,
      [festival.id, currentYear]
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
      currentYearDate: dates.length > 0 ? {
        date: dates[0].date,
        tithi: dates[0].tithi,
        notes: dates[0].notes,
        year: dates[0].year,
      } : null,
      upcomingDates: futureDates.map(d => ({
        date: d.date,
        tithi: d.tithi,
        notes: d.notes,
        year: d.year,
      })),
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
  initFestivalsTables,
};
