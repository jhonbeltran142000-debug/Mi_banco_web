const express = require('express');
const pool = require('../config/database');
const auth = require('../middleware/auth');
const router = express.Router();

router.use(auth);

// Listar clientes activos
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT cedula, nombre, telefono, direccion, fecha_registro, estado FROM clientes WHERE estado = 'ACTIVO' OR estado IS NULL ORDER BY nombre"
    );
    res.json(rows);
  } catch (error) {
    console.error('Error al listar clientes:', error);
    res.status(500).json({ error: 'Error al obtener clientes.' });
  }
});

// Buscar cliente por cedula
router.get('/:cedula', async (req, res) => {
  try {
    const { cedula } = req.params;
    const [rows] = await pool.query(
      "SELECT cedula, nombre, telefono, direccion, fecha_registro FROM clientes WHERE cedula = ? AND (estado = 'ACTIVO' OR estado IS NULL)",
      [cedula]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado.' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error al buscar cliente:', error);
    res.status(500).json({ error: 'Error al buscar cliente.' });
  }
});

// Registrar cliente
router.post('/', async (req, res) => {
  try {
    const { cedula, nombre, telefono, direccion } = req.body;

    if (!cedula || !nombre) {
      return res.status(400).json({ error: 'Cedula y nombre son obligatorios.' });
    }

    const [result] = await pool.query(
      'INSERT INTO clientes (cedula, nombre, telefono, direccion, fecha_registro, estado) VALUES (?, ?, ?, ?, CURDATE(), ?)',
      [cedula, nombre, telefono || '', direccion || '', 'ACTIVO']
    );

    res.status(201).json({ cedula, nombre, telefono, direccion, estado: 'ACTIVO' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'La cedula ya esta registrada.' });
    }
    console.error('Error al registrar cliente:', error);
    res.status(500).json({ error: 'Error al registrar cliente.' });
  }
});

// Ocultar cliente (cambiar estado a INACTIVO)
router.put('/:cedula/ocultar', async (req, res) => {
  try {
    const { cedula } = req.params;
    const [result] = await pool.query(
      "UPDATE clientes SET estado = 'INACTIVO' WHERE cedula = ?",
      [cedula]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado.' });
    }

    res.json({ message: 'Cliente ocultado exitosamente.' });
  } catch (error) {
    console.error('Error al ocultar cliente:', error);
    res.status(500).json({ error: 'Error al ocultar cliente.' });
  }
});

module.exports = router;
