import { useState, useEffect } from 'react';
import api from '../../services/api';
import '../Clientes/Clientes.css';
import './Creditos.css';

export default function SimuladorCredito() {
  const [clientes, setClientes] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState('');
  const [modalidad, setModalidad] = useState('Bancario (Mes)');
  const [monto, setMonto] = useState('1000000');
  const [tasa, setTasa] = useState('5.0');
  const [plazo, setPlazo] = useState('12');
  const [simulacion, setSimulacion] = useState([]);
  const [scoring, setScoring] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    cargarClientes();
  }, []);

  const cargarClientes = async () => {
    try {
      const res = await api.get('/clientes');
      setClientes(res.data);
    } catch (err) {
      setError('Error al cargar clientes');
    }
  };

  const cargarScoring = async (cedula) => {
    try {
      const res = await api.get(`/scoring/${cedula}`);
      setScoring(res.data);
    } catch (err) {
      setScoring(null);
    }
  };

  const handleClienteChange = (e) => {
    const valor = e.target.value;
    setClienteSeleccionado(valor);
    if (valor) {
      const cedula = valor.split(' - ')[0];
      cargarScoring(cedula);
    } else {
      setScoring(null);
    }
  };

  const handleModalidadChange = (e) => {
    const mod = e.target.value;
    setModalidad(mod);
    if (mod.includes('Gota')) {
      setTasa('20');
      setPlazo('30');
    } else {
      setTasa('5.0');
      setPlazo('12');
    }
  };

  const redondear = (v, b = 1000) => (b === 0 ? v : Math.ceil(v / b) * b);

  const calcularSimulacion = () => {
    setError('');
    try {
      const m = parseFloat(monto);
      const t = parseFloat(tasa) / 100;
      const p = parseInt(plazo);
      const hoy = new Date();
      let total = 0;
      const cuotas = [];

      if (modalidad.includes('Gota')) {
        const valorCuota = redondear((m + m * t) / p, 100);
        for (let i = 1; i <= p; i++) {
          const fecha = new Date(hoy);
          fecha.setDate(fecha.getDate() + i);
          cuotas.push({ numero: i, fecha: fecha.toISOString().split('T')[0], valor: valorCuota });
          total += valorCuota;
        }
      } else {
        const amortizacion = m / p;
        let saldo = m;
        for (let i = 1; i <= p; i++) {
          const valorCuota = redondear(amortizacion + saldo * t, 1000);
          saldo -= amortizacion;
          const fecha = new Date(hoy);
          fecha.setDate(fecha.getDate() + 30 * i);
          cuotas.push({ numero: i, fecha: fecha.toISOString().split('T')[0], valor: valorCuota });
          total += valorCuota;
        }
      }

      setSimulacion({ cuotas, total, ganancia: total - m });
    } catch (err) {
      setError('Verifique que los montos y plazos sean numericos');
    }
  };

  const desembolsar = async () => {
    if (!clienteSeleccionado) {
      setError('Seleccione un cliente para desembolsar');
      return;
    }
    if (!simulacion.cuotas || simulacion.cuotas.length === 0) {
      setError('Debe calcular la simulacion antes de desembolsar');
      return;
    }

    try {
      const cedula = clienteSeleccionado.split(' - ')[0];
      await api.post('/prestamos', {
        cedula,
        modalidad,
        monto: parseFloat(monto),
        tasa: parseFloat(tasa),
        plazo: parseInt(plazo),
        total: simulacion.total,
        lista_cuotas: simulacion.cuotas,
      });
      setMensaje('Credito desembolsado y guardado correctamente');
      setSimulacion({ cuotas: [], total: 0, ganancia: 0 });
    } catch (err) {
      setError(err.response?.data?.error || 'Error al desembolsar credito');
    }
  };

  return (
    <div className="page-section">
      <div className="page-header">
        <div>
          <h1>Simulador Financiero</h1>
          <p>Calcular cronograma de pagos y desembolsar creditos</p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Parametros del Credito</h2>
          {scoring && (
            <span className="scoring-badge" style={{ color: scoring.color }}>
              {scoring.texto}
            </span>
          )}
        </div>
        <div className="card-body">
          <div className="simulador-grid">
            <div className="form-field">
              <label htmlFor="sim-cliente">Cliente</label>
              <select id="sim-cliente" value={clienteSeleccionado} onChange={handleClienteChange}>
                <option value="">Seleccione un cliente</option>
                {clientes.map((c) => (
                  <option key={c.cedula} value={`${c.cedula} - ${c.nombre}`}>
                    {c.cedula} - {c.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="sim-modalidad">Modalidad</label>
              <select id="sim-modalidad" value={modalidad} onChange={handleModalidadChange}>
                <option value="Bancario (Mes)">Bancario (Mes)</option>
                <option value="Gota a Gota (Dia)">Gota a Gota (Dia)</option>
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="sim-monto">Monto</label>
              <input id="sim-monto" type="number" value={monto} onChange={(e) => setMonto(e.target.value)} />
            </div>

            <div className="form-field">
              <label htmlFor="sim-tasa">{modalidad.includes('Gota') ? 'Ganancia (%)' : 'Interes (%)'}</label>
              <input id="sim-tasa" type="number" value={tasa} onChange={(e) => setTasa(e.target.value)} step="0.1" />
            </div>

            <div className="form-field">
              <label htmlFor="sim-plazo">{modalidad.includes('Gota') ? 'Dias' : 'Meses'}</label>
              <input id="sim-plazo" type="number" value={plazo} onChange={(e) => setPlazo(e.target.value)} />
            </div>
          </div>

          <div className="sim-btn-group">
            <button onClick={calcularSimulacion} className="btn btn-primary">Calcular Simulacion</button>
            <button onClick={desembolsar} className="btn btn-success">Desembolsar Credito</button>
          </div>
        </div>
      </div>

      {simulacion.cuotas && simulacion.cuotas.length > 0 && (
        <>
          <div className="resumen-grid">
            <div className="resumen-card">
              <span className="resumen-label">Prestas</span>
              <span className="resumen-value">${parseFloat(monto).toLocaleString('es-CO')}</span>
            </div>
            <div className="resumen-card resumen-total">
              <span className="resumen-label">Recibes</span>
              <span className="resumen-value">${simulacion.total.toLocaleString('es-CO')}</span>
            </div>
            <div className="resumen-card resumen-ganancia">
              <span className="resumen-label">Ganancia</span>
              <span className="resumen-value">${simulacion.ganancia.toLocaleString('es-CO')}</span>
            </div>
          </div>

          <div className="cronograma-card">
            <div className="cronograma-header">
              <h2>Cronograma de Pagos</h2>
            </div>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Fecha Vencimiento</th>
                    <th>Valor Cuota</th>
                  </tr>
                </thead>
                <tbody>
                  {simulacion.cuotas.map((c) => (
                    <tr key={c.numero}>
                      <td className="td-mono">{c.numero}</td>
                      <td>{c.fecha}</td>
                      <td className="td-amount">${c.valor.toLocaleString('es-CO')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {mensaje && <div className="success-msg" role="status">{mensaje}</div>}
      {error && <div className="error-msg" role="alert">{error}</div>}
    </div>
  );
}
