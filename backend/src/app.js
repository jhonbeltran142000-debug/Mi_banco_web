const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('./config/env');
const { generalLimiter } = require('./middleware/rateLimiter');

const app = express();

// Detras de proxy (Vercel) para que el rate limiting use la IP real
app.set('trust proxy', 1);

// Security headers
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
}));
app.use(express.json({ limit: '100kb' }));

// Rate limiting general para todos los endpoints
app.use(generalLimiter);

// Rutas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/clientes', require('./routes/clientes'));
app.use('/api/prestamos', require('./routes/prestamos'));
app.use('/api/cuotas', require('./routes/cuotas'));
app.use('/api/reportes', require('./routes/reportes'));
app.use('/api/pdf', require('./routes/pdf'));
app.use('/api/scoring', require('./routes/scoring'));

// Ruta de prueba
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada.' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(500).json({ error: 'Error interno del servidor.' });
});

module.exports = app;
