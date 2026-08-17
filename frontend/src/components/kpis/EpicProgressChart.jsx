import React from 'react';
import { Layers } from 'lucide-react';

export const EpicProgressChart = ({ epicsKpi = [] }) => {
  return (
    <div className="kpi-section">
      <h3 className="kpi-section-title">
        <Layers size={20} color="var(--accent-todo)" />
        Progreso Global por Épica (Categorías de Negocio)
      </h3>

      <div className="epics-kpi-grid">
        {epicsKpi.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No hay épicas registradas.</p>
        ) : (
          epicsKpi.map((epic) => (
            <div key={epic.epicId} className="epic-kpi-card">
              <div className="epic-kpi-header">
                <div className="epic-kpi-title">
                  <div
                    className="epic-color-badge"
                    style={{ backgroundColor: epic.color || '#00E5FF' }}
                  />
                  <span>{epic.title}</span>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {epic.completedStories}/{epic.totalStories} tareas
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div>
                  <div className="metric-row">
                    <span>Avance por Horas:</span>
                    <span className="metric-row-value" style={{ color: 'var(--accent-todo)' }}>
                      {epic.hoursProgress}% ({epic.loggedHours}h / {epic.estimatedHours}h)
                    </span>
                  </div>
                  <div className="progress-bar-container" style={{ marginTop: '4px' }}>
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${Math.min(epic.hoursProgress, 100)}%`,
                        backgroundColor: 'var(--accent-todo)'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="metric-row">
                    <span>Avance por Dificultad (Pts):</span>
                    <span className="metric-row-value" style={{ color: 'var(--accent-done)' }}>
                      {epic.pointsProgress}% ({epic.completedPoints} / {epic.totalPoints} pts)
                    </span>
                  </div>
                  <div className="progress-bar-container" style={{ marginTop: '4px' }}>
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${Math.min(epic.pointsProgress, 100)}%`,
                        backgroundColor: 'var(--accent-done)'
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
