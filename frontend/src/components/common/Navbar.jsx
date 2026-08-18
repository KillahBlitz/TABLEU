import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { RoleBadge } from './RoleBadge';
import { Kanban, ListTodo, BarChart3, LogOut, Layers, ClipboardCheck } from 'lucide-react';

export const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  return (
    <header className="navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
        <NavLink to="/kanban" className="nav-brand">
          <div className="nav-logo-icon">
            <Layers size={20} />
          </div>
          <span className="nav-title">TABLEU</span>
        </NavLink>

        <nav className="nav-links">
          <NavLink
            to="/kanban"
            className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`}
          >
            <Kanban size={16} />
            <span>Tablero</span>
          </NavLink>

          <NavLink
            to="/backlog"
            className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`}
          >
            <ListTodo size={16} />
            <span>Backlog</span>
          </NavLink>

          {isAdmin && (
            <NavLink
              to="/kpis"
              className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`}
            >
              <BarChart3 size={16} />
              <span>KPIs & Métricas</span>
            </NavLink>
          )}

          {isAdmin && (
            <NavLink
              to="/attendance"
              className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`}
            >
              <ClipboardCheck size={16} />
              <span>Asistencias</span>
            </NavLink>
          )}
        </nav>
      </div>

      <div className="nav-user-section">
        <div className="user-profile-badge">
          <div
            className="user-avatar"
            style={{ backgroundColor: user?.avatarColor || '#00E5FF' }}
          >
            {initials}
          </div>
          <span className="user-name">{user?.name}</span>
          <RoleBadge role={user?.role} />
        </div>

        <button
          onClick={handleLogout}
          className="btn-icon"
          title="Cerrar sesión"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
};
