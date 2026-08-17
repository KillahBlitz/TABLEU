import React, { useState, useEffect } from 'react';
import { authService } from '../../services/authService';
import { RoleBadge } from '../common/RoleBadge';
import { X, Users, Trash2, Shield, UserX, AlertTriangle } from 'lucide-react';

export const UserManagerModal = ({ isOpen, onClose, onUsersUpdated }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await authService.getUsers();
      setUsers(data);
    } catch (err) {
      setError(err.message || 'Error al cargar la lista de usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  const handleDeleteDeveloper = async (user) => {
    if (!window.confirm(`¿Estás seguro de eliminar la cuenta del desarrollador "${user.name}" (${user.email})? Sus tareas asignadas quedarán sin asignar.`)) {
      return;
    }

    try {
      await authService.deleteUser(user._id);
      await fetchUsers();
      if (onUsersUpdated) onUsersUpdated();
    } catch (err) {
      alert(err.message || 'Error al eliminar el desarrollador');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <Users size={20} color="var(--accent-todo)" />
            <span>Gestión del Equipo y Desarrolladores</span>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {error && <div className="auth-error" style={{ marginBottom: '16px' }}>{error}</div>}

        <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          Como Administrador, puedes consultar el equipo y eliminar cuentas de desarrolladores. Las cuentas con rol de Administrador están protegidas.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '380px', overflowY: 'auto' }}>
          {loading ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>Cargando usuarios...</p>
          ) : users.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>No hay usuarios registrados.</p>
          ) : (
            users.map((u) => (
              <div
                key={u._id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    className="user-avatar"
                    style={{ backgroundColor: u.avatarColor || '#00E5FF' }}
                  >
                    {u.name ? u.name[0].toUpperCase() : 'U'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>{u.name}</span>
                      <RoleBadge role={u.role} />
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{u.email}</div>
                  </div>
                </div>

                <div>
                  {u.role === 'developer' ? (
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDeleteDeveloper(u)}
                      title="Eliminar cuenta de desarrollador"
                    >
                      <Trash2 size={13} />
                      <span>Eliminar</span>
                    </button>
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: 'var(--accent-todo)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                      <Shield size={12} />
                      Protegido
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="modal-actions">
          <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
