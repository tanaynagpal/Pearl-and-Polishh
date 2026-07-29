import { Response } from 'express';

/**
 * Enterprise Database Error Handler.
 * Formats MongoDB 11000 duplicate keys, Mongoose validation errors, and cast errors cleanly.
 */
export const handleDatabaseError = (error: any, res: Response, fallbackMessage: string) => {
  console.error('[DATABASE ERROR]', error);

  // MongoDB 11000 Duplicate Key Error
  if (error && error.code === 11000) {
    const fields = Object.keys(error.keyValue || {});
    const fieldName = fields[0] || 'field';
    const fieldValue = error.keyValue ? error.keyValue[fieldName] : '';
    return res.status(409).json({
      success: false,
      message: `A record with ${fieldName} '${fieldValue}' already exists.`,
      code: 'DUPLICATE_KEY',
      field: fieldName,
    });
  }

  // Mongoose Validation Error
  if (error && error.name === 'ValidationError') {
    const messages = Object.values(error.errors || {}).map((e: any) => e.message);
    return res.status(400).json({
      success: false,
      message: messages[0] || 'Database validation failed.',
      errors: messages,
      code: 'VALIDATION_ERROR',
    });
  }

  // Mongoose Cast Error (Invalid ObjectId or Type)
  if (error && error.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: `Invalid format for field '${error.path}'.`,
      code: 'INVALID_CAST',
    });
  }

  return res.status(500).json({
    success: false,
    message: fallbackMessage || 'An unexpected database error occurred.',
  });
};
