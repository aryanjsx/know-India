const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware with CORS configured for production
app.use(cors({
  origin: ['http://localhost:3000', 'https://know-india-frontend.vercel.app', 'https://knowindia.vercel.app'],
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Add explicit handling for preflight requests
app.options('*', cors());

let db = null;
let isConnected = false;

// Connect to MySQL - specialized for Vercel deployment
async function connectToDatabase() {
  // If already connected, return the existing connection
  if (isConnected && db) {
    try {
      // Test the existing connection with a simple query
      await db.execute('SELECT 1');
      return db;
    } catch (err) {
      console.log('Existing connection failed, creating new connection');
      isConnected = false;
      // Continue to create a new connection
    }
  }
  
  try {
    console.log('Attempting to connect to database...');
    
    // For development and troubleshooting, try different connection methods
    const connectionMethods = [
      // Method 1: Simple connection without SSL (fastest for testing)
      async () => {
        console.log('Trying connection without SSL...');
        return mysql.createConnection({
          host: process.env.DB_HOST,
          port: parseInt(process.env.DB_PORT, 10),
          user: process.env.DB_USERNAME,
          password: process.env.DB_PASSWORD,
          database: process.env.DB_DATABASE,
          ssl: false,
          connectTimeout: 20000
        });
      },
      
      // Method 2: Connection with relaxed SSL settings
      async () => {
        console.log('Trying connection with relaxed SSL...');
        return mysql.createConnection({
          host: process.env.DB_HOST,
          port: parseInt(process.env.DB_PORT, 10),
          user: process.env.DB_USERNAME,
          password: process.env.DB_PASSWORD,
          database: process.env.DB_DATABASE,
          ssl: { rejectUnauthorized: false },
          connectTimeout: 20000
        });
      },
      
      // Method 3: Full certificate-based connection
      async () => {
        console.log('Trying connection with full SSL certificate validation...');
        
        // Try to find a certificate
        let ca = null;
        try {
          // Check for certificate in multiple locations
          const certLocations = [
            path.join(__dirname, 'certs', 'isrgrootx1.pem'),
            path.join(__dirname, 'isrgrootx1.pem'),
            '/var/task/certs/isrgrootx1.pem',
            '/var/task/isrgrootx1.pem'
          ];
          
          // Add CA_PATH from .env if it exists
          if (process.env.CA_PATH) {
            certLocations.unshift(process.env.CA_PATH);
            console.log(`Added CA_PATH from .env: ${process.env.CA_PATH}`);
          }
          
          for (const certPath of certLocations) {
            if (fs.existsSync(certPath)) {
              ca = fs.readFileSync(certPath);
              console.log(`Using certificate from: ${certPath}`);
              break;
            }
          }
          
          // If no file found, try environment variable
          if (!ca && (process.env.DB_CA_CERT || process.env.CA_CERT)) {
            const certBase64 = process.env.DB_CA_CERT || process.env.CA_CERT;
            ca = Buffer.from(certBase64, 'base64');
            console.log('Using certificate from environment variable');
          }
          
          // As a fallback, embed a default TiDB Cloud certificate for Vercel deployment
          if (!ca) {
            // ISRG Root X1 certificate commonly used with TiDB Cloud
            ca = `-----BEGIN CERTIFICATE-----
MIIFazCCA1OgAwIBAgIRAIIQz7DSQONZRGPgu2OCiwAwDQYJKoZIhvcNAQELBQAw
TzELMAkGA1UEBhMCVVMxKTAnBgNVBAoTIEludGVybmV0IFNlY3VyaXR5IFJlc2Vh
cmNoIEdyb3VwMRUwEwYDVQQDEwxJU1JHIFJvb3QgWDEwHhcNMTUwNjA0MTEwNDM4
WhcNMzUwNjA0MTEwNDM4WjBPMQswCQYDVQQGEwJVUzEpMCcGA1UEChMgSW50ZXJu
ZXQgU2VjdXJpdHkgUmVzZWFyY2ggR3JvdXAxFTATBgNVBAMTDElTUkcgUm9vdCBY
MTCCAiIwDQYJKoZIhvcNAQEBBQADggIPADCCAgoCggIBAK3oJHP0FDfzm54rVygc
h77ct984kIxuPOZXoHj3dcKi/vVqbvYATyjb3miGbESTtrFj/RQSa78f0uoxmyF+
0TM8ukj13Xnfs7j/EvEhmkvBioZxaUpmZmyPfjxwv60pIgbz5MDmgK7iS4+3mX6U
A5/TR5d8mUgjU+g4rk8Kb4Mu0UlXjIB0ttov0DiNewNwIRt18jA8+o+u3dpjq+sW
T8KOEUt+zwvo/7V3LvSye0rgTBIlDHCNAymg4VMk7BPZ7hm/ELNKjD+Jo2FR3qyH
B5T0Y3HsLuJvW5iB4YlcNHlsdu87kGJ55tukmi8mxdAQ4Q7e2RCOFvu396j3x+UC
B5iPNgiV5+I3lg02dZ77DnKxHZu8A/lJBdiB3QW0KtZB6awBdpUKD9jf1b0SHzUv
KBds0pjBqAlkd25HN7rOrFleaJ1/ctaJxQZBKT5ZPt0m9STJEadao0xAH0ahmbWn
OlFuhjuefXKnEgV4We0+UXgVCwOPjdAvBbI+e0ocS3MFEvzG6uBQE3xDk3SzynTn
jh8BCNAw1FtxNrQHusEwMFxIt4I7mKZ9YIqioymCzLq9gwQbooMDQaHWBfEbwrbw
qHyGO0aoSCqI3Haadr8faqU9GY/rOPNk3sgrDQoo//fb4hVC1CLQJ13hef4Y53CI
rU7m2Ys6xt0nUW7/vGT1M0NPAgMBAAGjQjBAMA4GA1UdDwEB/wQEAwIBBjAPBgNV
HRMBAf8EBTADAQH/MB0GA1UdDgQWBBR5tFnme7bl5AFzgAiIyBpY9umbbjANBgkq
hkiG9w0BAQsFAAOCAgEAVR9YqbyyqFDQDLHYGmkgJykIrGF1XIpu+ILlaS/V9lZL
ubhzEFnTIZd+50xx+7LSYK05qAvqFyFWhfFQDlnrzuBZ6brJFe+GnY+EgPbk6ZGQ
3BebYhtF8GaV0nxvwuo77x/Py9auJ/GpsMiu/X1+mvoiBOv/2X/qkSsisRcOj/KK
NFtY2PwByVS5uCbMiogziUwthDyC3+6WVwW6LLv3xLfHTjuCvjHIInNzktHCgKQ5
ORAzI4JMPJ+GslWYHb4phowim57iaztXOoJwTdwJx4nLCgdNbOhdjsnvzqvHu7Ur
TkXWStAmzOVyyghqpZXjFaH3pO3JLF+l+/+sKAIuvtd7u+Nxe5AW0wdeRlN8NwdC
jNPElpzVmbUq4JUagEiuTDkHzsxHpFKVK7q4+63SM1N95R1NbdWhscdCb+ZAJzVc
oyi3B43njTOQ5yOf+1CceWxG1bQVs5ZufpsMljq4Ui0/1lvh+wjChP4kqKOJ2qxq
4RgqsahDYVvTH9w7jXbyLeiNdd8XM2w9U/t7y0Ff/9yi0GE44Za4rF2LN9d11TPA
mRGunUHBcnWEvgJBQl9nJEiU0Zsnvgc/ubhPgXRR4Xq37Z0j4r7g1SgEEzwxA57d
emyPxgcYxn/eR44/KJ4EBs+lVDR3veyJm+kXQ99b21/+jh5Xos1AnX5iItreGCc=
-----END CERTIFICATE-----`;
            console.log('Using built-in TiDB Cloud certificate');
          }
        } catch (certError) {
          console.error('Error loading certificate:', certError.message);
        }
        
        return mysql.createConnection({
          host: process.env.DB_HOST,
          port: parseInt(process.env.DB_PORT, 10),
          user: process.env.DB_USERNAME,
          password: process.env.DB_PASSWORD,
          database: process.env.DB_DATABASE,
          ssl: ca ? { ca, rejectUnauthorized: true } : { rejectUnauthorized: true },
          connectTimeout: 20000
        });
      }
    ];
    
    // Try each connection method in sequence
    let lastError = null;
    
    for (const method of connectionMethods) {
      try {
        db = await method();
        console.log('Connection successful!');
        isConnected = true;
        
        // Verify connection with a test query
        await db.execute('SELECT 1');
        
        // Create feedback table if it doesn't exist
        const createTableQuery = `
          CREATE TABLE IF NOT EXISTS Feedback (
            feedback_id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(100) NOT NULL,
            rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
            liked_content TEXT,
            improvement_suggestions TEXT,
            place_id INT,
            status ENUM('new', 'read', 'responded') DEFAULT 'new',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `;
        
        await db.execute(createTableQuery);
        console.log('Feedback table ready');
        
        return db;
      } catch (err) {
        console.error('Connection attempt failed:', err.message);
        lastError = err;
        // Continue to next method
      }
    }
    
    // If we get here, all methods failed
    throw lastError || new Error('All connection methods failed');
    
  } catch (err) {
    console.error('Error connecting to database:', err.message);
    console.error('Error stack:', err.stack);
    console.error('Connection details:', {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_DATABASE,
      username: process.env.DB_USERNAME ? 'provided' : 'missing'
    });
    isConnected = false;
    throw err;
  }
}

// Add middleware to check database connection for specific endpoints
const ensureDatabaseConnected = async (req, res, next) => {
  // Skip for non-database endpoints
  if (req.path.includes('-mock') || req.path === '/api/health' || req.path === '/api/debug' || req.path === '/api/test') {
    return next();
  }
  
  try {
    // Simplified approach - just try to connect to the database
    console.log('Middleware: checking database connection...');
    const connection = await connectToDatabase();
    console.log('Middleware: database connection successful');
    next();
  } catch (err) {
    console.error('Database connection middleware failed:', err.message);
    
    // Make sure any pending feedback is stored locally by the client
    return res.status(503).json({
      error: 'Database connection unavailable',
      message: 'The database is currently unavailable. Please try again later.',
      details: err.message,
      store_locally: true
    });
  }
};

// Apply the middleware to relevant routes
app.use('/api/feedback', ensureDatabaseConnected);
app.use('/api/db-test', ensureDatabaseConnected);

// Health check endpoint - no database connection needed
app.get('/api/health', async (req, res) => {
  try {
    // Try to connect to the database to get actual connection status
    let dbStatus = 'not connected';
    
    if (isConnected && db) {
      try {
        // Test the existing connection with a simple query
        await db.execute('SELECT 1');
        dbStatus = 'connected';
      } catch (err) {
        console.error('Health check - existing connection failed:', err.message);
        isConnected = false;
        dbStatus = 'connection failed';
      }
    }
    
    if (!isConnected) {
      try {
        await connectToDatabase();
        // If we get here, the connection was successful
        isConnected = true;
        dbStatus = 'connected';
      } catch (err) {
        console.error('Health check connection test failed:', err.message);
        isConnected = false;
        dbStatus = 'connection failed: ' + err.message;
      }
    }

    res.status(200).json({
      status: 'ok',
      message: 'Server is running',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      db_connection: dbStatus
    });
  } catch (err) {
    console.error('Health check error:', err.message);
    res.status(500).json({
      status: 'error',
      message: 'Health check error',
      db_connection: 'unknown',
      error: err.message
    });
  }
});

// Feedback submission endpoint
app.post('/api/feedback', async (req, res) => {
  try {
    console.log('Received feedback submission request');
    
    // Validate required fields
    const { name, email, rating, feedback, suggestions } = req.body;
    
    if (!name || !email || !rating) {
      console.error('Missing required fields:', { name: !!name, email: !!email, rating: !!rating });
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Connect to database with extra verification
    console.log('Connecting to database...');
    let connection;
    try {
      connection = await connectToDatabase();
      // Verify connection is alive with a simple query
      await connection.execute('SELECT 1');
      console.log('Database connection verified');
    } catch (dbErr) {
      console.error('Database connection failed:', dbErr.message);
      
      // Return specific error for database issues
      return res.status(500).json({ 
        error: 'Database connection error: ' + dbErr.message,
        suggestion: 'This is a server-side issue. Please try again later.'
      });
    }
    
    // Insert feedback into the database
    try {
      const query = `
        INSERT INTO Feedback (name, email, rating, liked_content, improvement_suggestions)
        VALUES (?, ?, ?, ?, ?)
      `;
      
      console.log('Executing database query with parameters:', { name, email, rating });
      const [results] = await connection.execute(query, [name, email, rating, feedback, suggestions]);
      console.log('Feedback stored successfully, ID:', results.insertId);
      
      // Return success response
      return res.status(201).json({ 
        message: 'Feedback submitted successfully', 
        id: results.insertId,
        success: true
      });
    } catch (queryErr) {
      console.error('Database query failed:', queryErr.message);
      return res.status(500).json({ 
        error: 'Failed to save feedback: ' + queryErr.message 
      });
    }
  } catch (err) {
    console.error('Error submitting feedback:', err.message);
    console.error('Error stack:', err.stack);
    
    return res.status(500).json({ error: 'Error submitting feedback: ' + err.message });
  }
});

// Database test endpoint
app.get('/api/db-test', async (req, res) => {
  try {
    console.log('Testing database connection...');
    
    // Force a new connection to ensure we're getting a fresh status
    isConnected = false;
    db = null;
    
    const connection = await connectToDatabase();
    
    // Run a test query
    const [results] = await connection.execute('SELECT 1 as connected');
    
    console.log('Database test query results:', results);
    
    res.status(200).json({
      status: 'ok',
      message: 'Database connection successful',
      connected: true,
      test_result: results,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Database test error:', err.message);
    console.error('Error stack:', err.stack);
    
    res.status(503).json({
      status: 'error',
      message: 'Failed to connect to database',
      connected: false,
      error: err.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Simple test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend server is working!' });
});

// Debug endpoint that doesn't require database connection
app.get('/api/debug', (req, res) => {
  const debug = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    nodejs_version: process.version,
    env_vars: {
      db_host: process.env.DB_HOST ? 'set' : 'not set',
      db_port: process.env.DB_PORT ? 'set' : 'not set',
      db_username: process.env.DB_USERNAME ? 'set' : 'not set',
      db_password: process.env.DB_PASSWORD ? 'set' : 'not set',
      db_database: process.env.DB_DATABASE ? 'set' : 'not set',
      db_ssl: process.env.DB_SSL ? 'set' : 'not set',
      db_ca_cert: process.env.DB_CA_CERT ? 'set' : 'not set',
      ca_path: process.env.CA_PATH ? 'set' : 'not set'
    },
    certificate_search: {
      certs_dir_exists: fs.existsSync(path.join(__dirname, 'certs')),
      root_cert_exists: fs.existsSync(path.join(__dirname, 'isrgrootx1.pem')),
      certs_dir_cert_exists: fs.existsSync(path.join(__dirname, 'certs', 'isrgrootx1.pem'))
    },
    db_connection_status: isConnected ? 'connected' : 'not connected',
    database_info: {
      host: process.env.DB_HOST ? process.env.DB_HOST : 'not set',
      port: process.env.DB_PORT ? process.env.DB_PORT : 'not set',
      database: process.env.DB_DATABASE ? process.env.DB_DATABASE : 'not set'
    },
    headers: req.headers,
    dir_contents: fs.existsSync(__dirname) ? fs.readdirSync(__dirname) : 'unavailable'
  };
  
  res.json(debug);
});

// Debug endpoint to check database tables
app.get('/api/debug/tables', async (req, res) => {
  try {
    const connection = await connectToDatabase();
    const [tables] = await connection.execute('SHOW TABLES');
    
    // Get structure of each table
    const structure = {};
    for (const table of tables) {
      const tableName = table[Object.keys(table)[0]];
      const [columns] = await connection.execute(`DESCRIBE ${tableName}`);
      structure[tableName] = columns;
    }
    
    res.json({
      tables: tables.map(t => t[Object.keys(t)[0]]),
      structure
    });
  } catch (error) {
    console.error('Error getting database structure:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add a mock feedback endpoint that doesn't require database connection
app.post('/api/feedback-mock', (req, res) => {
  try {
    console.log('Received mock feedback submission:', req.body);
    
    // Validate required fields
    const { name, email, rating, feedback, suggestions } = req.body;
    
    if (!name || !email || !rating) {
      console.error('Missing required fields:', { name: !!name, email: !!email, rating: !!rating });
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Generate a fake ID
    const fakeId = Math.floor(Math.random() * 10000);
    
    // Store in file system as fallback
    try {
      const feedbackData = {
        id: fakeId,
        name,
        email,
        rating,
        feedback,
        suggestions,
        timestamp: new Date().toISOString()
      };
      
      const feedbackDir = path.join(__dirname, 'feedback-data');
      if (!fs.existsSync(feedbackDir)) {
        fs.mkdirSync(feedbackDir, { recursive: true });
      }
      
      fs.writeFileSync(
        path.join(feedbackDir, `feedback-${fakeId}.json`),
        JSON.stringify(feedbackData, null, 2)
      );
      
      console.log(`Saved mock feedback to file system with ID: ${fakeId}`);
    } catch (fileErr) {
      console.error('Error saving mock feedback to file:', fileErr);
    }
    
    // Return success response
    res.status(201).json({ 
      message: 'Feedback submitted successfully (MOCK)',
      id: fakeId,
      note: 'This is a mock submission that doesn\'t use the database'
    });
  } catch (err) {
    console.error('Error in mock feedback submission:', err.message);
    res.status(500).json({ error: 'Error in mock feedback: ' + err.message });
  }
});

// Add a GET endpoint to retrieve all mock feedback submissions
app.get('/api/feedback-mock', (req, res) => {
  try {
    const feedbackDir = path.join(__dirname, 'feedback-data');
    
    // If directory doesn't exist, return empty array
    if (!fs.existsSync(feedbackDir)) {
      return res.status(200).json({ 
        feedbacks: [],
        message: 'No feedback data found'
      });
    }
    
    // Read all files in the directory
    const files = fs.readdirSync(feedbackDir).filter(file => file.startsWith('feedback-') && file.endsWith('.json'));
    const feedbacks = [];
    
    for (const file of files) {
      try {
        const content = fs.readFileSync(path.join(feedbackDir, file), 'utf8');
        const data = JSON.parse(content);
        feedbacks.push(data);
      } catch (err) {
        console.error(`Error reading feedback file ${file}:`, err);
      }
    }
    
    // Sort by timestamp descending (newest first)
    feedbacks.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    res.status(200).json({ 
      feedbacks, 
      count: feedbacks.length,
      message: 'Mock feedback data retrieved successfully'
    });
  } catch (err) {
    console.error('Error retrieving mock feedback data:', err);
    res.status(500).json({ error: 'Error retrieving mock feedback: ' + err.message });
  }
});

// Add a GET endpoint to retrieve a specific mock feedback by ID
app.get('/api/feedback-mock/:id', (req, res) => {
  try {
    const feedbackId = req.params.id;
    const feedbackDir = path.join(__dirname, 'feedback-data');
    const filePath = path.join(feedbackDir, `feedback-${feedbackId}.json`);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ 
        error: `No feedback found with ID: ${feedbackId}`
      });
    }
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(content);
      
      res.status(200).json({ 
        feedback: data,
        message: 'Mock feedback retrieved successfully'
      });
    } catch (err) {
      console.error(`Error reading feedback file for ID ${feedbackId}:`, err);
      res.status(500).json({ error: `Error reading feedback data: ${err.message}` });
    }
  } catch (err) {
    console.error('Error retrieving specific mock feedback:', err);
    res.status(500).json({ error: 'Error retrieving specific mock feedback: ' + err.message });
  }
});

// Places endpoint - Get places by state
app.get('/api/places/state/:stateName', async (req, res) => {
  try {
    const { stateName } = req.params;
    console.log('Fetching places for state:', stateName);

    const connection = await connectToDatabase();
    
    // First get the places with their categories
    const query = `
      SELECT 
        p.*,
        c.name as category_name,
        GROUP_CONCAT(DISTINCT pi.image_url) as images
      FROM places p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN place_images pi ON p.id = pi.place_id
      WHERE LOWER(p.state) = LOWER(?)
      GROUP BY p.id, p.name, p.description, p.address, p.city, p.state, p.category_id, p.created_at, p.updated_at, c.name
    `;
    
    const [places] = await connection.execute(query, [stateName]);
    
    // For each place, get its key information
    for (const place of places) {
      const [keyInfo] = await connection.execute(
        `SELECT question, answer 
         FROM place_key_information 
         WHERE place_id = ?`,
        [place.id]
      );
      
      // Convert images string to array
      place.images = place.images ? place.images.split(',') : [];
      place.key_info = keyInfo;
    }
    
    console.log(`Found ${places.length} places for ${stateName}`);
    res.json(places);
  } catch (error) {
    console.error('Error fetching places:', error);
    res.status(500).json({ 
      error: 'Failed to fetch places',
      details: error.message 
    });
  }
});

// Get a single place by ID and state
app.get('/api/state/:stateName/place/:placeId', async (req, res) => {
  const { stateName, placeId } = req.params;
  console.log(`Fetching place with ID: ${placeId} for state: ${stateName}`);

  try {
    console.log('Attempting to connect to database...');
    const connection = await connectToDatabase();
    console.log('Database connection successful');

    // Query to get place details including category and images
    const query = `
      SELECT p.*, c.name as category_name, GROUP_CONCAT(DISTINCT pi.image_url) as images
      FROM places p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN place_images pi ON p.id = pi.place_id
      WHERE p.id = ? AND LOWER(TRIM(p.state)) = LOWER(?)
      GROUP BY p.id, p.name, p.description, p.address, p.city, p.state, p.category_id, p.created_at, p.updated_at, c.name
    `;

    const formattedStateName = stateName.split('-').join(' ').trim();
    const [places] = await connection.execute(query, [placeId, formattedStateName]);

    if (!places || places.length === 0) {
      return res.status(404).json({ 
        error: 'Place not found',
        details: `No place found with ID ${placeId} in state ${formattedStateName}`
      });
    }

    // Get key information for the place
    const keyInfoQuery = `
      SELECT question, answer
      FROM place_key_information
      WHERE place_id = ?
      ORDER BY id ASC
    `;

    const [keyInfo] = await connection.execute(keyInfoQuery, [placeId]);

    // Process the place data
    const placeData = {
      ...places[0],
      images: places[0].images ? places[0].images.split(',') : [],
      keyInformation: keyInfo
    };

    res.json(placeData);
  } catch (error) {
    console.error('Error fetching place:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Error fetching place data',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get a place by city name and state
app.get('/api/places/:stateName/:cityName', async (req, res) => {
  const { stateName, cityName } = req.params;
  console.log(`Fetching place for city: ${cityName} in state: ${stateName}`);

  try {
    // Query to get place details including category and images
    const query = `
      SELECT p.*, c.name as category_name, GROUP_CONCAT(pi.image_url) as images
      FROM places p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN place_images pi ON p.id = pi.place_id
      WHERE LOWER(p.state) = LOWER(?)
      AND LOWER(p.city) = LOWER(?)
      GROUP BY p.id
    `;

    const [place] = await (await connectToDatabase()).execute(query, [stateName.split('-').join(' '), cityName.split('-').join(' ')]);
    console.log('Query result:', place);

    if (!place || place.length === 0) {
      console.log('No place found for city:', cityName);
      return res.status(404).json({ error: 'Place not found' });
    }

    // Get key information for the place
    const keyInfoQuery = `
      SELECT question, answer
      FROM place_key_information
      WHERE place_id = ?
      ORDER BY id ASC
    `;

    const [keyInfo] = await (await connectToDatabase()).execute(keyInfoQuery, [place[0].id]);
    console.log('Key info result:', keyInfo);

    // Process the place data
    const placeData = {
      ...place[0],
      images: place[0].images ? place[0].images.split(',') : [],
      keyInformation: keyInfo
    };

    console.log('Sending place data:', placeData);
    res.json(placeData);
  } catch (error) {
    console.error('Error fetching place:', error);
    res.status(500).json({ error: 'Error fetching place data' });
  }
});

// Get places by city name
app.get('/api/places/city/:cityName', async (req, res) => {
  const { cityName } = req.params;
  console.log(`Fetching places for city: ${cityName}`);

  try {
    const formattedCityName = cityName.split('-').join(' ');
    
    const query = `
      SELECT p.*, c.name as category_name, GROUP_CONCAT(DISTINCT pi.image_url) as images
      FROM places p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN place_images pi ON p.id = pi.place_id
      WHERE LOWER(p.city) = LOWER(?)
      GROUP BY p.id, p.name, p.description, p.address, p.city, p.state, p.category_id, c.name
    `;

    const connection = await connectToDatabase();
    const [places] = await connection.execute(query, [formattedCityName]);

    if (!places || places.length === 0) {
      return res.status(404).json({ 
        error: 'Places not found',
        details: `No places found for city: ${formattedCityName}`
      });
    }

    // Get key information for all places
    const placesWithInfo = await Promise.all(places.map(async (place) => {
      const keyInfoQuery = `
        SELECT question, answer
        FROM place_key_information
        WHERE place_id = ?
        ORDER BY id ASC
      `;
      const [keyInfo] = await connection.execute(keyInfoQuery, [place.id]);
      
      return {
        ...place,
        images: place.images ? place.images.split(',') : [],
        keyInformation: keyInfo
      };
    }));

    console.log(`Found ${placesWithInfo.length} places in ${formattedCityName}`);
    res.json(placesWithInfo);
  } catch (error) {
    console.error('Error fetching places:', error);
    res.status(500).json({ 
      error: 'Error fetching place data',
      details: error.message
    });
  }
});

// For local development
if (process.env.NODE_ENV !== 'production') {
  // Initialize database connection on startup
  (async () => {
    try {
      console.log('Initializing database connection on startup...');
      await connectToDatabase();
      console.log('Database initialized successfully!');
    } catch (err) {
      console.error('Failed to initialize database on startup:', err.message);
    }
  })();

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

// Export for Vercel serverless deployment
module.exports = app; 