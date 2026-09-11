import { useState, useEffect } from 'react';
import api, { descargarPDF } from '../../services/api';
import BuscarCartera from './BuscarCartera';
import DetalleCuotas from './DetalleCuotas';
import '../Clientes/Clientes.css';
import './Caja.css';

export default function Caja() {
  const [cliente, setCliente] = useState(null);
  const [prestamos, setPrestamos] = useState([]);
  const [prestamoSeleccionado, setPrestamoSeleccionado] = useState(null);
  const [cierreCaja, setCierreCaja] = useState(0);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    cargarCierreCaja();
  }, []);

  const cargarCierreCaja = async () => {
    try {
      const res = await api.get('/reportes/cierre-caja');
      setCierreCaja(res.data.total);
    } catch (err) {
      console.error('Error al cargar cierre de caja');
    }
  };

  const handleClienteEncontrado = async (cli) => {
    setCliente(cli);
    setPrestamos([]);
    setPrestamoSeleccionado(null);

    if (cli) {
      try {
        const res = await api.get(`/prestamos/cliente/${cli.cedula}`);
        setPrestamos(res.data);
      } catch (err) {
        setError('Error al cargar prestamos del cliente');
      }
    }
  };

  const handlePrestamoSeleccionado = (prestamo) => {
    setPrestamoSeleccionado(prestamo);
  };

  const handlePagoRegistrado = () => {
    cargarCierreCaja();
    setMensaje('Ingreso asentado correctamente. Se genero el recibo.');
  };

  const generarPagaré = async (prestamoId) => {
    setError('');
    try {
      await descargarPDF(
        `/pdf/pagare/${prestamoId}`,
        `Pagare_Prestamo${prestamoId}.pdf`
      );
    } catch (err) {
      setError('No se pudo generar el pagare. Intenta de nuevo.');
    }
  };

  const generarCierreCaja = async () => {
    setError('');
    if (cierreCaja === 0) {
      setMensaje('No se han registrado pagos en efectivo el dia de hoy');
      return;
    }
    try {
      await descargarPDF(
        '/pdf/cierre-caja',
        `Cierre_Caja_${new Date().toISOString().split('T')[0]}.pdf`
      );
    } catch (err) {
      setError('No se pudo generar el cierre de caja. Intenta de nuevo.');
    }
  };

  return (
    <div className="caja-page">
      <div className="page-header">
        <div>
          <h1>Caja y Cobranza</h1>
          <p>Buscar clientes, registrar pagos y generar recibos</p>
        </div>
        <button onClick={generarCierreCaja} className="btn btn-outline">
          Cierre de Caja Diario
        </button>
      </div>

      <BuscarCartera onClienteEncontrado={handleClienteEncontrado} />

      {cliente && (
        <div className="card cliente-banner">
          <div className="card-body">
            <div className="cliente-details">
              <h2>{cliente.nombre}</h2>
              <span className="cliente-meta">
                Tel: {cliente.telefono} | Registro: {cliente.fecha_registro?.split('T')[0]}
              </span>
            </div>
          </div>
        </div>
      )}

      {prestamos.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h2>Creditos del Cliente</h2>
            <span className="page-count">{prestamos.length} creditos</span>
          </div>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Fecha Desembolso</th>
                  <th>Capital</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {prestamos.map((p) => (
                  <tr key={p.id} className={prestamoSeleccionado?.id === p.id ? 'fila-seleccionada' : ''}>
                    <td className="td-mono">{p.id}</td>
                    <td>{p.fecha_desembolso?.split('T')[0]}</td>
                    <td className="td-amount">${parseFloat(p.monto_prestado).toLocaleString('es-CO')}</td>
                    <td className="td-bold">${parseFloat(p.total_a_pagar).toLocaleString('es-CO')}</td>
                    <td><span className="badge badge-success">{p.estado}</span></td>
                    <td>
                      <div className="tab-actions">
                        <button onClick={() => handlePrestamoSeleccionado(p)} className="btn btn-primary btn-sm">
                          Ver Cuotas
                        </button>
                        <button onClick={() => generarPagaré(p.id)} className="btn btn-outline btn-sm">
                          Pagare
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {prestamoSeleccionado && (
        <DetalleCuotas
          prestamoId={prestamoSeleccionado.id}
          onPagoRegistrado={handlePagoRegistrado}
        />
      )}

      <div className="caja-status" aria-live="polite">
        <div className="status-item">
          <span className="status-label">Total Recaudado Hoy</span>
          <span className="status-value">${cierreCaja.toLocaleString('es-CO')}</span>
        </div>
      </div>

      {mensaje && <div className="success-msg" role="status">{mensaje}</div>}
      {error && <div className="error-msg" role="alert">{error}</div>}
    </div>
  );
}
