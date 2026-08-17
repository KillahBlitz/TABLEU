import React, { useState, useEffect } from 'react';
import { boardService } from '../../services/boardService';
import { X, Plus, Sparkles } from 'lucide-react';

export const StoryFormModal = ({ isOpen, epics = [], sprints = [], users = [], defaultSprintId = '', onClose, onStoryCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    epicId: '',
    sprintId: defaultSprintId || '',
    assignedTo: '',
    status: defaultSprintId ? 'todo' : 'backlog',
    estimatedHours: 4,
    difficulty: 2,
    priority: 'medium'
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: '',
        description: '',
        epicId: '',
        sprintId: defaultSprintId || '',
        assignedTo: '',
        status: defaultSprintId ? 'todo' : 'backlog',
        estimatedHours: 4,
        difficulty: 2,
        priority: 'medium'
      });
    }
  }, [isOpen, defaultSprintId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    try {
      await boardService.createStory(formData);
      setFormData({
        title: '',
        description: '',
        epicId: '',
        sprintId: defaultSprintId || '',
        assignedTo: '',
        status: defaultSprintId ? 'todo' : 'backlog',
        estimatedHours: 4,
        difficulty: 2,
        priority: 'medium'
      });
      if (onStoryCreated) onStoryCreated();
      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <Sparkles size={20} color="var(--accent-todo)" />
            <span>Crear Nueva Historia de Usuario</span>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Título de la Historia *</label>
            <input
              type="text"
              className="input-field"
              placeholder="Ej. Implementar autenticación JWT"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Descripción</label>
            <textarea
              className="textarea-field"
              rows={3}
              placeholder="Criterios de aceptación, detalles técnicos..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Épica</label>
              <select
                className="select-field"
                value={formData.epicId}
                onChange={(e) => setFormData({ ...formData, epicId: e.target.value })}
              >
                <option value="">Sin Épica</option>
                {epics.map((ep) => (
                  <option key={ep._id} value={ep._id}>
                    {ep.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Sprint</label>
              <select
                className="select-field"
                value={formData.sprintId}
                onChange={(e) => {
                  const sId = e.target.value;
                  setFormData({
                    ...formData,
                    sprintId: sId,
                    status: sId ? 'todo' : 'backlog'
                  });
                }}
              >
                <option value="">Backlog General (Sin Sprint)</option>
                {sprints.map((sp) => (
                  <option key={sp._id} value={sp._id}>
                    {sp.name} ({sp.status})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Desarrollador Asignado</label>
              <select
                className="select-field"
                value={formData.assignedTo}
                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
              >
                <option value="">Sin Asignar</option>
                {users.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Prioridad</label>
              <select
                className="select-field"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Horas Estimadas</label>
              <input
                type="number"
                min="0"
                step="0.5"
                className="input-field"
                value={formData.estimatedHours}
                onChange={(e) => setFormData({ ...formData, estimatedHours: Number(e.target.value) })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Dificultad (Story Points)</label>
              <select
                className="select-field"
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: Number(e.target.value) })}
              >
                {[1, 2, 3, 5, 8, 13].map((pt) => (
                  <option key={pt} value={pt}>
                    {pt} Puntos
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary btn-sm">
              <Plus size={14} />
              Crear Historia
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
