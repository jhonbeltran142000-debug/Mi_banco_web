const express = require('express');
const pool = require('../config/database');
const auth = require('../middleware/auth');
const router = express.Router();

router.use(auth);

// Metricas del dashboard (solo datos del usuario)
router.get('/dashboard', async (req, res) => {
  try {
    const userId = req.user.id;

    const [calleResult] = await pool.query(`
      SELECT COALESCE(SUM(cp.valor_cuota), 0) as total
      FROM cronograma_pagos cp
      JOIN prestamos p ON cp.prestamo_id = p.id
      WHERE p.user_id = ? AND cp.estado = 'PENDIENTE'
    `, [userId]);

    const [recaudadoResult] = await pool.query(`
      SELECT COALESCE(SUM(cp.valor_cuota), 0) as total
      FROM cronograma_pagos cp
      JOIN prestamos p ON cp.prestamo_id = p.id
      WHERE p.user_id = ?
        AND cp.estado = 'PAGADA'
        AND MONTH(cp.fecha_pago_real) = MONTH(CURRENT_DATE())
        AND YEAR(cp.fecha_pago_real) = YEAR(CURRENT_DATE())
    `, [userId]);

    const [gananciaResult] = await pool.query(`
      SELECT COALESCE(SUM(p.total_a_pagar - p.monto_prestado), 0) as total
      FROM prestamos p
      WHERE p.user_id = ?
    `, [userId]);

    const [riesgoResult] = await pool.query(`
      SELECT COALESCE(SUM(cp.valor_cuota), 0) as total
      FROM cronograma_pagos cp
      JOIN prestamos p ON cp.prestamo_id = p.id
      WHERE p.user_id = ?
        AND cp.estado = 'PENDIENTE'
        AND cp.fecha_vencimiento < CURRENT_DATE()
    `, [userId]);

    res.json({
      calle: parseFloat(calleResult[0].total),
      recaudado: parseFloat(recaudadoResult[0].total),
      ganancia: parseFloat(gananciaResult[0].total),
      riesgo: parseFloat(riesgoResult[0].total),
    });
  } catch (error) {
    console.error('Error al obtener metricas:', error);
    res.status(500).json({ error: 'Error al obtener metricas del dashboard.' });
  }
});

// Reporte general consolidado (solo datos del usuario)
router.get('/general', async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query(`
      SELECT c.cedula, c.nombre, p.monto_prestado, p.fecha_desembolso, p.plazo, p.modalidad
      FROM prestamos p
      JOIN clientes c ON p.cliente_cedula = c.cedula
      WHERE p.user_id = ? AND (c.estado = 'ACTIVO' OR c.estado IS NULL)
      ORDER BY p.id DESC
    `, [userId]);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener reporte general:', error);
    res.status(500).json({ error: 'Error al obtener reporte.' });
  }
});

// Cierre de caja hoy (solo datos del usuario)
router.get('/cierre-caja', async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query(`
      SELECT COALESCE(SUM(cp.valor_cuota), 0) as total
      FROM cronograma_pagos cp
      JOIN prestamos p ON cp.prestamo_id = p.id
      WHERE p.user_id = ?
        AND cp.estado = 'PAGADA'
        AND cp.fecha_pago_real = CURRENT_DATE()
    `, [userId]);
    res.json({ total: parseFloat(rows[0].total) });
  } catch (error) {
    console.error('Error al obtener cierre de caja:', error);
    res.status(500).json({ error: 'Error al obtener cierre de caja.' });
  }
});

module.exports = router;
