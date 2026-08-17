import React, { useState, useEffect } from 'react';
import { sprintService } from '../../services/sprintService';
import { X, Plus, Play, CheckCircle2, Trash2, Calendar, Target, Clock, AlertTriangle } from 'lucide-react';

export const SprintControlModal = ({ isOpen, onClose, onSprintsUpdated }) => {
  const [sprints, setSprints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('list');

  const [formData, setFormData] = useState({
    name: '',
    goal: '',
    startDate: new Date().toISOString().substring(0, 10),
    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10)
  });

  const fetchSprints = async () => {
    try {
      setLoading(true);
      const data = await sprintService.getSprints();
      setSprints(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchSprints();
    }
  }, [isOpen]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      await sprintService.createSprint(formData);
      setFormData({
        name: '',
        goal: '',
        startDate: new Date().toISOString().substring(0, 10),
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10)
      });
      await fetchSprints();
      setActiveTab('list');
      if (onSprintsUpdated) onSprintsUpdated();
    } catch (error) {
      console.error(error);
    }
  };

  const handleStart = async (id) => {
    try {
      await sprintService.startSprint(id);
      await fetchSprints();
      if (onSprintsUpdated) onSprintsUpdated();
    } catch (error) {
      console.error(error);
    }
  };

  const handleFinish = async (id) => {
    if (!window.confirm('¿Finalizar este Sprint? Las tareas terminadas (Ready QA) quedarán archivadas para reportes históricos de KPIs y las tareas pendientes volverán al Backlog conservando su estado.')) {
      return;
    }

    try {
      await sprintService.finishSprint(id, { moveIncompleteToBacklog: true });
      await fetchSprints();
      if (onSprintsUpdated) onSprintsUpdated();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este Sprint? Las historias asociadas se desvincularán y quedarán en el Backlog.')) return;
    try {
      await sprintService.deleteSprint(id);
      await fetchSprints();
      if (onSprintsUpdated) onSprintsUpdated();
    } catch (error) {
      console.error(error);
    }
  };

  if (!isOpen) return null;

  const activeSprints = sprints.filter((s) => s.status === 'active');
  const plannedSprints = sprints.filter((s) => s.status === 'planned');
  const completedSprints = sprints.filter((s) => s.status === 'completed');

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '720px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <Calendar size={22} color="var(--accent-todo)" />
            <span>Gestión de Sprints & Fechas de Entrega</span>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="auth-tabs" style={{ marginBottom: '18px' }}>
          <button
            type="button"
            className={`auth-tab ${activeTab === 'list' ? 'active' : ''}`}
            onClick={() => setActiveTab('list')}
          >
            Sprints ({sprints.length})
          </button>
          <button
            type="button"
            className={`auth-tab ${activeTab === 'new' ? 'active' : ''}`}
            onClick={() => setActiveTab('new')}
          >
            + Planificar Nuevo Sprint
          </button>
        </div>

        {activeTab === 'new' ? (
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Nombre del Sprint *</label>
              <input
                type="text"
                className="input-field"
                placeholder="Ej. Sprint 1 - MVP & Entrega Inicial"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Objetivo del Sprint (Goal)</label>
              <input
                type="text"
                className="input-field"
                placeholder="Meta principal de este ciclo..."
                value={formData.goal}
                onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">📅 Fecha de Inicio *</label>
                <input
                  type="date"
                  className="input-field"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">🏁 Fecha de Finalización *</label>
                <input
                  type="date"
                  className="input-field"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setActiveTab('list')}
              >
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary btn-sm">
                <Plus size={14} />
                Guardar Sprint Planificado
              </button>
            </div>
          </form>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '420px', overflowY: 'auto' }}>
            {activeSprints.length > 0 && (
              <div>
                <h4 style={{ fontSize: '0.78rem', color: 'var(--accent-done)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', fontWeight: 700 }}>
                  Sprint Activo en Curso
                </h4>
                {activeSprints.map((sprint) => (
                  <div
                    key={sprint._id}
                    style={{
                      background: 'rgba(0, 255, 204, 0.05)',
                      border: '1px solid rgba(0, 255, 204, 0.3)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '14px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 700, fontSize: '1rem', color: '#FFFFFF' }}>{sprint.name}</span>
                        <span className="status-tag status-ready_qa">Activo</span>
                      </div>
                      {sprint.goal && (
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          🎯 {sprint.goal}
                        </div>
                      )}
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        📅 Del {new Date(sprint.startDate).toLocaleDateString()} al {new Date(sprint.endDate).toLocaleDateString()}
                      </div>
                    </div>

                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleFinish(sprint._id)}
                      title="Finalizar este sprint"
                    >
                      <CheckCircle2 size={14} />
                      Finalizar Sprint
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <h4 style={{ fontSize: '0.78rem', color: 'var(--accent-todo)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700 }}>
                  Sprints Planificados ({plannedSprints.length})
                </h4>
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '2px 8px', fontSize: '0.72rem' }}
                  onClick={() => setActiveTab('new')}
                >
                  + Planificar Sprint
                </button>
              </div>

              {plannedSprints.length === 0 ? (
                <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', fontSize: '0.84rem' }}>
                  No hay sprints planificados.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {plannedSprints.map((sprint) => (
                    <div
                      key={sprint._id}
                      style={{
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '12px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>{sprint.name}</div>
                        {sprint.goal && (
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                            {sprint.goal}
                          </div>
                        )}
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                          📅 {new Date(sprint.startDate).toLocaleDateString()} - {new Date(sprint.endDate).toLocaleDateString()}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleStart(sprint._id)}
                        >
                          <Play size={12} />
                          Iniciar Sprint
                        </button>
                        <button
                          className="btn-icon"
                          onClick={() => handleDelete(sprint._id)}
                          title="Eliminar Sprint"
                        >
                          <Trash2 size={14} color="var(--accent-blocked)" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {completedSprints.length > 0 && (
              <div>
                <h4 style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', fontWeight: 700 }}>
                  Sprints Finalizados ({completedSprints.length})
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {completedSprints.map((sprint) => (
                    <div
                      key={sprint._id}
                      style={{
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '10px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                        opacity: 0.85
                      }}
                    >
                      <div>
                        <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>{sprint.name}</span>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          Completado el {sprint.completedAt ? new Date(sprint.completedAt).toLocaleDateString() : 'N/A'} • {sprint.completedStories || 0} tareas entregadas
                        </div>
                      </div>
                      <span className="status-tag status-backlog">Finalizado</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="modal-actions">
          <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
