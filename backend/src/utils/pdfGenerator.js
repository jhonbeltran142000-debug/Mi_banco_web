const PDFDocument = require('pdfkit');

function generarPagare(doc, data) {
  const { prestamoId, nombre, cedula, modalidad, montoPrestado, totalAPagar, plazo, cuotas } = data;

  doc.fontSize(14).font('Helvetica-Bold')
    .text(`PAGARE Y CARTA DE INSTRUCCIONES N. ${prestamoId}`, { align: 'center' });
  doc.moveDown(2);

  doc.fontSize(10).font('Helvetica');
  doc.text(`Por medio del presente PAGARE, yo, ${nombre.toUpperCase()}, mayor de edad,`);
  doc.text(`identificado con C.C. No. ${cedula}, me obligo a pagar incondicionalmente,`);
  doc.text(`solidariamente y a la orden del PRESTAMISTA, la cantidad de`);
  doc.text(`$${Number(totalAPagar).toLocaleString('es-CO')} pesos colombianos.`);
  doc.moveDown(1);
  doc.text(`Este valor corresponde a un capital prestado de $${Number(montoPrestado).toLocaleString('es-CO')} bajo la`);
  doc.text(`modalidad '${modalidad}' a un plazo de ${plazo} cuotas pactadas.`);
  doc.text('El pago se realizara de acuerdo con el siguiente plan de amortizacion.');
  doc.text('En caso de mora, renuncio a requerimientos privados o judiciales.');
  doc.moveDown(2);

  // Tabla de cuotas
  const tableTop = doc.y;
  const colWidths = [80, 120, 120];
  const headers = ['Cuota No.', 'Vencimiento', 'Valor Cuota'];

  // Header
  doc.font('Helvetica-Bold').fontSize(10);
  let x = 75;
  headers.forEach((h, i) => {
    doc.rect(x, tableTop, colWidths[i], 20).fill('#e8eaf6');
    doc.fill('#1a237e').text(h, x + 5, tableTop + 5, { width: colWidths[i] - 10 });
    x += colWidths[i];
  });

  // Rows
  doc.font('Helvetica').fontSize(9).fill('#000000');
  let y = tableTop + 20;
  cuotas.forEach((c) => {
    x = 75;
    doc.rect(x, y, colWidths[0], 18).stroke();
    doc.text(String(c.numero), x + 5, y + 3, { width: colWidths[0] - 10 });
    x += colWidths[0];

    doc.rect(x, y, colWidths[1], 18).stroke();
    doc.text(c.fecha, x + 5, y + 3, { width: colWidths[1] - 10 });
    x += colWidths[1];

    doc.rect(x, y, colWidths[2], 18).stroke();
    doc.text(`$${Number(c.valor).toLocaleString('es-CO')}`, x + 5, y + 3, { width: colWidths[2] - 10 });

    y += 18;
  });

  doc.moveDown(3);
  doc.font('Helvetica-Bold').fontSize(10);
  doc.text('________________________________________', 75);
  doc.text(`FIRMA DEL DEUDOR: ${nombre.toUpperCase()}`, 75);
  doc.text(`C.C. No.: ${cedula}`, 75);
  doc.moveDown(1);
  doc.text('[ ESPACIO PARA HUELLA DACTILAR ]', 75);
}

function generarRecibo(doc, data) {
  const { cliente, prestamoId, cuotaNum, valorPagado, saldoPendiente, fecha } = data;

  doc.fontSize(16).font('Helvetica-Bold')
    .text('RECIBO DE PAGO', { align: 'center' });
  doc.moveDown(2);

  doc.fontSize(12).font('Helvetica');
  doc.text(`Fecha: ${fecha}`);
  doc.text(`Cliente: ${cliente}`);
  doc.text(`Credito No.: ${prestamoId}`);
  doc.text(`Cuota Pagada: No. ${cuotaNum}`);
  doc.text(`Valor Pagado: ${valorPagado}`);
  doc.moveDown(1);
  doc.font('Helvetica-Bold');
  doc.text(`NUEVO SALDO PENDIENTE: $${Number(saldoPendiente).toLocaleString('es-CO')}`);
}

function generarCierreCaja(doc, data) {
  const { fecha, total, usuario } = data;

  doc.fontSize(16).font('Helvetica-Bold')
    .text('REPORTE DE CIERRE DE CAJA DIARIO', { align: 'center' });
  doc.moveDown(2);

  doc.fontSize(12).font('Helvetica');
  doc.text(`Fecha de Cierre: ${fecha}`);
  doc.text(`Usuario Responsable: ${usuario}`);
  doc.moveDown(2);

  doc.fontSize(14).font('Helvetica-Bold');
  doc.text(`TOTAL EFECTIVO RECAUDADO: $${Number(total).toLocaleString('es-CO')}`, { align: 'center', border: true });
}

module.exports = { generarPagare, generarRecibo, generarCierreCaja };
