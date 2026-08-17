import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert } from 'lucide-react';

export const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--text-secondary)' }}>
        Loading TABLEU...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '16px', textAlign: 'center' }}>
        <ShieldAlert size={48} color="var(--accent-blocked)" />
        <h2 style={{ fontSize: '1.4rem', fontWeight: '700' }}>Acceso Restringido</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '400px' }}>
          Este módulo requiere privilegios de Administrador. Tu cuenta actual tiene rol de Desarrollador.
        </p>
      </div>
    );
  }

  return children;
};
