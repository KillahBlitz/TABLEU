import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { boardService } from '../../services/boardService';
import { UPLOAD_BASE } from '../../services/api';
import { CATEGORY_OPTIONS, CATEGORY_CONFIG } from '../common/CategoryConfig';
import {
  X, Trash2, Check, AlertOctagon, Clock, User as UserIcon,
  Tag, Flame, Paperclip, Image, FileText, Upload, ZoomIn, ChevronLeft, ChevronRight
} from 'lucide-react';

export const StoryModal = ({ isOpen, story, epics = [], sprints = [], users = [], onClose, onStoryUpdated, onStoryDeleted }) => {
  const { isAdmin } = useAuth();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'tarea',
    epicId: '',
    sprintId: '',
    assignedTo: '',
    status: 'todo',
    estimatedHours: 0,
    loggedHours: 0,
    difficulty: 1,
    priority: 'medium',
    isBlocked: false,
    blockedReason: ''
  });

  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(-1);

  useEffect(() => {
    if (story) {
      setFormData({
        title: story.title || '',
        description: story.description || '',
        category: story.category || 'tarea',
        epicId: story.epicId?._id || story.epicId || '',
        sprintId: story.sprintId?._id || story.sprintId || '',
        assignedTo: story.assignedTo?._id || story.assignedTo || '',
        status: story.status || 'todo',
        estimatedHours: story.estimatedHours || 0,
        loggedHours: story.loggedHours || 0,
        difficulty: story.difficulty || 1,
        priority: story.priority || 'medium',
        isBlocked: story.isBlocked || false,
        blockedReason: story.blockedReason || ''
      });
      setAttachments(story.attachments || []);
    }
  }, [story]);

  const getFileUrl = (att) => `${UPLOAD_BASE}${att.url}`;

  const imageAttachments = attachments.filter((a) => a.isImage);
  const fileAttachments = attachments.filter((a) => !a.isImage);

  const openLightbox = (att) => {
    const idx = imageAttachments.findIndex((a) => a._id === att._id);
    setLightboxIndex(idx);
    setLightboxUrl(getFileUrl(att));
  };

  const navigateLightbox = (dir) => {
    const newIdx = lightboxIndex + dir;
    if (newIdx >= 0 && newIdx < imageAttachments.length) {
      setLightboxIndex(newIdx);
      setLightboxUrl(getFileUrl(imageAttachments[newIdx]));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await boardService.updateStory(story._id, formData);
      if (onStoryUpdated) onStoryUpdated();
      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async () => {
    if (!isAdmin) return;
    if (!window.confirm('¿Estás seguro de eliminar esta historia de usuario?')) return;
    try {
      await boardService.deleteStory(story._id);
      if (onStoryDeleted) onStoryDeleted(story._id);
      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const updated = await boardService.uploadAttachments(story._id, files);
      setAttachments(updated.attachments || []);
      if (onStoryUpdated) onStoryUpdated();
    } catch (error) {
      console.error(error);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteAttachment = async (attachmentId) => {
    try {
      const updated = await boardService.deleteAttachment(story._id, attachmentId);
      setAttachments(updated.attachments || []);
      if (onStoryUpdated) onStoryUpdated();
    } catch (error) {
      console.error(error);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (!isOpen || !story) return null;

  return (
    <>
      <div className="modal-backdrop" onClick={onClose}>
        <div className="modal-content modal-content-wide" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <div className="modal-title">
              {(() => {
                const cfg = CATEGORY_CONFIG[formData.category] || CATEGORY_CONFIG.tarea;
                const Icon = cfg.icon;
                return <Icon size={20} color={cfg.color} />;
              })()}
              <span>Detalle de Historia</span>
            </div>
            <button className="btn-icon" onClick={onClose}>
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Categoría</label>
              <div className="category-selector">
                {CATEGORY_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = formData.category === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      className={`category-option ${isSelected ? 'selected' : ''}`}
                      style={{
                        '--cat-color': opt.color,
                        borderColor: isSelected ? opt.color : 'var(--border-color)',
                        background: isSelected ? `${opt.color}18` : 'transparent'
                      }}
                      onClick={() => setFormData({ ...formData, category: opt.value })}
                    >
                      <Icon size={14} color={isSelected ? opt.color : 'var(--text-secondary)'} />
                      <span style={{ color: isSelected ? opt.color : 'var(--text-secondary)' }}>
                        {opt.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Título</label>
              <input
                type="text"
                className="input-field"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                disabled={!isAdmin}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Descripción</label>
              <textarea
                className="textarea-field"
                rows={3}
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
                  <option value="backlog">Backlog</option>
                  <option value="todo">ToDo</option>
                  <option value="in_progress">Development</option>
                  <option value="to_be_tested">To Be Tested</option>
                  <option value="ready_qa">Ready QA</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Prioridad</label>
                <select
                  className="select-field"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                >
                  <option value="low">Baja (Low)</option>
                  <option value="medium">Media (Medium)</option>
                  <option value="high">Alta (High)</option>
                  <option value="urgent">Urgente (Urgent)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Épica Asociada</label>
                <select
                  className="select-field"
                  value={formData.epicId}
                  onChange={(e) => setFormData({ ...formData, epicId: e.target.value })}
                  disabled={!isAdmin}
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
                  onChange={(e) => setFormData({ ...formData, sprintId: e.target.value })}
                  disabled={!isAdmin}
                >
                  <option value="">Solo Backlog (Sin Sprint)</option>
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
                <label className="form-label">Dificultad (Story Points)</label>
                <select
                  className="select-field"
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: Number(e.target.value) })}
                  disabled={!isAdmin}
                >
                  {[1, 2, 3, 5, 8, 13].map((pt) => (
                    <option key={pt} value={pt}>
                      {pt} Puntos
                    </option>
                  ))}
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
                  disabled={!isAdmin}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Horas Registradas / Invertidas</label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  className="input-field"
                  value={formData.loggedHours}
                  onChange={(e) => setFormData({ ...formData, loggedHours: Number(e.target.value) })}
                />
              </div>
            </div>

            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '12px', marginTop: '6px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
                <input
                  type="checkbox"
                  checked={formData.isBlocked}
                  onChange={(e) => setFormData({ ...formData, isBlocked: e.target.checked })}
                />
                <AlertOctagon size={16} color="var(--accent-blocked)" />
                <span style={{ color: formData.isBlocked ? 'var(--accent-blocked)' : 'var(--text-primary)' }}>
                  Marcar como Bloqueada (Impedimento)
                </span>
              </label>

              {formData.isBlocked && (
                <div style={{ marginTop: '10px' }}>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Motivo del bloqueo (ej. Dependencia de API externa)..."
                    value={formData.blockedReason}
                    onChange={(e) => setFormData({ ...formData, blockedReason: e.target.value })}
                  />
                </div>
              )}
            </div>

            <div className="attachments-section">
              <div className="attachments-header">
                <div className="attachments-title">
                  <Paperclip size={16} />
                  <span>Adjuntos ({attachments.length})</span>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  style={{ display: 'none' }}
                  onChange={handleFileSelect}
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.7z,.txt,.csv,.json"
                />
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  <Upload size={13} />
                  {uploading ? 'Subiendo...' : 'Adjuntar'}
                </button>
              </div>

              {imageAttachments.length > 0 && (
                <div className="attachment-grid">
                  {imageAttachments.map((att) => (
                    <div key={att._id} className="attachment-thumb">
                      <img
                        src={getFileUrl(att)}
                        alt={att.originalName}
                        onClick={() => openLightbox(att)}
                      />
                      <div className="attachment-thumb-overlay">
                        <button
                          type="button"
                          className="attachment-action-btn zoom"
                          onClick={() => openLightbox(att)}
                          title="Vista previa"
                        >
                          <ZoomIn size={14} />
                        </button>
                        <button
                          type="button"
                          className="attachment-action-btn delete"
                          onClick={() => handleDeleteAttachment(att._id)}
                          title="Eliminar"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <span className="attachment-thumb-name">{att.originalName}</span>
                    </div>
                  ))}
                </div>
              )}

              {fileAttachments.length > 0 && (
                <div className="attachment-file-list">
                  {fileAttachments.map((att) => (
                    <div key={att._id} className="attachment-file-item">
                      <div className="attachment-file-info">
                        <FileText size={16} color="var(--accent-todo)" />
                        <a
                          href={getFileUrl(att)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="attachment-file-name"
                        >
                          {att.originalName}
                        </a>
                        <span className="attachment-file-size">{formatFileSize(att.size)}</span>
                      </div>
                      <button
                        type="button"
                        className="attachment-action-btn delete small"
                        onClick={() => handleDeleteAttachment(att._id)}
                        title="Eliminar"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {attachments.length === 0 && (
                <div className="attachments-empty">
                  <Image size={24} color="var(--text-muted)" />
                  <span>Sin archivos adjuntos</span>
                </div>
              )}
            </div>

            <div className="modal-actions">
              {isAdmin && (
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={handleDelete}
                  style={{ marginRight: 'auto' }}
                >
                  <Trash2 size={14} />
                  Eliminar Historia
                </button>
              )}

              <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary btn-sm">
                <Check size={14} />
                Actualizar
              </button>
            </div>
          </form>
        </div>
      </div>

      {lightboxUrl && (
        <div className="attachment-lightbox" onClick={() => { setLightboxUrl(null); setLightboxIndex(-1); }}>
          <button
            className="lightbox-close"
            onClick={() => { setLightboxUrl(null); setLightboxIndex(-1); }}
          >
            <X size={24} />
          </button>

          {lightboxIndex > 0 && (
            <button
              className="lightbox-nav lightbox-nav-prev"
              onClick={(e) => { e.stopPropagation(); navigateLightbox(-1); }}
            >
              <ChevronLeft size={32} />
            </button>
          )}

          <img
            src={lightboxUrl}
            alt="Vista previa"
            className="lightbox-image"
            onClick={(e) => e.stopPropagation()}
          />

          {lightboxIndex < imageAttachments.length - 1 && (
            <button
              className="lightbox-nav lightbox-nav-next"
              onClick={(e) => { e.stopPropagation(); navigateLightbox(1); }}
            >
              <ChevronRight size={32} />
            </button>
          )}

          <div className="lightbox-counter" onClick={(e) => e.stopPropagation()}>
            {lightboxIndex + 1} / {imageAttachments.length}
          </div>
        </div>
      )}
    </>
  );
};
