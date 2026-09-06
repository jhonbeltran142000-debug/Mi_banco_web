const express = require('express');
const pool = require('../config/database');
const auth = require('../middleware/auth');
const router = express.Router();

router.use(auth);

router.get('/:cedula', async (req, res) => {
  try {
    const userId = req.user.id;
    const { cedula } = req.params;

    // Verificar que el cliente pertenece al usuario
    const [cliente] = await pool.query('SELECT cedula FROM clientes WHERE cedula = ? AND user_id = ?', [cedula, userId]);
    if (cliente.length === 0) {
      return res.json({ nivel: 'NUEVO', texto: '⭐⭐⭐ (Nuevo)', color: 'gray' });
    }

    const [rows] = await pool.query(`
      SELECT c.fecha_vencimiento, c.fecha_pago_real, c.estado
      FROM cronograma_pagos c
      JOIN prestamos p ON c.prestamo_id = p.id
      WHERE p.cliente_cedula = ? AND p.user_id = ?
    `, [cedula, userId]);

    const historial = rows;

    if (historial.length === 0) {
      return res.json({ nivel: 'NUEVO', texto: '⭐⭐⭐ (Nuevo)', color: 'gray' });
    }

    let totalDiasMora = 0;
    let cuotasEvaluadas = 0;
    const hoy = new Date();

    for (const h of historial) {
      const fechaVenc = new Date(h.fecha_vencimiento);
      let diasMora = 0;

      if (h.estado === 'PAGADA' && h.fecha_pago_real) {
        const fechaPago = new Date(h.fecha_pago_real);
        if (fechaPago > fechaVenc) {
          diasMora = Math.floor((fechaPago - fechaVenc) / (1000 * 60 * 60 * 24));
        }
      } else if (h.estado === 'PENDIENTE') {
        if (hoy > fechaVenc) {
          diasMora = Math.floor((hoy - fechaVenc) / (1000 * 60 * 60 * 24));
        }
      }

      if (diasMora > 0) totalDiasMora += diasMora;
      cuotasEvaluadas++;
    }

    const promedio = cuotasEvaluadas > 0 ? totalDiasMora / cuotasEvaluadas : 0;

    let resultado;
    if (promedio === 0) resultado = { nivel: 'EXCELENTE', texto: '⭐⭐⭐⭐⭐ (Puntual)', color: '#27ae60' };
    else if (promedio <= 5) resultado = { nivel: 'BUENO', texto: `⭐⭐⭐⭐ (${Math.floor(promedio)} días mora)`, color: '#2980b9' };
    else if (promedio <= 15) resultado = { nivel: 'REGULAR', texto: `⭐⭐⭐ (${Math.floor(promedio)} días mora)`, color: '#f39c12' };
    else if (promedio <= 30) resultado = { nivel: 'RIESGO', texto: `⭐⭐ (${Math.floor(promedio)} días mora)`, color: '#e67e22' };
    else resultado = { nivel: 'PELIGRO', texto: `⭐ (${Math.floor(promedio)} días mora)`, color: '#c0392b' };

    res.json(resultado);
  } catch (error) {
    console.error('Error al calcular scoring:', error);
    res.status(500).json({ error: 'Error al calcular scoring.' });
  }
});

module.exports = router;
