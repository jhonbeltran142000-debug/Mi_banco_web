const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();

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
app.use(express.json({ limit: '10mb' }));

// Rutas
app.use('/api/auth', require('../src/routes/auth'));
app.use('/api/clientes', require('../src/routes/clientes'));
app.use('/api/prestamos', require('../src/routes/prestamos'));
app.use('/api/cuotas', require('../src/routes/cuotas'));
app.use('/api/reportes', require('../src/routes/reportes'));
app.use('/api/pdf', require('../src/routes/pdf'));
app.use('/api/scoring', require('../src/routes/scoring'));

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
  res.status(500).json({ error: 'Error interno del servidor.' });
});

module.exports = app;
