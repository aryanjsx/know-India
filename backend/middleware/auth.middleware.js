const { verifyToken } = require('../utils/jwt');

/**
 * Middleware to verify JWT token and attach user to request
 * Returns 401 if token is missing or invalid
 */
function authRequired(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      error: 'Authentication required',
      message: 'No token provided' 
    });
  }
  
  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);
  
  if (!decoded) {
    return res.status(401).json({ 
      error: 'Authentication failed',
      message: 'Invalid or expired token' 
    });
  }
  
  req.user = decoded;
  next();
}

/**
 * Optional auth middleware - attaches user if token exists, but doesn't require it
 */
function authOptional(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    
    if (decoded) {
      req.user = decoded;
    }
  }
  
  next();
}

module.exports = {
  authRequired,
  authOptional,
};

