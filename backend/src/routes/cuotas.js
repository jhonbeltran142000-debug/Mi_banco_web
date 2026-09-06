const express = require('express');
const pool = require('../config/database');
const auth = require('../middleware/auth');
const router = express.Router();

router.use(auth);

// Registrar pago de cuota (verificar que pertenece al usuario)
router.post('/:id/pagar', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Verificar que la cuota pertenece a un prestamo del usuario
    const [verificacion] = await pool.query(
      `SELECT cp.id FROM cronograma_pagos cp
       JOIN prestamos p ON cp.prestamo_id = p.id
       WHERE cp.id = ? AND p.user_id = ?`,
      [id, userId]
    );

    if (verificacion.length === 0) {
      return res.status(404).json({ error: 'Cuota no encontrada.' });
    }

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
