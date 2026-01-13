const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

let db = null;
let isConnected = false;

/**
 * Connect to MySQL database with multiple fallback methods
 * Reuses existing connection if available
 */
async function connectToDatabase() {
  // If already connected, return the existing connection
  if (isConnected && db) {
    try {
      await db.execute('SELECT 1');
      return db;
    } catch (err) {
      console.log('Existing connection failed, creating new connection');
      isConnected = false;
    }
  }

  try {
    console.log('Attempting to connect to database...');

    const connectionMethods = [
      // Method 1: Simple connection without SSL
      async () => {
        console.log('Trying connection without SSL...');
        return mysql.createConnection({
          host: process.env.DB_HOST,
          port: parseInt(process.env.DB_PORT, 10),
          user: process.env.DB_USERNAME,
          password: process.env.DB_PASSWORD,
          database: process.env.DB_DATABASE,
          ssl: false,
          connectTimeout: 20000,
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
          connectTimeout: 20000,
        });
      },

      // Method 3: Full certificate-based connection
      async () => {
        console.log('Trying connection with full SSL certificate validation...');

        let ca = null;
        try {
          const certLocations = [
            path.join(__dirname, '..', 'certs', 'isrgrootx1.pem'),
            path.join(__dirname, '..', 'isrgrootx1.pem'),
            '/var/task/certs/isrgrootx1.pem',
            '/var/task/isrgrootx1.pem',
          ];

          if (process.env.CA_PATH) {
            certLocations.unshift(process.env.CA_PATH);
          }

          for (const certPath of certLocations) {
            if (fs.existsSync(certPath)) {
              ca = fs.readFileSync(certPath);
              console.log(`Using certificate from: ${certPath}`);
              break;
            }
          }

          if (!ca && (process.env.DB_CA_CERT || process.env.CA_CERT)) {
            const certBase64 = process.env.DB_CA_CERT || process.env.CA_CERT;
            ca = Buffer.from(certBase64, 'base64');
            console.log('Using certificate from environment variable');
          }

          if (!ca) {
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
          connectTimeout: 20000,
        });
      },
    ];

    let lastError = null;

    for (const method of connectionMethods) {
      try {
        db = await method();
        console.log('Connection successful!');
        isConnected = true;
        await db.execute('SELECT 1');
        return db;
      } catch (err) {
        console.error('Connection attempt failed:', err.message);
        lastError = err;
      }
    }

    throw lastError || new Error('All connection methods failed');
  } catch (err) {
    console.error('Error connecting to database:', err.message);
    isConnected = false;
    throw err;
  }
}

/**
 * Initialize the users table if it doesn't exist
 */
async function initUsersTable() {
  const connection = await connectToDatabase();
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      google_id VARCHAR(255) UNIQUE NOT NULL,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      avatar VARCHAR(500),
      role ENUM('user', 'admin') DEFAULT 'user',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `;
  await connection.execute(createTableQuery);
  console.log('Users table ready');
}

/**
 * Initialize travel posts table
 */
async function initPostsTable() {
  const connection = await connectToDatabase();
  
  // Create posts table
  const createPostsQuery = `
    CREATE TABLE IF NOT EXISTS travel_posts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      content TEXT NOT NULL,
      rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
      images JSON,
      upvotes INT DEFAULT 0,
      downvotes INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `;
  await connection.execute(createPostsQuery);
  
  // Create votes table to track user votes
  const createVotesQuery = `
    CREATE TABLE IF NOT EXISTS post_votes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      post_id INT NOT NULL,
      user_id INT NOT NULL,
      vote_type ENUM('upvote', 'downvote') NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_vote (post_id, user_id),
      FOREIGN KEY (post_id) REFERENCES travel_posts(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `;
  await connection.execute(createVotesQuery);
  
  console.log('Posts and votes tables ready');
}

/**
 * Initialize profile posts table with place information
 */
async function initProfilePostsTable() {
  const connection = await connectToDatabase();
  
  // Create profile_posts table
  const createProfilePostsQuery = `
    CREATE TABLE IF NOT EXISTS profile_posts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      place_name VARCHAR(255) NOT NULL,
      state VARCHAR(100) NOT NULL,
      content TEXT NOT NULL,
      rating INT NOT NULL,
      images JSON,
      upvotes INT DEFAULT 0,
      downvotes INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `;
  await connection.execute(createProfilePostsQuery);
  
  // Create profile_post_votes table
  const createProfileVotesQuery = `
    CREATE TABLE IF NOT EXISTS profile_post_votes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      post_id INT NOT NULL,
      user_id INT NOT NULL,
      vote_type ENUM('upvote', 'downvote') NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_profile_vote (post_id, user_id),
      FOREIGN KEY (post_id) REFERENCES profile_posts(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `;
  await connection.execute(createProfileVotesQuery);
  
  console.log('Profile posts and votes tables ready');
}

/**
 * Initialize saved places table for user bookmarks
 */
async function initSavedPlacesTable() {
  const connection = await connectToDatabase();
  
  const createSavedPlacesQuery = `
    CREATE TABLE IF NOT EXISTS saved_places (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      place_id INT NOT NULL,
      place_name VARCHAR(255) NOT NULL,
      state VARCHAR(100) NOT NULL,
      state_slug VARCHAR(100),
      category VARCHAR(100),
      image TEXT,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_user_place (user_id, place_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `;
  await connection.execute(createSavedPlacesQuery);
  
  console.log('Saved places table ready');
}

/**
 * Initialize itineraries table for saved AI-generated travel plans
 */
async function initItinerariesTable() {
  const connection = await connectToDatabase();
  
  const createItinerariesQuery = `
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
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    )
  `;
  await connection.execute(createItinerariesQuery);
  
  console.log('Itineraries table ready');
}

module.exports = {
  connectToDatabase,
  initUsersTable,
  initPostsTable,
  initProfilePostsTable,
  initSavedPlacesTable,
  initItinerariesTable,
};

