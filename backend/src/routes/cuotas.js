const express = require('express');
const pool = require('../config/database');
const auth = require('../middleware/auth');
const router = express.Router();

router.use(auth);

// Registrar pago de cuota
router.post('/:id/pagar', async (req, res) => {
  try {
    const { id } = req.params;
    const fechaHoy = new Date().toISOString().split('T')[0];

    const [result] = await pool.query(
      "UPDATE cronograma_pagos SET estado = 'PAGADA', fecha_pago_real = ? WHERE id = ? AND estado = 'PENDIENTE'",
      [fechaHoy, id]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({ error: 'La cuota ya fue pagada o no existe.' });
    }

    res.json({ message: 'Pago registrado exitosamente.' });
  } catch (error) {
    console.error('Error al registrar pago:', error);
    res.status(500).json({ error: 'Error al registrar pago.' });
  }
});

module.exports = router;
