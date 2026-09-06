const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

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

module.exports = app;
