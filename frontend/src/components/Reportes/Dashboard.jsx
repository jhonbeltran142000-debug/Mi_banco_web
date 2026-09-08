import { useState, useEffect } from 'react';
import api from '../../services/api';
import './Reportes.css';

export default function Dashboard() {
  const [metricas, setMetricas] = useState({ calle: 0, recaudado: 0, ganancia: 0, riesgo: 0 });
  const [reporte, setReporte] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const [metricasRes, reporteRes] = await Promise.all([
        api.get('/reportes/dashboard'),
        api.get('/reportes/general'),
      ]);
      setMetricas(metricasRes.data);
      setReporte(reporteRes.data);
    } catch (err) {
      console.error('Error al cargar reportes');
    } finally {
      setCargando(false);
    }
  };

  const calcularFechaFin = (fechaInicio, plazo, modalidad) => {
    const fecha = new Date(fechaInicio);
    if (modalidad === 'Gota a Gota (Semana)') {
      fecha.setDate(fecha.getDate() + plazo * 7);
    } else if (modalidad.includes('Gota')) {
      fecha.setDate(fecha.getDate() + plazo);
    } else {
      fecha.setDate(fecha.getDate() + plazo * 30);
    }
    return fecha.toISOString().split('T')[0];
  };

  const totalDesembolsado = reporte.reduce((sum, r) => sum + parseFloat(r.monto_prestado || 0), 0);

  return (
    <div className="dashboard">
      <div className="dash-header">
        <div className="dash-header-text">
          <h1>Dashboard</h1>
          <p>Control global de cartera y prestamos</p>
        </div>
        <button onClick={cargarDatos} className="btn-refresh" disabled={cargando} aria-busy={cargando}>
          {cargando ? (
            <span className="btn-content">
              <span className="spinner-sm"></span>
              Actualizando...
            </span>
          ) : (
            <span className="btn-content">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10"/>
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
              </svg>
              Actualizar
            </span>
          )}
        </button>
      </div>

      <div className="metricas-grid">
        <div className="metrica-card metrica-blue">
          <div className="metrica-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23"/>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </div>
          <div className="metrica-info">
            <span className="metrica-label">Dinero en calle</span>
            <span className="metrica-value">${metricas.calle.toLocaleString('es-CO')}</span>
          </div>
        </div>

        <div className="metrica-card metrica-green">
          <div className="metrica-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
              <polyline points="17 6 23 6 23 12"/>
            </svg>
          </div>
          <div className="metrica-info">
            <span className="metrica-label">Recaudado (mes)</span>
            <span className="metrica-value">${metricas.recaudado.toLocaleString('es-CO')}</span>
          </div>
        </div>

        <div className="metrica-card metrica-purple">
          <div className="metrica-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="16"/>
              <line x1="8" y1="12" x2="16" y2="12"/>
            </svg>
          </div>
          <div className="metrica-info">
            <span className="metrica-label">Ganancia proyectada</span>
            <span className="metrica-value">${metricas.ganancia.toLocaleString('es-CO')}</span>
          </div>
        </div>

        <div className="metrica-card metrica-red">
          <div className="metrica-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <div className="metrica-info">
            <span className="metrica-label">Capital en riesgo</span>
            <span className="metrica-value">${metricas.riesgo.toLocaleString('es-CO')}</span>
          </div>
        </div>
      </div>

      <div className="dash-stats-bar">
        <div className="stat-item">
          <span className="stat-number">{reporte.length}</span>
          <span className="stat-label">Prestamos activos</span>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-item">
          <span className="stat-number">${totalDesembolsado.toLocaleString('es-CO')}</span>
          <span className="stat-label">Total desembolsado</span>
        </div>
      </div>

      <div className="dash-table-card">
        <div className="dash-table-header">
          <h2>Reporte Consolidado de Prestamos</h2>
          <span className="table-count">{reporte.length} registros</span>
        </div>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Cedula</th>
                <th>Nombre</th>
                <th>Monto</th>
                <th>Inicio</th>
                <th>Vencimiento</th>
              </tr>
            </thead>
            <tbody>
              {reporte.map((r, i) => (
                <tr key={i}>
                  <td className="td-mono">{r.cedula}</td>
                  <td className="td-bold">{r.nombre}</td>
                  <td className="td-amount">${parseFloat(r.monto_prestado).toLocaleString('es-CO')}</td>
                  <td>{r.fecha_desembolso?.split('T')[0]}</td>
                  <td>{calcularFechaFin(r.fecha_desembolso, r.plazo, r.modalidad)}</td>
                </tr>
              ))}
              {reporte.length === 0 && !cargando && (
                <tr><td colSpan="5" className="no-data">No hay prestamos registrados</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
