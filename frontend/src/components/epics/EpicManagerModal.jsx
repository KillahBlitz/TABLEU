import React, { useState, useEffect } from 'react';
import { epicService } from '../../services/epicService';
import { X, Plus, Trash2, Edit2, Layers, Check } from 'lucide-react';

export const EpicManagerModal = ({ isOpen, onClose, onEpicsUpdated }) => {
  const [epics, setEpics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    color: '#00E5FF',
    status: 'planning',
    startDate: '',
    targetDate: ''
  });

  const availableColors = [
    '#00E5FF',
    '#00FFCC',
    '#FFEA00',
    '#9D00FF',
    '#FF007F',
    '#FF8C00',
    '#3B82F6',
    '#10B981'
  ];

  const fetchEpics = async () => {
    try {
      setLoading(true);
      const data = await epicService.getEpics();
      setEpics(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchEpics();
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      color: '#00E5FF',
      status: 'planning',
      startDate: '',
      targetDate: ''
    });
    setEditingId(null);
  };

  const handleEdit = (epic) => {
    setEditingId(epic._id);
    setFormData({
      title: epic.title,
      description: epic.description || '',
      color: epic.color || '#00E5FF',
      status: epic.status || 'planning',
      startDate: epic.startDate ? epic.startDate.substring(0, 10) : '',
      targetDate: epic.targetDate ? epic.targetDate.substring(0, 10) : ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    try {
      if (editingId) {
        await epicService.updateEpic(editingId, formData);
      } else {
        await epicService.createEpic(formData);
      }
      resetForm();
      fetchEpics();
      if (onEpicsUpdated) onEpicsUpdated();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar esta épica? Las historias asociadas quedarán sin épica.')) return;
    try {
      await epicService.deleteEpic(id);
      fetchEpics();
      if (onEpicsUpdated) onEpicsUpdated();
    } catch (error) {
      console.error(error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <Layers size={20} color="var(--accent-todo)" />
            <span>Gestión de Épicas</span>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ marginBottom: '24px' }}>
          <div className="form-group">
            <label className="form-label">Título de la Épica *</label>
            <input
              type="text"
              className="input-field"
              placeholder="Ej. Arquitectura & Seguridad"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Descripción</label>
            <textarea
              className="textarea-field"
              rows={2}
              placeholder="Objetivos clave de la épica..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Estado</label>
              <select
                className="select-field"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="planning">Planificación</option>
                <option value="in_progress">En Progreso</option>
                <option value="completed">Completada</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Color de Identificación</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                {availableColors.map((color) => (
                  <div
                    key={color}
                    onClick={() => setFormData({ ...formData, color })}
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: color,
                      cursor: 'pointer',
                      border: formData.color === color ? '2px solid #FFFFFF' : '2px solid transparent',
                      boxShadow: formData.color === color ? `0 0 8px ${color}` : 'none'
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Fecha Inicio Estimada</label>
              <input
                type="date"
                className="input-field"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Fecha Fin Estimada</label>
              <input
                type="date"
                className="input-field"
                value={formData.targetDate}
                onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '12px' }}>
            {editingId && (
              <button type="button" className="btn btn-secondary btn-sm" onClick={resetForm}>
                Cancelar Edición
              </button>
            )}
            <button type="submit" className="btn btn-primary btn-sm">
              {editingId ? <Check size={14} /> : <Plus size={14} />}
              {editingId ? 'Guardar Cambios' : 'Crear Épica'}
            </button>
          </div>
        </form>

        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
          <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Épicas Registradas ({epics.length})
          </h4>

          {loading ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Cargando épicas...</p>
          ) : epics.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No hay épicas creadas aún.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
              {epics.map((epic) => (
                <div
                  key={epic._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: epic.color }} />
                    <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>{epic.title}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      ({epic.completedStories || 0}/{epic.totalStories || 0} tareas)
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button className="btn-icon" onClick={() => handleEdit(epic)} title="Editar">
                      <Edit2 size={14} />
                    </button>
                    <button className="btn-icon" onClick={() => handleDelete(epic._id)} title="Eliminar">
                      <Trash2 size={14} color="var(--accent-blocked)" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
