import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './Login.css';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar sesion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-brand">
          <div className="brand-icon">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="64" height="64" rx="16" fill="rgba(255,255,255,0.15)"/>
              <path d="M32 12L12 24v6h40v-6L32 12z" fill="#fff"/>
              <rect x="18" y="32" width="5" height="14" rx="1" fill="#fff"/>
              <rect x="29.5" y="32" width="5" height="14" rx="1" fill="#fff"/>
              <rect x="41" y="32" width="5" height="14" rx="1" fill="#fff"/>
              <rect x="12" y="46" width="40" height="4" rx="1" fill="#00c853"/>
            </svg>
          </div>
          <h2 className="brand-title">Sistema Bancario</h2>
          <p className="brand-subtitle">Gestion de prestamos y cartera de clientes</p>
        </div>
        <div className="login-features">
          <div className="feature-item">
            <span className="feature-icon">&#128176;</span>
            <span>Simulador financiero integrado</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">&#128202;</span>
            <span>Dashboard en tiempo real</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">&#128196;</span>
            <span>Generacion automatica de PDFs</span>
          </div>
        </div>
      </div>

      <div className="login-right">
        <form className="login-card" onSubmit={handleSubmit}>
          <div className="card-header">
            <h1>Bienvenido</h1>
          </div>

          <div className="field">
            <label htmlFor="login-user">Usuario</label>
            <div className="input-wrapper">
              <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <input
                id="login-user"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Tu usuario"
                required
                autoComplete="username"
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="login-pass">Contrasena</label>
            <div className="input-wrapper">
              <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <input
                id="login-pass"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Tu contrasena"
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          {error && <div className="error-msg" role="alert">{error}</div>}

          <button type="submit" disabled={loading} className="btn-login">
            {loading ? (
              <span className="btn-loading">
                <span className="spinner"></span>
                Ingresando...
              </span>
            ) : (
              'Ingresar'
            )}
          </button>

          <p className="login-footer">Sistema Bancario Web v1.0</p>
        </form>
      </div>
    </div>
  );
}
