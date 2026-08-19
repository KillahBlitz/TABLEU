import React, { useState } from 'react';
import { CATEGORY_CONFIG } from '../common/CategoryConfig';
import { BarChart3, Users, Filter } from 'lucide-react';

const CATEGORIES = ['tarea', 'historia', 'hito', 'bug', 'mejora'];

export const CategoryDistributionChart = ({ usersKpi = [] }) => {
  const [selectedUserFilter, setSelectedUserFilter] = useState('all');

  const displayedUsers = selectedUserFilter === 'all'
    ? usersKpi
    : usersKpi.filter((u) => u.userId === selectedUserFilter);

  if (usersKpi.length === 0) {
    return (
      <div className="kpi-section">
        <h3 className="kpi-section-title" style={{ margin: 0 }}>
          <BarChart3 size={20} color="var(--accent-todo)" />
          Distribución de Tareas por Tipo (Histogramas por Desarrollador)
        </h3>
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '24px' }}>
          No hay desarrolladores registrados en este ciclo.
        </p>
      </div>
    );
  }

  return (
    <div className="kpi-section">
      <div className="cat-histogram-header-row">
        <div>
          <h3 className="kpi-section-title" style={{ margin: 0 }}>
            <BarChart3 size={20} color="var(--accent-todo)" />
            Asignación de Tareas por Tipo (Histogramas por Usuario)
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginTop: '4px' }}>
            Frecuencia de historias, tareas, hitos, bugs y mejoras asignadas a cada usuario registrado.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={14} color="var(--text-secondary)" />
          <select
            className="filter-select"
            value={selectedUserFilter}
            onChange={(e) => setSelectedUserFilter(e.target.value)}
            style={{ minWidth: '220px' }}
          >
            <option value="all">Todos los Desarrolladores ({usersKpi.length})</option>
            {usersKpi.map((u) => (
              <option key={u.userId} value={u.userId}>
                {u.userName} ({u.totalAssigned} tareas)
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="cat-histogram-grid">
        {displayedUsers.map((user) => {
          const bd = user.categoryBreakdown || {
            tarea: 0,
            historia: 0,
            hito: 0,
            bug: 0,
            mejora: 0
          };

          const rawMax = Math.max(...CATEGORIES.map((c) => bd[c] || 0));
          const maxVal = Math.max(Math.ceil(rawMax * 1.25), 4);

          const step = Math.ceil(maxVal / 4);
          const yTicks = [step * 4, step * 3, step * 2, step, 0];
          const actualMax = yTicks[0];

          return (
            <div key={user.userId} className="cat-histogram-card">
              <div className="cat-histogram-user-header">
                <div className="dev-info-group">
                  <div
                    className="user-avatar"
                    style={{
                      backgroundColor: user.avatarColor || '#00E5FF',
                      width: '36px',
                      height: '36px',
                      fontSize: '0.86rem'
                    }}
                  >
                    {user.userName ? user.userName[0].toUpperCase() : 'U'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.94rem' }}>{user.userName}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{user.email}</div>
                  </div>
                </div>

                <div className="cat-histogram-total-badge">
                  <Users size={12} />
                  <span>{user.totalAssigned} Asignada{user.totalAssigned !== 1 ? 's' : ''}</span>
                </div>
              </div>

              <div className="histogram-container">
                <div className="histogram-y-title">
                  <span>Frecuencia</span>
                </div>

                <div className="histogram-plot-area">
                  <div className="histogram-y-axis">
                    {yTicks.map((tick, idx) => (
                      <div key={idx} className="histogram-y-tick">
                        <span>{tick}</span>
                        <div className="histogram-tick-mark-y" />
                      </div>
                    ))}
                  </div>

                  <div className="histogram-chart-box">
                    <div className="histogram-grid-background">
                      {yTicks.slice(0, -1).map((_, idx) => (
                        <div key={idx} className="histogram-horizontal-grid" />
                      ))}
                    </div>

                    <div className="histogram-bars-cluster">
                      {CATEGORIES.map((cat) => {
                        const count = bd[cat] || 0;
                        const cfg = CATEGORY_CONFIG[cat];
                        const heightPct = actualMax > 0 ? (count / actualMax) * 100 : 0;

                        return (
                          <div key={cat} className="histogram-bar-column">
                            <div className="histogram-bar-track">
                              {count > 0 && (
                                <div
                                  className="histogram-bar-value-bubble"
                                  style={{
                                    bottom: `calc(${heightPct}% + 6px)`,
                                    borderColor: cfg.color,
                                    color: cfg.color
                                  }}
                                >
                                  {count}
                                </div>
                              )}
                              <div
                                className="histogram-bar-fill-block"
                                style={{
                                  height: `${heightPct}%`,
                                  backgroundColor: cfg.color,
                                  borderTop: `2px solid #FFFFFF`,
                                  boxShadow: count > 0 ? `0 0 16px ${cfg.color}55` : 'none'
                                }}
                                title={`${cfg.label}: ${count}`}
                              >
                                {count > 0 && heightPct >= 20 && (
                                  <span className="histogram-bar-inner-count">{count}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <div className="histogram-x-axis-row">
                <div className="histogram-x-spacer" />
                <div className="histogram-x-labels-cluster">
                  {CATEGORIES.map((cat) => {
                    const cfg = CATEGORY_CONFIG[cat];
                    const Icon = cfg.icon;
                    const count = bd[cat] || 0;

                    return (
                      <div key={cat} className="histogram-x-cat-label">
                        <div className="histogram-tick-mark-x" />
                        <span
                          className="histogram-cat-badge"
                          style={{
                            backgroundColor: `${cfg.color}18`,
                            color: cfg.color,
                            border: `1px solid ${cfg.color}44`
                          }}
                        >
                          <Icon size={12} />
                          <span>{cfg.label}</span>
                        </span>
                        <span className="histogram-cat-count" style={{ color: count > 0 ? cfg.color : 'var(--text-muted)' }}>
                          ({count})
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="histogram-x-title">
                <span>Categorías</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
