import React, { useState, useRef } from 'react';
import {
  Trash2,
  Maximize2,
  Palette,
  FileText,
  Image as ImageIcon,
  AlertTriangle,
  Loader2
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
  isConnectingTarget,
  isConnectingMode,
  isAdmin,
  zoom,
  onSelect,
  onUpdate,
  onDelete,
  onStartConnection,
  onFinishConnection,
  onImageClick
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const nodeRef = useRef(null);

  const handlePointerDown = (e) => {
    e.stopPropagation();

    if (isConnectingMode && !isConnectingSource) {
      onFinishConnection(node.id, 'auto');
      return;
    }

    onSelect(node.id);

    if (!isAdmin) return;
    if (
      e.target.closest('.sitemap-handle') ||
      e.target.closest('.sitemap-resize-handle') ||
      e.target.closest('.sitemap-node-action-btn') ||
      e.target.closest('.sitemap-color-popover')
    ) {
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

  const handleHandleAction = (e, handle) => {
    e.stopPropagation();
    if (!isAdmin) return;

    if (isConnectingMode && !isConnectingSource) {
      onFinishConnection(node.id, handle);
    } else {
      onStartConnection(node.id, handle);
    }
  };

  const resolveImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('blob:')) {
      return url;
    }
    const cleanPath = url.startsWith('/') ? url : `/${url}`;
    return `${UPLOAD_BASE}${cleanPath}`;
  };

  const imageUrl = resolveImageUrl(node.imageUrl);
  const isDarkNote = node.color === '#1E1E28';

  const handleImageLoad = (e) => {
    setImageLoaded(true);
    setImageError(false);
    const nw = e.target.naturalWidth;
    const nh = e.target.naturalHeight;
    if (nw && nh && (!node.width || !node.height || node.height === 220)) {
      const ratio = nh / nw;
      const targetW = Math.min(Math.max(node.width || 300, 240), 540);
      const targetH = Math.round(targetW * ratio) + 36;
      if (Math.abs(targetH - (node.height || 180)) > 20) {
        onUpdate(node.id, { width: targetW, height: targetH });
      }
    }
  };

  return (
    <div
      ref={nodeRef}
      data-node-id={node.id}
      className={`sitemap-node ${node.type === 'image' ? 'sitemap-node-image' : 'sitemap-node-note'} ${isDarkNote ? 'theme-dark' : ''} ${isSelected ? 'is-selected' : ''} ${isConnectingSource ? 'is-connecting-source' : ''} ${isConnectingTarget ? 'is-connecting-target' : ''}`}
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
            onPointerDown={(e) => handleHandleAction(e, 'top')}
            title="Conectar por arriba"
          />
          <div
            className="sitemap-handle handle-right"
            onPointerDown={(e) => handleHandleAction(e, 'right')}
            title="Conectar por la derecha"
          />
          <div
            className="sitemap-handle handle-bottom"
            onPointerDown={(e) => handleHandleAction(e, 'bottom')}
            title="Conectar por abajo"
          />
          <div
            className="sitemap-handle handle-left"
            onPointerDown={(e) => handleHandleAction(e, 'left')}
            title="Conectar por la izquierda"
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden', flex: 1 }}>
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
            {imageUrl ? (
              <>
                {!imageLoaded && !imageError && (
                  <div style={{ position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Loader2 size={24} className="spin-animation" color="var(--accent-todo)" />
                  </div>
                )}

                {imageError ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', color: 'var(--accent-blocked)', padding: '16px', textAlign: 'center' }}>
                    <AlertTriangle size={24} />
                    <span style={{ fontSize: '0.75rem' }}>No se pudo cargar la imagen</span>
                  </div>
                ) : (
                  <img
                    src={imageUrl}
                    alt={node.title || 'Sitemap Screen'}
                    className="sitemap-node-img"
                    loading="eager"
                    onLoad={handleImageLoad}
                    onError={() => {
                      setImageError(true);
                      setImageLoaded(true);
                    }}
                  />
                )}
              </>
            ) : (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                Sin imagen
              </div>
            )}

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
