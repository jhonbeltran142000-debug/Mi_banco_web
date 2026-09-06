const pool = require('../config/database');

async function calcularScoring(cedula) {
  const result = await pool.query(`
    SELECT c.fecha_vencimiento, c.fecha_pago_real, c.estado
    FROM cronograma_pagos c
    JOIN prestamos p ON c.prestamo_id = p.id
    WHERE p.cliente_cedula = $1
  `, [cedula]);

  const historial = result.rows;

  if (historial.length === 0) {
    return { nivel: 'NUEVO', texto: '⭐⭐⭐ (Nuevo)', color: 'gray' };
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

  if (promedio === 0) return { nivel: 'EXCELENTE', texto: '⭐⭐⭐⭐⭐ (Puntual)', color: '#27ae60' };
  if (promedio <= 5) return { nivel: 'BUENO', texto: `⭐⭐⭐⭐ (${Math.floor(promedio)} días mora)`, color: '#2980b9' };
  if (promedio <= 15) return { nivel: 'REGULAR', texto: `⭐⭐⭐ (${Math.floor(promedio)} días mora)`, color: '#f39c12' };
  if (promedio <= 30) return { nivel: 'RIESGO', texto: `⭐⭐ (${Math.floor(promedio)} días mora)`, color: '#e67e22' };
  return { nivel: 'PELIGRO', texto: `⭐ (${Math.floor(promedio)} días mora)`, color: '#c0392b' };
}

module.exports = { calcularScoring };
