const express = require('express');
const pool = require('../config/database');
const auth = require('../middleware/auth');
const router = express.Router();

router.use(auth);

// Obtener prestamos de un cliente (verificar que pertenece al usuario)
router.get('/cliente/:cedula', async (req, res) => {
  try {
    const userId = req.user.id;
    const { cedula } = req.params;
    const [rows] = await pool.query(
      'SELECT id, cliente_cedula, modalidad, monto_prestado, tasa_interes, plazo, fecha_desembolso, total_a_pagar, estado FROM prestamos WHERE cliente_cedula = ? AND user_id = ? ORDER BY id DESC',
      [cedula, userId]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener prestamos:', error);
    res.status(500).json({ error: 'Error al obtener prestamos.' });
  }
});

// Obtener detalle de cuotas de un prestamo (verificar que pertenece al usuario)
router.get('/:id/cuotas', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Verificar que el prestamo pertenece al usuario
    const [prestamo] = await pool.query('SELECT id FROM prestamos WHERE id = ? AND user_id = ?', [id, userId]);
    if (prestamo.length === 0) {
      return res.status(404).json({ error: 'Prestamo no encontrado.' });
    }

    const [rows] = await pool.query(
      'SELECT id, prestamo_id, numero_cuota, fecha_vencimiento, valor_cuota, estado, fecha_pago_real FROM cronograma_pagos WHERE prestamo_id = ? ORDER BY numero_cuota',
      [id]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener cuotas:', error);
    res.status(500).json({ error: 'Error al obtener cuotas.' });
  }
});

// Guardar prestamo completo (prestamo + cronograma)
router.post('/', async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const userId = req.user.id;
    const { cedula, modalidad, monto, tasa, plazo, total, lista_cuotas } = req.body;

    if (!cedula || !modalidad || !monto || !tasa || !plazo || !total || !lista_cuotas) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    }

    // Verificar que el cliente pertenece al usuario
    const [cliente] = await pool.query('SELECT cedula FROM clientes WHERE cedula = ? AND user_id = ?', [cedula, userId]);
    if (cliente.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado.' });
    }

    await conn.beginTransaction();

    const fecha = new Date().toISOString().split('T')[0];

    const [prestamoResult] = await conn.query(
      'INSERT INTO prestamos (user_id, cliente_cedula, modalidad, monto_prestado, tasa_interes, plazo, fecha_desembolso, total_a_pagar) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, cedula, modalidad, monto, tasa, plazo, fecha, total]
    );

    const prestamoId = prestamoResult.insertId;

    for (const cuota of lista_cuotas) {
      await conn.query(
        'INSERT INTO cronograma_pagos (prestamo_id, numero_cuota, fecha_vencimiento, valor_cuota) VALUES (?, ?, ?, ?)',
        [prestamoId, cuota.numero, cuota.fecha, cuota.valor]
      );
    }

    await conn.commit();

    res.status(201).json({ id: prestamoId, message: 'Prestamo desembolsado exitosamente.' });
  } catch (error) {
    await conn.rollback();
    console.error('Error al guardar prestamo:', error);
    res.status(500).json({ error: 'Error al guardar prestamo.' });
  } finally {
    conn.release();
  }
});

// Obtener recaudo de un prestamo (verificar que pertenece al usuario)
router.get('/:id/recaudo', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Verificar que el prestamo pertenece al usuario
    const [prestamo] = await pool.query('SELECT id FROM prestamos WHERE id = ? AND user_id = ?', [id, userId]);
    if (prestamo.length === 0) {
      return res.status(404).json({ error: 'Prestamo no encontrado.' });
    }

    const [rows] = await pool.query(
      "SELECT COALESCE(SUM(valor_cuota), 0) as recaudo FROM cronograma_pagos WHERE prestamo_id = ? AND estado = 'PAGADA'",
      [id]
    );
    res.json({ recaudo: parseFloat(rows[0].recaudo) });
  } catch (error) {
    console.error('Error al obtener recaudo:', error);
    res.status(500).json({ error: 'Error al obtener recaudo.' });
  }
});

module.exports = router;
