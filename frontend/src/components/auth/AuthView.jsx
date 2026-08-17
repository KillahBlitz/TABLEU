import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Layers, ArrowRight, UserCheck, Shield } from 'lucide-react';

export const AuthView = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      navigate('/kanban');
    } catch (err) {
      setError(err.message || 'Error en la autenticación');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickAdmin = (adminEmail) => {
    setEmail(adminEmail);
    setPassword('Admin123!');
    setIsLogin(true);
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <Layers size={24} />
          </div>
          <h2 className="auth-title">TABLEU</h2>
          <p className="auth-subtitle">Enterprise Agile Kanban & KPI Platform</p>
        </div>

        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab ${isLogin ? 'active' : ''}`}
            onClick={() => {
              setIsLogin(true);
              setError('');
            }}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            className={`auth-tab ${!isLogin ? 'active' : ''}`}
            onClick={() => {
              setIsLogin(false);
              setError('');
            }}
          >
            Registrarse
          </button>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {!isLogin && (
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Nombre Completo</label>
              <input
                type="text"
                className="input-field"
                placeholder="Ej. Ana García"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Correo Electrónico</label>
            <input
              type="email"
              className="input-field"
              placeholder="tu.correo@tableu.io"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Contraseña</label>
            <input
              type="password"
              className="input-field"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
            style={{ marginTop: '8px', width: '100%', padding: '12px' }}
          >
            <span>{isLogin ? 'Ingresar a TABLEU' : 'Crear Cuenta (Developer)'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="quick-demo-section">
          <div className="quick-demo-title" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Shield size={12} color="var(--accent-todo)" />
            <span>Acceso Rápido Administradores Iniciales</span>
          </div>
          <div className="quick-demo-buttons">
            <button
              type="button"
              className="btn-quick-user"
              onClick={() => handleQuickAdmin('jacobo.monroy@tableu.io')}
            >
              Jacobo M. (Admin)
            </button>
            <button
              type="button"
              className="btn-quick-user"
              onClick={() => handleQuickAdmin('christopher.figueroa@tableu.io')}
            >
              Christopher F. (Admin)
            </button>
            <button
              type="button"
              className="btn-quick-user"
              onClick={() => handleQuickAdmin('lizbeth.loza@tableu.io')}
            >
              Lizbeth L. (Admin)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
