import { useState } from 'react';
import api from '../../services/api';

export default function FormCliente({ onClienteGuardado }) {
  const [form, setForm] = useState({ cedula: '', nombre: '', telefono: '', direccion: '' });
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');
    setError('');

    if (!form.cedula || !form.nombre) {
      setError('Cedula y nombre son obligatorios');
      return;
    }

    try {
      await api.post('/clientes', form);
      setMensaje('Cliente guardado correctamente');
      setForm({ cedula: '', nombre: '', telefono: '', direccion: '' });
      if (onClienteGuardado) onClienteGuardado();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar cliente');
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2>Registro de Cliente Nuevo</h2>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit} className="form-grid">
          <div className="form-field">
            <label htmlFor="fc-cedula">Cedula</label>
            <input id="fc-cedula" name="cedula" value={form.cedula} onChange={handleChange} placeholder=" Numero de cedula" required />
          </div>
          <div className="form-field">
            <label htmlFor="fc-nombre">Nombre</label>
            <input id="fc-nombre" name="nombre" value={form.nombre} onChange={handleChange} placeholder="Nombre completo" required />
          </div>
          <div className="form-field">
            <label htmlFor="fc-telefono">Telefono</label>
            <input id="fc-telefono" name="telefono" value={form.telefono} onChange={handleChange} placeholder="Telefono" />
          </div>
          <div className="form-field">
            <label htmlFor="fc-direccion">Direccion</label>
            <input id="fc-direccion" name="direccion" value={form.direccion} onChange={handleChange} placeholder="Direccion" />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-success">Guardar Cliente</button>
          </div>
        </form>

        {mensaje && <div className="success-msg" role="status" style={{ marginTop: '16px' }}>{mensaje}</div>}
        {error && <div className="error-msg" role="alert" style={{ marginTop: '16px' }}>{error}</div>}
      </div>
    </div>
  );
}
