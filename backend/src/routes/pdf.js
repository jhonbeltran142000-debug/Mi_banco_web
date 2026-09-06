const express = require('express');
const pool = require('../config/database');
const auth = require('../middleware/auth');
const { generarPagare, generarRecibo, generarCierreCaja } = require('../utils/pdfGenerator');
const PDFDocument = require('pdfkit');
const router = express.Router();

router.use(auth);

// Descargar Pagaré PDF (verificar que pertenece al usuario)
router.get('/pagare/:prestamoId', async (req, res) => {
  try {
    const userId = req.user.id;
    const { prestamoId } = req.params;

    const [prestamoRows] = await pool.query('SELECT * FROM prestamos WHERE id = ? AND user_id = ?', [prestamoId, userId]);
    if (prestamoRows.length === 0) {
      return res.status(404).json({ error: 'Prestamo no encontrado.' });
    }
    const prestamo = prestamoRows[0];

    const [clienteRows] = await pool.query('SELECT * FROM clientes WHERE cedula = ? AND user_id = ?', [prestamo.cliente_cedula, userId]);
    const cliente = clienteRows[0];

    const [cuotasRows] = await pool.query(
      'SELECT numero_cuota, fecha_vencimiento, valor_cuota FROM cronograma_pagos WHERE prestamo_id = ? ORDER BY numero_cuota',
      [prestamoId]
    );

    const cuotas = cuotasRows.map(c => ({
      numero: c.numero_cuota,
      fecha: new Date(c.fecha_vencimiento).toISOString().split('T')[0],
      valor: parseFloat(c.valor_cuota),
    }));

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Pagare_${prestamo.cliente_cedula}_Prestamo${prestamoId}.pdf`);

    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(res);

    generarPagare(doc, {
      prestamoId,
      nombre: cliente.nombre,
      cedula: cliente.cedula,
      modalidad: prestamo.modalidad,
      montoPrestado: parseFloat(prestamo.monto_prestado),
      totalAPagar: parseFloat(prestamo.total_a_pagar),
      plazo: prestamo.plazo,
      cuotas,
    });

    doc.end();
  } catch (error) {
    console.error('Error al generar pagare:', error);
    res.status(500).json({ error: 'Error al generar PDF.' });
  }
});

// Descargar Recibo de Pago PDF (verificar que pertenece al usuario)
router.get('/recibo/:cuotaId', async (req, res) => {
  try {
    const userId = req.user.id;
    const { cuotaId } = req.params;

    const [cuotaRows] = await pool.query(
      `SELECT cp.*, p.cliente_cedula, p.total_a_pagar, p.monto_prestado, p.user_id
       FROM cronograma_pagos cp
       JOIN prestamos p ON cp.prestamo_id = p.id
       WHERE cp.id = ? AND p.user_id = ?`,
      [cuotaId, userId]
    );

    if (cuotaRows.length === 0) {
      return res.status(404).json({ error: 'Cuota no encontrada.' });
    }
    const cuota = cuotaRows[0];

    const [clienteRows] = await pool.query('SELECT * FROM clientes WHERE cedula = ? AND user_id = ?', [cuota.cliente_cedula, userId]);
    const cliente = clienteRows[0];

    const [recaudoRows] = await pool.query(
      "SELECT COALESCE(SUM(valor_cuota), 0) as recaudo FROM cronograma_pagos WHERE prestamo_id = ? AND estado = 'PAGADA'",
      [cuota.prestamo_id]
    );

    const recaudo = parseFloat(recaudoRows[0].recaudo);
    const saldoPendiente = parseFloat(cuota.total_a_pagar) - recaudo;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Recibo_Pago_${cuota.cliente_cedula}_Cuota${cuota.numero_cuota}.pdf`);

    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(res);

    generarRecibo(doc, {
      cliente: cliente.nombre,
      prestamoId: cuota.prestamo_id,
      cuotaNum: cuota.numero_cuota,
      valorPagado: `$${parseFloat(cuota.valor_cuota).toLocaleString('es-CO')}`,
      saldoPendiente,
      fecha: new Date().toISOString().replace('T', ' ').substring(0, 19),
    });

    doc.end();
  } catch (error) {
    console.error('Error al generar recibo:', error);
    res.status(500).json({ error: 'Error al generar PDF.' });
  }
});

// Descargar Cierre de Caja PDF (solo datos del usuario)
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

    const total = parseFloat(rows[0].total);

    // Obtener nombre del usuario
    const [userRows] = await pool.query('SELECT username FROM usuarios WHERE id = ?', [userId]);
    const username = userRows[0]?.username || 'Usuario';

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Cierre_Caja_${new Date().toISOString().split('T')[0]}.pdf`);

    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(res);

    generarCierreCaja(doc, {
      fecha: new Date().toISOString().replace('T', ' ').substring(0, 19),
      total,
      usuario: username,
    });

    doc.end();
  } catch (error) {
    console.error('Error al generar cierre de caja:', error);
    res.status(500).json({ error: 'Error al generar PDF.' });
  }
});

module.exports = router;
