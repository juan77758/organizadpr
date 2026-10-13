const errorHandler = (err, req, res, next) => {
  console.error('Error de solicitud:', err.code || err.name);

  const statusCode = err.statusCode || err.status || 500;
  const message = statusCode >= 500 && process.env.NODE_ENV === 'production'
    ? 'Error interno del servidor' : err.message || 'Error interno del servidor';

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
