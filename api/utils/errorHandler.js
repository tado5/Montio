import { ERROR_MESSAGES } from '../config/constants.js';

/**
 * Centralized error handler
 */
export const handleError = (error, context = '') => {
  const timestamp = new Date().toISOString();
  const errorMessage = `[${timestamp}] ${context}: ${error.message}`;

  console.error(errorMessage);
  console.error('Stack trace:', error.stack);

  // Log to external service (e.g., Sentry) in production
  if (process.env.NODE_ENV === 'production') {
    // TODO: Send to logging service
  }

  return {
    message: ERROR_MESSAGES.SERVER_ERROR,
    ...(process.env.NODE_ENV === 'development' && { error: error.message })
  };
};

/**
 * Express error handling middleware
 */
export const errorMiddleware = (err, req, res, next) => {
  console.error('Unhandled error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || ERROR_MESSAGES.SERVER_ERROR;

  res.status(statusCode).json({
    message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      path: req.path,
      method: req.method
    })
  });
};

/**
 * Async error wrapper - eliminates try-catch boilerplate
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
      console.error('Async handler error:', error);
      res.status(500).json(handleError(error, req.path));
    });
  };
};

/**
 * Safe file operations with error handling
 */
export const safeFileOperation = async (operation, filepath, errorContext = 'File operation') => {
  try {
    return await operation(filepath);
  } catch (error) {
    console.error(`${errorContext} failed for ${filepath}:`, error);
    // Don't throw - just log and continue
    return null;
  }
};
