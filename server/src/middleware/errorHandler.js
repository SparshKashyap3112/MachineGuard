export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  console.error(`[Error] [${req.method} ${req.url}] ${statusCode} - ${message}`);
  if (err.stack && process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }

  // Never leak sensitive internals or full stack traces to production clients
  res.status(statusCode).json({
    success: false,
    error: message,
    code: err.code || 'SERVER_ERROR',
    timestamp: new Date().toISOString()
  });
};
