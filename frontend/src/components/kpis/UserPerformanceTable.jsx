import React, { useState } from 'react';
import { RoleBadge } from '../common/RoleBadge';
import { authService } from '../../services/authService';
import { Clock, Flame, AlertOctagon, TrendingUp, TrendingDown, Trash2, Shield, BarChart3, Table as TableIcon, CheckCircle2, Zap } from 'lucide-react';

export const UserPerformanceTable = ({ usersKpi = [], onUserDeleted }) => {
  const [viewMode, setViewMode] = useState('histograms');

  const handleDelete = async (user) => {
    if (!window.confirm(`¿Eliminar la cuenta del desarrollador "${user.userName}" (${user.email})? Sus historias asignadas quedarán sin asignar.`)) {
      return;
    }

    try {
      await authService.deleteUser(user.userId);
      if (onUserDeleted) onUserDeleted();
    } catch (error) {
      alert(error.message || 'Error al eliminar el desarrollador');
    }
  };

  return (
    <div className="kpi-section">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
        <h3 className="kpi-section-title" style={{ margin: 0 }}>
          <BarChart3 size={20} color="var(--accent-todo)" />
          Rendimiento & Histogramas por Desarrollador
        </h3>

        <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-surface)', padding: '3px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
          <button
            type="button"
            className={`btn btn-sm ${viewMode === 'histograms' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '4px 10px', fontSize: '0.76rem', border: 'none' }}
            onClick={() => setViewMode('histograms')}
          >
            <BarChart3 size={13} />
            <span>Histogramas</span>
          </button>
          <button
            type="button"
            className={`btn btn-sm ${viewMode === 'table' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '4px 10px', fontSize: '0.76rem', border: 'none' }}
            onClick={() => setViewMode('table')}
          >
            <TableIcon size={13} />
            <span>Tabla Detallada</span>
          </button>
        </div>
      </div>

      {usersKpi.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '24px' }}>
          No hay desarrolladores registrados en este ciclo.
        </p>
      ) : viewMode === 'histograms' ? (
        <div className="dev-histogram-grid">
          {usersKpi.map((user) => {
            const maxHours = Math.max(user.estimatedHours || 0, user.loggedHours || 0, 1);
            const estHoursWidth = `${Math.round(((user.estimatedHours || 0) / maxHours) * 100)}%`;
            const logHoursWidth = `${Math.round(((user.loggedHours || 0) / maxHours) * 100)}%`;

            const maxPoints = Math.max(user.totalPoints || 0, user.completedPoints || 0, 1);
            const totalPointsWidth = `${Math.round(((user.totalPoints || 0) / maxPoints) * 100)}%`;
            const compPointsWidth = `${Math.round(((user.completedPoints || 0) / maxPoints) * 100)}%`;

            const completionRate = user.totalAssigned > 0
              ? Math.round((user.completed / user.totalAssigned) * 100)
              : 0;

            return (
              <div key={user.userId} className="dev-histogram-card">
                <div className="dev-card-header">
                  <div className="dev-info-group">
                    <div
                      className="user-avatar"
                      style={{ backgroundColor: user.avatarColor || '#00E5FF', width: '36px', height: '36px', fontSize: '0.88rem' }}
                    >
                      {user.userName ? user.userName[0].toUpperCase() : 'U'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.94rem' }}>{user.userName}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{user.email}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <RoleBadge role={user.role} />
                    {user.role === 'developer' ? (
                      <button
                        className="btn-icon"
                        onClick={() => handleDelete(user)}
                        title="Eliminar cuenta de desarrollador"
                      >
                        <Trash2 size={13} color="var(--accent-blocked)" />
                      </button>
                    ) : (
                      <Shield size={13} color="var(--accent-todo)" title="Administrador" />
                    )}
                  </div>
                </div>

                <div className="histogram-group">
                  <div className="histogram-label">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 600 }}>
                      <Clock size={13} color="var(--accent-todo)" />
                      Histograma de Horas
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.76rem', color: user.hoursDeviation > 0 ? 'var(--accent-blocked)' : 'var(--accent-done)' }}>
                      {user.hoursDeviation > 0 ? `+${user.hoursDeviation}h (Desvío)` : `${user.hoursDeviation}h`}
                    </span>
                  </div>

                  <div className="histogram-dual-bars">
                    <div className="histogram-single-bar-row">
                      <span style={{ width: '64px', color: 'var(--text-muted)' }}>Estimadas</span>
                      <div className="histogram-bar-track">
                        <div
                          className="histogram-bar-fill"
                          style={{ width: estHoursWidth, backgroundColor: 'var(--accent-todo)' }}
                        />
                      </div>
                      <span style={{ width: '32px', textAlign: 'right', color: 'var(--accent-todo)' }}>
                        {user.estimatedHours}h
                      </span>
                    </div>

                    <div className="histogram-single-bar-row">
                      <span style={{ width: '64px', color: 'var(--text-muted)' }}>Reales</span>
                      <div className="histogram-bar-track">
                        <div
                          className="histogram-bar-fill"
                          style={{ width: logHoursWidth, backgroundColor: 'var(--accent-in-progress)' }}
                        />
                      </div>
                      <span style={{ width: '32px', textAlign: 'right', color: 'var(--accent-in-progress)' }}>
                        {user.loggedHours}h
                      </span>
                    </div>
                  </div>
                </div>

                <div className="histogram-group">
                  <div className="histogram-label">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 600 }}>
                      <Flame size={13} color="var(--accent-purple)" />
                      Histograma de Story Points
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.76rem', color: 'var(--accent-done)' }}>
                      {user.pointsProgress}% Cumplido
                    </span>
                  </div>

                  <div className="histogram-dual-bars">
                    <div className="histogram-single-bar-row">
                      <span style={{ width: '64px', color: 'var(--text-muted)' }}>Plan</span>
                      <div className="histogram-bar-track">
                        <div
                          className="histogram-bar-fill"
                          style={{ width: totalPointsWidth, backgroundColor: 'var(--accent-purple)' }}
                        />
                      </div>
                      <span style={{ width: '32px', textAlign: 'right', color: 'var(--accent-purple)' }}>
                        {user.totalPoints}p
                      </span>
                    </div>

                    <div className="histogram-single-bar-row">
                      <span style={{ width: '64px', color: 'var(--text-muted)' }}>Entregado</span>
                      <div className="histogram-bar-track">
                        <div
                          className="histogram-bar-fill"
                          style={{ width: compPointsWidth, backgroundColor: 'var(--accent-done)' }}
                        />
                      </div>
                      <span style={{ width: '32px', textAlign: 'right', color: 'var(--accent-done)' }}>
                        {user.completedPoints}p
                      </span>
                    </div>
                  </div>
                </div>

                <div className="histogram-group">
                  <div className="histogram-label">
                    <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Distribución de Tareas</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {user.completed}/{user.totalAssigned} en QA
                    </span>
                  </div>

                  <div className="segmented-progress">
                    {user.totalAssigned > 0 ? (
                      <>
                        <div
                          style={{
                            width: `${(user.completed / user.totalAssigned) * 100}%`,
                            backgroundColor: 'var(--accent-done)'
                          }}
                          title={`Ready QA: ${user.completed}`}
                        />
                        <div
                          style={{
                            width: `${((user.inProgress || 0) / user.totalAssigned) * 100}%`,
                            backgroundColor: 'var(--accent-in-progress)'
                          }}
                          title={`En Desarrollo/Test: ${user.inProgress || 0}`}
                        />
                        <div
                          style={{
                            width: `${((user.todo || 0) / user.totalAssigned) * 100}%`,
                            backgroundColor: 'var(--accent-todo)'
                          }}
                          title={`ToDo: ${user.todo || 0}`}
                        />
                      </>
                    ) : (
                      <div style={{ width: '100%', backgroundColor: 'rgba(255,255,255,0.05)' }} />
                    )}
                  </div>
                </div>

                <div className="stat-badges-row">
                  <div className="dev-mini-stat">
                    <span className="dev-mini-stat-label">Entrega</span>
                    <span className="dev-mini-stat-val" style={{ color: 'var(--accent-done)' }}>
                      {completionRate}%
                    </span>
                  </div>

                  <div className="dev-mini-stat">
                    <span className="dev-mini-stat-label">Avance Hrs</span>
                    <span className="dev-mini-stat-val" style={{ color: 'var(--accent-todo)' }}>
                      {user.hoursProgress}%
                    </span>
                  </div>

                  <div className="dev-mini-stat">
                    <span className="dev-mini-stat-label">Bloqueos</span>
                    <span
                      className="dev-mini-stat-val"
                      style={{ color: user.blockedCount > 0 ? 'var(--accent-blocked)' : 'var(--text-muted)' }}
                    >
                      {user.blockedCount}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="kpi-table">
            <thead>
              <tr>
                <th>Desarrollador</th>
                <th>Rol</th>
                <th>Tareas (Listo/Total)</th>
                <th>Avance Horas</th>
                <th>Avance Dificultad (Pts)</th>
                <th>Desvío Horas</th>
                <th>Bloqueos</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usersKpi.map((user) => (
                <tr key={user.userId}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        className="user-avatar"
                        style={{ backgroundColor: user.avatarColor || '#00E5FF' }}
                      >
                        {user.userName ? user.userName[0].toUpperCase() : 'U'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{user.userName}</div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <RoleBadge role={user.role} />
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                      {user.completed}/{user.totalAssigned}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '4px' }}>
                      ({user.totalAssigned > 0 ? Math.round((user.completed / user.totalAssigned) * 100) : 0}%)
                    </span>
                  </td>
                  <td style={{ minWidth: '160px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px', fontFamily: 'var(--font-mono)' }}>
                      <span>{user.loggedHours}h / {user.estimatedHours}h</span>
                      <span style={{ color: 'var(--accent-todo)', fontWeight: 700 }}>{user.hoursProgress}%</span>
                    </div>
                    <div className="progress-bar-container">
                      <div
                        className="progress-bar-fill"
                        style={{
                          width: `${Math.min(user.hoursProgress, 100)}%`,
                          backgroundColor: 'var(--accent-todo)'
                        }}
                      />
                    </div>
                  </td>
                  <td style={{ minWidth: '160px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px', fontFamily: 'var(--font-mono)' }}>
                      <span>{user.completedPoints} / {user.totalPoints} pts</span>
                      <span style={{ color: 'var(--accent-done)', fontWeight: 700 }}>{user.pointsProgress}%</span>
                    </div>
                    <div className="progress-bar-container">
                      <div
                        className="progress-bar-fill"
                        style={{
                          width: `${Math.min(user.pointsProgress, 100)}%`,
                          backgroundColor: 'var(--accent-done)'
                        }}
                      />
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                      {user.hoursDeviation > 0 ? (
                        <>
                          <TrendingUp size={14} color="var(--accent-blocked)" />
                          <span style={{ color: 'var(--accent-blocked)' }}>+{user.hoursDeviation}h</span>
                        </>
                      ) : user.hoursDeviation < 0 ? (
                        <>
                          <TrendingDown size={14} color="var(--accent-done)" />
                          <span style={{ color: 'var(--accent-done)' }}>{user.hoursDeviation}h</span>
                        </>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>0h</span>
                      )}
                    </div>
                  </td>
                  <td>
                    {user.blockedCount > 0 ? (
                      <span style={{ color: 'var(--accent-blocked)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}>
                        <AlertOctagon size={14} />
                        {user.blockedCount}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>0</span>
                    )}
                  </td>
                  <td>
                    {user.role === 'developer' ? (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(user)}
                        title="Eliminar cuenta de desarrollador"
                      >
                        <Trash2 size={13} />
                        <span>Eliminar</span>
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.74rem', color: 'var(--accent-todo)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                        <Shield size={12} />
                        Admin
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
