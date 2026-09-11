// Calculo del cronograma de pagos en el servidor.
// El cliente solo envia monto/tasa/plazo/modalidad; los valores
// financieros siempre se derivan aqui para evitar manipulacion.

const MODALIDADES = {
  BANCARIO: 'Bancario (Mes)',
  GOTA_DIA: 'Gota a Gota (Dia)',
  GOTA_SEMANA: 'Gota a Gota (Semana)',
};

const MODALIDADES_VALIDAS = Object.values(MODALIDADES);

const LIMITES = {
  montoMax: 1000000000,
  tasaMax: 1000,
  plazoMax: 520,
};

const redondear = (valor, base = 1000) => (base === 0 ? valor : Math.ceil(valor / base) * base);

const formatearFecha = (fecha) => {
  const y = fecha.getFullYear();
  const m = String(fecha.getMonth() + 1).padStart(2, '0');
  const d = String(fecha.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const validarParametros = ({ monto, tasa, plazo, modalidad }) => {
  const m = Number(monto);
  const t = Number(tasa);
  const p = Number(plazo);

  if (!MODALIDADES_VALIDAS.includes(modalidad)) {
    return 'Modalidad invalida.';
  }
  if (!Number.isFinite(m) || m <= 0 || m > LIMITES.montoMax) {
    return 'Monto invalido.';
  }
  if (!Number.isFinite(t) || t < 0 || t > LIMITES.tasaMax) {
    return 'Tasa invalida.';
  }
  if (!Number.isInteger(p) || p < 1 || p > LIMITES.plazoMax) {
    return 'Plazo invalido.';
  }
  return null;
};

const calcularCronograma = ({ monto, tasa, plazo, modalidad, fechaBase = new Date() }) => {
  const m = Number(monto);
  const t = Number(tasa) / 100;
  const p = Number(plazo);
  const cuotas = [];

  if (modalidad === MODALIDADES.GOTA_DIA || modalidad === MODALIDADES.GOTA_SEMANA) {
    const dias = modalidad === MODALIDADES.GOTA_SEMANA ? 7 : 1;
    const valorCuota = redondear((m + m * t) / p, 100);
    for (let i = 1; i <= p; i++) {
      const fecha = new Date(fechaBase);
      fecha.setDate(fecha.getDate() + i * dias);
      cuotas.push({ numero: i, fecha: formatearFecha(fecha), valor: valorCuota });
    }
  } else {
    const amortizacion = m / p;
    let saldo = m;
    for (let i = 1; i <= p; i++) {
      const valorCuota = redondear(amortizacion + saldo * t, 1000);
      saldo -= amortizacion;
      const fecha = new Date(fechaBase);
      fecha.setDate(fecha.getDate() + 30 * i);
      cuotas.push({ numero: i, fecha: formatearFecha(fecha), valor: valorCuota });
    }
  }

  const total = cuotas.reduce((sum, c) => sum + c.valor, 0);
  return { cuotas, total, ganancia: total - m };
};

module.exports = {
  MODALIDADES,
  MODALIDADES_VALIDAS,
  LIMITES,
  redondear,
  validarParametros,
  calcularCronograma,
};
