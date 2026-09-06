import { useState, useEffect } from 'react';
import api from '../../services/api';
import FormCliente from './FormCliente';
import ConfirmModal from '../common/ConfirmModal';
import './Clientes.css';

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [ocultarSeleccionado, setOcultarSeleccionado] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

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

  const handleClienteGuardado = () => {
    cargarClientes();
    setMensaje('Cliente registrado exitosamente');
  };

  const ocultarCliente = async () => {
    if (!ocultarSeleccionado) {
      setError('Seleccione un cliente para ocultar');
      return;
    }
    setShowConfirm(true);
  };

  const confirmarOcultar = async () => {
    setShowConfirm(false);
    try {
      const cedula = ocultarSeleccionado.split(' - ')[0];
      await api.put(`/clientes/${cedula}/ocultar`);
      setMensaje('Cliente ocultado del sistema exitosamente');
      setOcultarSeleccionado('');
      cargarClientes();
    } catch (err) {
      setError('Error al ocultar cliente');
    }
  };

  return (
    <div className="page-section">
      <div className="page-header">
        <div>
          <h1>Gestion de Clientes</h1>
          <p>Registrar, buscar y administrar clientes</p>
        </div>
        <span className="page-count">{clientes.length} clientes</span>
      </div>

      <FormCliente onClienteGuardado={handleClienteGuardado} />

      <div className="card">
        <div className="card-header">
          <h2>Ocultar Cliente</h2>
        </div>
        <div className="card-body">
          <p style={{ color: '#8c8c9a', fontSize: '0.9rem', marginBottom: '16px' }}>
            No se borra de la base de datos, solo se oculta de los reportes y busquedas.
          </p>
          <div className="ocultar-row">
            <label htmlFor="sel-ocultar" className="sr-only">Seleccionar cliente para ocultar</label>
            <select
              id="sel-ocultar"
              value={ocultarSeleccionado}
              onChange={(e) => setOcultarSeleccionado(e.target.value)}
            >
              <option value="">Seleccione un cliente</option>
              {clientes.map((c) => (
                <option key={c.cedula} value={`${c.cedula} - ${c.nombre}`}>
                  {c.cedula} - {c.nombre}
                </option>
              ))}
            </select>
            <button onClick={ocultarCliente} className="btn btn-danger">
              Ocultar Cliente
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Clientes Registrados</h2>
          <span className="page-count">{clientes.length} registros</span>
        </div>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Cedula</th>
                <th>Nombre</th>
                <th>Telefono</th>
                <th>Direccion</th>
                <th>Registro</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((c) => (
                <tr key={c.cedula}>
                  <td className="td-mono">{c.cedula}</td>
                  <td className="td-bold">{c.nombre}</td>
                  <td>{c.telefono}</td>
                  <td>{c.direccion}</td>
                  <td>{c.fecha_registro?.split('T')[0]}</td>
                </tr>
              ))}
              {clientes.length === 0 && (
                <tr><td colSpan="5" className="no-data">No hay clientes registrados</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {mensaje && <div className="success-msg" role="status">{mensaje}</div>}
      {error && <div className="error-msg" role="alert">{error}</div>}

      {showConfirm && (
        <ConfirmModal
          mensaje={`Esta seguro que desea ocultar a ${ocultarSeleccionado}? No aparecera en reportes ni busquedas.`}
          onConfirmar={confirmarOcultar}
          onCancelar={() => setShowConfirm(false)}
        />
      )}
    </div>
  );
}
