import { useState } from 'react';
import api from '../../services/api';

export default function BuscarCartera({ onClienteEncontrado }) {
  const [cedula, setCedula] = useState('');
  const [error, setError] = useState('');

  const buscarCliente = async () => {
    setError('');
    if (!cedula) {
      setError('Ingrese una cedula');
      return;
    }

    try {
      const res = await api.get(`/clientes/${cedula}`);
      onClienteEncontrado(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Cliente no encontrado');
      onClienteEncontrado(null);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') buscarCliente();
  };

  return (
    <div className="card buscar-card">
      <div className="card-header">
        <h2>Buscar Cliente</h2>
      </div>
      <div className="card-body">
        <div className="buscar-row">
          <div className="buscar-input-wrapper">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              value={cedula}
              onChange={(e) => setCedula(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ingrese cedula del cliente"
            />
          </div>
          <button onClick={buscarCliente} className="btn btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            Consultar
          </button>
        </div>
        {error && <div className="error-msg" role="alert" style={{ marginTop: '12px' }}>{error}</div>}
      </div>
    </div>
  );
}
