import React, { useState, useRef } from 'react';
import {
  Trash2,
  Maximize2,
  Palette,
  Eye,
  FileText,
  Image as ImageIcon
} from 'lucide-react';
import { UPLOAD_BASE } from '../../services/api';

const COLOR_OPTIONS = [
  '#FF7D8A',
  '#00E5FF',
  '#FFE600',
  '#00FFCC',
  '#B388FF',
  '#FF9100',
  '#1E1E28'
];

export const SitemapNode = ({
  node,
  isSelected,
  isConnectingSource,
  isAdmin,
  zoom,
  onSelect,
  onUpdate,
  onDelete,
  onStartConnection,
  onImageClick
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const nodeRef = useRef(null);

  const handlePointerDown = (e) => {
    e.stopPropagation();
    onSelect(node.id);

    if (!isAdmin) return;
    if (e.target.closest('.sitemap-handle') || e.target.closest('.sitemap-resize-handle') || e.target.closest('.sitemap-node-action-btn') || e.target.closest('.sitemap-color-popover')) {
      return;
    }

    const startClientX = e.clientX;
    const startClientY = e.clientY;
    const startNodeX = node.x;
    const startNodeY = node.y;

    const handlePointerMove = (moveEvent) => {
      const dx = (moveEvent.clientX - startClientX) / zoom;
      const dy = (moveEvent.clientY - startClientY) / zoom;

      onUpdate(node.id, {
        x: Math.round(startNodeX + dx),
        y: Math.round(startNodeY + dy)
      });
    };

    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const handleResizePointerDown = (e, direction) => {
    e.stopPropagation();
    if (!isAdmin) return;

    const startClientX = e.clientX;
    const startClientY = e.clientY;
    const startX = node.x;
    const startY = node.y;
    const startW = node.width || 260;
    const startH = node.height || 180;

    const handlePointerMove = (moveEvent) => {
      const dx = (moveEvent.clientX - startClientX) / zoom;
      const dy = (moveEvent.clientY - startClientY) / zoom;

      let newX = startX;
      let newY = startY;
      let newW = startW;
      let newH = startH;

      if (direction.includes('e')) {
        newW = Math.max(140, startW + dx);
      }
      if (direction.includes('s')) {
        newH = Math.max(100, startH + dy);
      }
      if (direction.includes('w')) {
        const potentialW = startW - dx;
        if (potentialW >= 140) {
          newW = potentialW;
          newX = startX + dx;
        }
      }
      if (direction.includes('n')) {
        const potentialH = startH - dy;
        if (potentialH >= 100) {
          newH = potentialH;
          newY = startY + dy;
        }
      }

      onUpdate(node.id, {
        x: Math.round(newX),
        y: Math.round(newY),
        width: Math.round(newW),
        height: Math.round(newH)
      });
    };

    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const handleStartConnect = (e, handle) => {
    e.stopPropagation();
    if (!isAdmin) return;
    onStartConnection(node.id, handle);
  };

  const isDarkNote = node.color === '#1E1E28';
  const imageUrl = node.imageUrl?.startsWith('http')
    ? node.imageUrl
    : `${UPLOAD_BASE}${node.imageUrl}`;

  return (
    <div
      ref={nodeRef}
      className={`sitemap-node ${node.type === 'image' ? 'sitemap-node-image' : 'sitemap-node-note'} ${isDarkNote ? 'theme-dark' : ''} ${isSelected ? 'is-selected' : ''} ${isConnectingSource ? 'is-connecting-source' : ''}`}
      style={{
        transform: `translate3d(${node.x}px, ${node.y}px, 0)`,
        width: `${node.width || 260}px`,
        height: `${node.height || 180}px`,
        zIndex: node.zIndex || (isSelected ? 10 : 1),
        '--note-bg': node.color || '#FF7D8A'
      }}
      onPointerDown={handlePointerDown}
    >
      {isAdmin && (
        <>
          <div
            className="sitemap-handle handle-top"
            onPointerDown={(e) => handleStartConnect(e, 'top')}
            title="Conectar hacia arriba"
          />
          <div
            className="sitemap-handle handle-right"
            onPointerDown={(e) => handleStartConnect(e, 'right')}
            title="Conectar hacia la derecha"
          />
          <div
            className="sitemap-handle handle-bottom"
            onPointerDown={(e) => handleStartConnect(e, 'bottom')}
            title="Conectar hacia abajo"
          />
          <div
            className="sitemap-handle handle-left"
            onPointerDown={(e) => handleStartConnect(e, 'left')}
            title="Conectar hacia la izquierda"
          />
        </>
      )}

      {node.type === 'note' ? (
        <>
          <div className="sitemap-node-note-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}>
              <FileText size={14} opacity={0.7} />
              {isAdmin ? (
                <input
                  type="text"
                  className="sitemap-node-title-input"
                  value={node.title || ''}
                  placeholder="Título..."
                  onChange={(e) => onUpdate(node.id, { title: e.target.value })}
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span className="sitemap-node-title-input">{node.title || 'Nota'}</span>
              )}
            </div>

            {isAdmin && (
              <div className="sitemap-node-actions">
                <button
                  className="sitemap-node-action-btn"
                  title="Color de nota"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowColorPicker(!showColorPicker);
                  }}
                >
                  <Palette size={13} />
                </button>
                <button
                  className="sitemap-node-action-btn"
                  title="Eliminar nota"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(node.id);
                  }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            )}
          </div>

          {showColorPicker && isAdmin && (
            <div className="sitemap-color-popover" onClick={(e) => e.stopPropagation()}>
              {COLOR_OPTIONS.map((c) => (
                <div
                  key={c}
                  className={`sitemap-color-dot ${node.color === c ? 'active' : ''}`}
                  style={{ backgroundColor: c }}
                  onClick={() => {
                    onUpdate(node.id, { color: c });
                    setShowColorPicker(false);
                  }}
                />
              ))}
            </div>
          )}

          {isAdmin ? (
            <textarea
              className="sitemap-node-textarea"
              value={node.content || ''}
              placeholder="Escribe aquí tu información, notas o flujos..."
              onChange={(e) => onUpdate(node.id, { content: e.target.value })}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <div className="sitemap-node-note-viewtext">
              {node.content || 'Sin contenido'}
            </div>
          )}
        </>
      ) : (
        <>
          <div className="sitemap-node-image-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
              <ImageIcon size={13} color="var(--accent-todo)" />
              {isAdmin ? (
                <input
                  type="text"
                  className="sitemap-node-title-input"
                  value={node.title || ''}
                  placeholder="Nombre de vista..."
                  onChange={(e) => onUpdate(node.id, { title: e.target.value })}
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span className="sitemap-node-image-title">{node.title || 'Vista'}</span>
              )}
            </div>

            {isAdmin && (
              <div className="sitemap-node-actions">
                <button
                  className="sitemap-node-action-btn"
                  title="Eliminar imagen"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(node.id);
                  }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            )}
          </div>

          <div
            className="sitemap-node-image-body"
            onClick={() => onImageClick && onImageClick(node)}
          >
            <img
              src={imageUrl}
              alt={node.title || 'Sitemap Screen'}
              className="sitemap-node-img"
              loading="lazy"
            />
            <div className="sitemap-node-img-overlay">
              <button
                className="sitemap-overlay-btn"
                title="Ampliar vista"
                onClick={(e) => {
                  e.stopPropagation();
                  onImageClick && onImageClick(node);
                }}
              >
                <Maximize2 size={16} />
              </button>
              {isAdmin && (
                <button
                  className="sitemap-overlay-btn btn-delete"
                  title="Eliminar vista"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(node.id);
                  }}
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {isAdmin && isSelected && (
        <>
          <div
            className="sitemap-resize-handle sitemap-resize-nw"
            onPointerDown={(e) => handleResizePointerDown(e, 'nw')}
          />
          <div
            className="sitemap-resize-handle sitemap-resize-ne"
            onPointerDown={(e) => handleResizePointerDown(e, 'ne')}
          />
          <div
            className="sitemap-resize-handle sitemap-resize-se"
            onPointerDown={(e) => handleResizePointerDown(e, 'se')}
          />
          <div
            className="sitemap-resize-handle sitemap-resize-sw"
            onPointerDown={(e) => handleResizePointerDown(e, 'sw')}
          />
          <div
            className="sitemap-resize-handle sitemap-resize-e"
            onPointerDown={(e) => handleResizePointerDown(e, 'e')}
          />
          <div
            className="sitemap-resize-handle sitemap-resize-s"
            onPointerDown={(e) => handleResizePointerDown(e, 's')}
          />
        </>
      )}
    </div>
  );
};
