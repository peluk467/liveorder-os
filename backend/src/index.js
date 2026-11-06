const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { errorHandler } = require('./middlewares/errorHandler');
const liveRoutes = require('./routes/liveRoutes');
const productoRoutes = require('./routes/productoRoutes');
const pedidoRoutes = require('./routes/pedidoRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de CORS (admite frontend y extensión de Chrome)
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : ['http://localhost:5173'];

app.use(cors({
  origin: (origin, callback) => {
    // Permite peticiones sin origin (ej. Postman, curl o extensiones) o si está en la lista blanca
    if (!origin || allowedOrigins.includes(origin) || origin.startsWith('chrome-extension://')) {
      return callback(null, true);
    }
    return callback(new Error('No permitido por la política CORS'));
  },
  credentials: true
}));

// Middlewares para parseo de peticiones
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Healthcheck de verificación rápida
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'LiveOrder OS Backend API',
    timestamp: new Date().toISOString()
  });
});

// Rutas API
app.use('/api/live', liveRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/pedidos', pedidoRoutes);

// Middleware global de manejo de errores
app.use(errorHandler);

// Iniciar servidor
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 LiveOrder OS Backend corriendo en http://localhost:${PORT}`);
    console.log(`⚡ Modo: ${process.env.NODE_ENV || 'development'}`);
  });
}

module.exports = app;
