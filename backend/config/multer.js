const multer = require('multer');
const path = require('path');

// Allowed image types
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

// Configure storage - store in memory for processing
const storage = multer.memoryStorage();

// File filter to validate image type
const fileFilter = (req, file, cb) => {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, PNG, and WebP images are allowed.'), false);
  }
};

// Create multer instance
const upload = multer({
  storage,
  limits: {
    fileSize: MAX_SIZE,
  },
  fileFilter,
});

// Error handler middleware for multer errors
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Image size must be 5 MB or less',
      });
    }
    return res.status(400).json({
      error: 'Upload failed',
      message: err.message,
    });
  }
  
  if (err) {
    return res.status(400).json({
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
  MAX_SIZE,
};

