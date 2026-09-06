const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

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

app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});
