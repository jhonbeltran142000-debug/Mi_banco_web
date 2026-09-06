import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login/Login';
import Layout from './components/Layout/Layout';
import Clientes from './components/Clientes/Clientes';
import SimuladorCredito from './components/Creditos/SimuladorCredito';
import Caja from './components/Caja/Caja';
import Dashboard from './components/Reportes/Dashboard';
import './App.css';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="loading">Cargando...</div>;

  return user ? children : <Navigate to="/login" />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="loading">Cargando...</div>;

  return user ? <Navigate to="/clientes" /> : children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Navigate to="/clientes" />} />
        <Route path="clientes" element={<Clientes />} />
        <Route path="creditos" element={<SimuladorCredito />} />
        <Route path="caja" element={<Caja />} />
        <Route path="reportes" element={<Dashboard />} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
