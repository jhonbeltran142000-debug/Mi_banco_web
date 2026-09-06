const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const { loginLimiter, registerLimiter } = require('../middleware/rateLimiter');
const { sanitizeString } = require('../middleware/sanitize');
const router = express.Router();

// Validaciones
const validateUsername = (username) => {
  if (!username || typeof username !== 'string') return false;
  const sanitized = sanitizeString(username);
  return sanitized.length >= 3 && sanitized.length <= 50 && /^[a-zA-Z0-9_]+$/.test(sanitized);
};

const validatePassword = (password) => {
  if (!password || typeof password !== 'string') return false;
  return password.length >= 6 && password.length <= 100;
};

// Login con rate limiting
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Usuario y contraseña son obligatorios.' });
    }

    if (!validateUsername(username)) {
      return res.status(400).json({ error: 'Usuario inválido.' });
    }

    const [rows] = await pool.query('SELECT * FROM usuarios WHERE username = ?', [sanitizeString(username)]);
    const user = rows[0];

    if (!user) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos.' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos.' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN, algorithm: 'HS256' }
    );

    res.json({ token, username: user.username });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// Registro con rate limiting
router.post('/register', registerLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Usuario y contraseña son obligatorios.' });
    }

    if (!validateUsername(username)) {
      return res.status(400).json({ error: 'Usuario inválido. Usa 3-50 caracteres (letras, números, guiones bajos).' });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({ error: 'Contraseña inválida. Usa entre 6 y 100 caracteres.' });
    }

    const sanitizedUsername = sanitizeString(username);

    const [existing] = await pool.query('SELECT id FROM usuarios WHERE username = ?', [sanitizedUsername]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'El usuario ya existe.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const [result] = await pool.query('INSERT INTO usuarios (username, password) VALUES (?, ?)', [sanitizedUsername, hashedPassword]);

    const token = jwt.sign(
      { id: result.insertId, username: sanitizedUsername },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN, algorithm: 'HS256' }
    );

    res.status(201).json({ token, username: sanitizedUsername });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

module.exports = router;
