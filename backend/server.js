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
      isConnected = false;
      // Continue to create a new connection
    }
  }
  
  try {
    // For development and troubleshooting, try different connection methods
    const connectionMethods = [
      // Method 1: Simple connection without SSL (fastest for testing)
      async () => {
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
          }
          
          for (const certPath of certLocations) {
            if (fs.existsSync(certPath)) {
              ca = fs.readFileSync(certPath);
              break;
            }
          }
          
          // If no file found, try environment variable
          if (!ca && (process.env.DB_CA_CERT || process.env.CA_CERT)) {
            const certBase64 = process.env.DB_CA_CERT || process.env.CA_CERT;
            ca = Buffer.from(certBase64, 'base64');
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
        return db;
      } catch (err) {
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
    const connection = await connectToDatabase();
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
    await connectToDatabase();
    res.json({ status: 'healthy', database: 'connected' });
  } catch (err) {
    res.json({ status: 'healthy', database: 'disconnected' });
  }
});

// Feedback submission endpoint
app.post('/api/feedback', async (req, res) => {
  try {
    const { name, email, rating, liked_content, improvement_suggestions, place_id } = req.body;
    
    // Validate required fields
    if (!name || !email || !rating) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Validate rating range
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }
    
    // Connect to database
    const connection = await connectToDatabase();
    
    // Insert feedback into database
    const [results] = await connection.execute(
      'INSERT INTO Feedback (name, email, rating, liked_content, improvement_suggestions, place_id) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, rating, liked_content || null, improvement_suggestions || null, place_id || null]
    );
    
    res.json({ 
      status: 'success', 
      message: 'Feedback submitted successfully',
      feedback_id: results.insertId
    });
  } catch (err) {
    console.error('Error submitting feedback:', err);
    res.status(500).json({ 
      error: 'Failed to submit feedback',
      message: err.message,
      store_locally: true
    });
  }
});

// Database test endpoint
app.get('/api/db-test', async (req, res) => {
  try {
    const connection = await connectToDatabase();
    const [results] = await connection.execute('SELECT 1 as test');
    res.json({ status: 'success', results });
  } catch (err) {
    res.status(500).json({ 
      status: 'error', 
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

// Mock feedback endpoint for testing
app.post('/api/feedback-mock', (req, res) => {
  try {
    const { name, email, rating, liked_content, improvement_suggestions, place_id } = req.body;
    
    // Validate required fields
    if (!name || !email || !rating) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Validate rating range
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }
    
    // Generate a fake ID
    const fakeId = Math.floor(Math.random() * 1000000);
    
    // Save to a local file for testing
    const feedbackDir = path.join(__dirname, 'feedback');
    if (!fs.existsSync(feedbackDir)) {
      fs.mkdirSync(feedbackDir);
    }
    
    const feedbackFile = path.join(feedbackDir, `feedback_${fakeId}.json`);
    fs.writeFileSync(feedbackFile, JSON.stringify({
      id: fakeId,
      name,
      email,
      rating,
      liked_content,
      improvement_suggestions,
      place_id,
      created_at: new Date().toISOString()
    }, null, 2));
    
    res.json({ 
      status: 'success', 
      message: 'Mock feedback submitted successfully',
      feedback_id: fakeId
    });
  } catch (err) {
    console.error('Error submitting mock feedback:', err);
    res.status(500).json({ 
      error: 'Failed to submit mock feedback',
      message: err.message
    });
  }
});

// Places endpoints
app.get('/api/places/state/:stateName', async (req, res) => {
  try {
    const { stateName } = req.params;
    const connection = await connectToDatabase();
    
    const [places] = await connection.execute(
      'SELECT * FROM Places WHERE state = ?',
      [stateName]
    );
    
    res.json(places);
  } catch (err) {
    console.error('Error fetching places:', err);
    res.status(500).json({ error: 'Failed to fetch places' });
  }
});

app.get('/api/places/state/:stateName/place/:placeId', async (req, res) => {
  try {
    const { stateName, placeId } = req.params;
    const connection = await connectToDatabase();
    
    const [places] = await connection.execute(
      'SELECT * FROM Places WHERE state = ? AND id = ?',
      [stateName, placeId]
    );
    
    if (places.length === 0) {
      return res.status(404).json({ error: 'Place not found' });
    }
    
    const place = places[0];
    
    // Get key information for the place
    const [keyInfo] = await connection.execute(
      'SELECT * FROM KeyInformation WHERE place_id = ?',
      [placeId]
    );
    
    // Combine place data with key information
    const placeData = {
      ...place,
      keyInformation: keyInfo
    };
    
    res.json(placeData);
  } catch (err) {
    console.error('Error fetching place details:', err);
    res.status(500).json({ error: 'Failed to fetch place details' });
  }
});

app.get('/api/places/state/:stateName/city/:cityName', async (req, res) => {
  try {
    const { stateName, cityName } = req.params;
    const connection = await connectToDatabase();
    
    const [places] = await connection.execute(
      'SELECT * FROM Places WHERE state = ? AND city = ?',
      [stateName, cityName]
    );
    
    if (places.length === 0) {
      return res.status(404).json({ error: 'No places found for this city' });
    }
    
    // Get key information for each place
    const placesWithInfo = await Promise.all(places.map(async (place) => {
      const [keyInfo] = await connection.execute(
        'SELECT * FROM KeyInformation WHERE place_id = ?',
        [place.id]
      );
      
      return {
        ...place,
        keyInformation: keyInfo
      };
    }));
    
    res.json(placesWithInfo);
  } catch (err) {
    console.error('Error fetching city places:', err);
    res.status(500).json({ error: 'Failed to fetch city places' });
  }
});

// Initialize database connection on startup
connectToDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch(err => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });

// Export for Vercel serverless deployment
module.exports = app; 