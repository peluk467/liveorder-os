const { ZodError } = require('zod');

/**
 * Middleware centralizado de manejo de errores
 */
const errorHandler = (err, req, res, next) => {
  console.error(`[Error] ${req.method} ${req.url}:`, err);

  // Errores de validación de esquemas Zod
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: 'Error de validación en los datos enviados',
      details: err.errors.map(e => ({
        campo: e.path.join('.'),
        mensaje: e.message
      }))
    });
  }

  // Errores de sintaxis JSON en el cuerpo del request
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      error: 'Formato JSON inválido en el cuerpo de la petición'
    });
  }

  // Errores personalizados con status code definido
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Error interno del servidor';

  return res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = { errorHandler };
