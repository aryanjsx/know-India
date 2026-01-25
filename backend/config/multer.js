const multer = require('multer');
const path = require('path');

/**
 * SECURITY: Allowed image MIME types
 * Only raster image formats - no SVG (XSS risk)
 */
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

/**
 * SECURITY: Allowed file extensions (must match MIME type)
 */
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

// Configure storage - store in memory for processing
const storage = multer.memoryStorage();

/**
 * SECURITY: Enhanced file filter
 * - Validates MIME type
 * - Validates file extension
 * - Rejects suspicious filenames
 */
const fileFilter = (req, file, cb) => {
  // SECURITY: Check MIME type
  if (!ALLOWED_TYPES.includes(file.mimetype)) {
    return cb(new Error('Invalid file type. Only JPG, PNG, and WebP images are allowed.'), false);
  }

  // SECURITY: Validate extension matches MIME type
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return cb(new Error(`Invalid file extension. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`), false);
  }

  // SECURITY: Check for path traversal attempts
  if (file.originalname.includes('..') || file.originalname.includes('/') || file.originalname.includes('\\')) {
    return cb(new Error('Invalid filename'), false);
  }

  // SECURITY: Reject files with null bytes
  if (file.originalname.includes('\0')) {
    return cb(new Error('Invalid filename'), false);
  }

  cb(null, true);
};

// Create multer instance
const upload = multer({
  storage,
  limits: {
    fileSize: MAX_SIZE,
    files: 5, // SECURITY: Limit number of files
  },
  fileFilter,
});

/**
 * SECURITY: Error handler middleware for multer errors
 * Returns sanitized error messages
 */
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        message: 'Image size must be 5 MB or less',
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        message: 'Too many files uploaded',
      });
    }
    return res.status(400).json({
      success: false,
      error: 'Upload failed',
      message: 'File upload error',
    });
  }
  
  if (err) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      message: err.message,
    });
  }
  
  next();
};

module.exports = {
  upload,
  handleMulterError,
  ALLOWED_TYPES,
  ALLOWED_EXTENSIONS,
  MAX_SIZE,
};

