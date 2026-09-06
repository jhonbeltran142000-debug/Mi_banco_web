import { useState, useEffect } from 'react';
import api, { BASE_URL } from '../../services/api';
import ConfirmModal from '../common/ConfirmModal';

export default function DetalleCuotas({ prestamoId, onPagoRegistrado }) {
  const [cuotas, setCuotas] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [cuotaPendiente, setCuotaPendiente] = useState(null);

  useEffect(() => {
    if (prestamoId) cargarCuotas();
  }, [prestamoId]);

  const cargarCuotas = async () => {
    try {
      const res = await api.get(`/prestamos/${prestamoId}/cuotas`);
      setCuotas(res.data);
    } catch (err) {
      setError('Error al cargar cuotas');
    }
  };

  const registrarPago = async (cuota) => {
    if (cuota.estado === 'PAGADA') {
      setMensaje('Esta cuota ya fue recaudada');
      return;
    }
    setCuotaPendiente(cuota);
    setShowConfirm(true);
  };

  const confirmarPago = async () => {
    setShowConfirm(false);
    const cuota = cuotaPendiente;
    setCuotaPendiente(null);

    try {
      await api.post(`/cuotas/${cuota.id}/pagar`);
      setMensaje('Pago registrado exitosamente');

      const token = localStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/api/pdf/recibo/${cuota.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Recibo_Cuota_${cuota.numero_cuota}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);

      if (onPagoRegistrado) onPagoRegistrado();

      cargarCuotas();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrar pago');
    }
  };

  return (
    <div>
      <div className="cronograma-card">
        <div className="cronograma-header">
          <h2>Cuotas del Credito #{prestamoId}</h2>
        </div>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Cuota #</th>
                <th>Vencimiento</th>
                <th>Valor</th>
                <th>Estado</th>
                <th>Accion</th>
              </tr>
            </thead>
            <tbody>
              {cuotas.map((c) => (
                <tr key={c.id} className={c.estado === 'PAGADA' ? 'cuota-pagada' : 'cuota-pendiente'}>
                  <td className="td-mono">{c.id}</td>
                  <td className="td-mono">{c.numero_cuota}</td>
                  <td>{c.fecha_vencimiento?.split('T')[0]}</td>
                  <td className="td-amount">${parseFloat(c.valor_cuota).toLocaleString('es-CO')}</td>
                  <td>
                    <span className={`badge ${c.estado === 'PAGADA' ? 'badge-success' : 'badge-warning'}`}>
                      {c.estado}
                    </span>
                  </td>
                  <td>
                    {c.estado === 'PENDIENTE' && (
                      <button onClick={() => registrarPago(c)} className="btn btn-success btn-sm">
                        Pagar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {cuotas.length === 0 && (
                <tr><td colSpan="6" className="no-data">No hay cuotas registradas</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {mensaje && <div className="success-msg" role="status" style={{ marginTop: '16px' }}>{mensaje}</div>}
      {error && <div className="error-msg" role="alert" style={{ marginTop: '16px' }}>{error}</div>}

      {showConfirm && (
        <ConfirmModal
          mensaje={`Registrar ingreso de $${parseFloat(cuotaPendiente?.valor_cuota || 0).toLocaleString('es-CO')} en caja?`}
          onConfirmar={confirmarPago}
          onCancelar={() => { setShowConfirm(false); setCuotaPendiente(null); }}
        />
      )}
    </div>
  );
}
