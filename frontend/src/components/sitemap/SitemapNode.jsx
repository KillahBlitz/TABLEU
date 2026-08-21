import React, { useState, useRef, useEffect } from 'react';
import {
  Trash2,
  Maximize2,
  Palette,
  FileText,
  Monitor,
  RefreshCw
} from 'lucide-react';

const COLOR_OPTIONS = [
  '#FF7D8A',
  '#00E5FF',
  '#FFE600',
  '#00FFCC',
  '#B388FF',
  '#FF9100',
  '#1E1E28'
];

const buildImageUrl = (rawUrl) => {
  if (!rawUrl) return null;
  if (rawUrl.startsWith('data:') || rawUrl.startsWith('blob:') || rawUrl.startsWith('http')) return rawUrl;
  if (rawUrl.startsWith('/api/sitemap/image/') || rawUrl.startsWith('/api/uploads/') || rawUrl.startsWith('/uploads/')) return rawUrl;
  const filename = rawUrl.split('/').pop();
  return `/api/sitemap/image/${filename}`;
};

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
  const [imgError, setImgError] = useState(false);
  const nodeRef = useRef(null);

  const imageUrl = buildImageUrl(node.serverUrl || node.imageUrl);

  useEffect(() => {
    setImgError(false);
  }, [node.serverUrl, node.imageUrl]);

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

      if (direction.includes('e')) newW = Math.max(160, startW + dx);
      if (direction.includes('s')) newH = Math.max(120, startH + dy);
      if (direction.includes('w')) {
        const potentialW = startW - dx;
        if (potentialW >= 160) { newW = potentialW; newX = startX + dx; }
      }
      if (direction.includes('n')) {
        const potentialH = startH - dy;
        if (potentialH >= 120) { newH = potentialH; newY = startY + dy; }
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

  const isDarkNote = node.color === '#1E1E28';
  const nodeW = node.width || 260;
  const nodeH = node.height || 180;

  return (
    <div
      ref={nodeRef}
      data-node-id={node.id}
      className={[
        'sitemap-node',
        node.type === 'image' ? 'sitemap-node-image' : 'sitemap-node-note',
        isDarkNote ? 'theme-dark' : '',
        isSelected ? 'is-selected' : '',
        isConnectingSource ? 'is-connecting-source' : '',
        isConnectingTarget ? 'is-connecting-target' : ''
      ].filter(Boolean).join(' ')}
      style={{
        transform: `translate3d(${node.x}px, ${node.y}px, 0)`,
        width: `${nodeW}px`,
        height: `${nodeH}px`,
        zIndex: node.zIndex || (isSelected ? 10 : 1),
        '--note-bg': node.color || '#FF7D8A'
      }}
      onPointerDown={handlePointerDown}
    >
      {isAdmin && (
        <>
          <div className="sitemap-handle handle-top" onPointerDown={(e) => handleHandleAction(e, 'top')} />
          <div className="sitemap-handle handle-right" onPointerDown={(e) => handleHandleAction(e, 'right')} />
          <div className="sitemap-handle handle-bottom" onPointerDown={(e) => handleHandleAction(e, 'bottom')} />
          <div className="sitemap-handle handle-left" onPointerDown={(e) => handleHandleAction(e, 'left')} />
        </>
      )}

      <div
        className="sitemap-node-card"
        style={{
          backgroundColor: node.type === 'note' ? (node.color || '#FF7D8A') : undefined
        }}
      >
        {node.type === 'note' ? (
          <>
            <div className="sitemap-node-note-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, overflow: 'hidden' }}>
                <FileText size={13} opacity={0.7} />
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
                    onClick={(e) => { e.stopPropagation(); setShowColorPicker(!showColorPicker); }}
                  >
                    <Palette size={13} />
                  </button>
                  <button
                    className="sitemap-node-action-btn"
                    onClick={(e) => { e.stopPropagation(); onDelete(node.id); }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              )}
            </div>

            {showColorPicker && isAdmin && (
              <div className="sitemap-note-color-popover" onClick={(e) => e.stopPropagation()}>
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
            <div className="sitemap-screen-header">
              <div className="sitemap-screen-dots">
                <span /><span /><span />
              </div>
              {isAdmin ? (
                <input
                  type="text"
                  className="sitemap-screen-title-input"
                  value={node.title || ''}
                  placeholder="Nombre de pantalla..."
                  onChange={(e) => onUpdate(node.id, { title: e.target.value })}
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span className="sitemap-screen-title-text">{node.title || 'Pantalla'}</span>
              )}
              <div className="sitemap-node-actions" style={{ marginLeft: 'auto' }}>
                {!isConnectingMode && (
                  <button
                    className="sitemap-node-action-btn"
                    title="Vista completa"
                    onClick={(e) => { e.stopPropagation(); onImageClick && onImageClick(node); }}
                  >
                    <Maximize2 size={12} />
                  </button>
                )}
                {isAdmin && (
                  <button
                    className="sitemap-node-action-btn"
                    title="Eliminar pantalla"
                    onClick={(e) => { e.stopPropagation(); onDelete(node.id); }}
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            </div>

            <div
              className="sitemap-screen-body"
              onClick={() => { if (!isConnectingMode) onImageClick && onImageClick(node); }}
            >
              {imageUrl && !imgError ? (
                <img
                  src={imageUrl}
                  alt={node.title || 'Pantalla'}
                  className="sitemap-screen-img"
                  onError={(e) => {
                    if (!e.target.dataset.fallback) {
                      e.target.dataset.fallback = '1';
                      const filename = imageUrl.split('/').pop();
                      e.target.src = `/api/uploads/${filename}`;
                    } else {
                      setImgError(true);
                    }
                  }}
                />
              ) : imgError ? (
                <div className="sitemap-screen-error">
                  <Monitor size={28} opacity={0.3} />
                  <span>Sin imagen</span>
                  {isAdmin && (
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={(e) => { e.stopPropagation(); setImgError(false); }}
                    >
                      <RefreshCw size={10} />
                      <span>Reintentar</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="sitemap-screen-empty">
                  <Monitor size={32} opacity={0.2} />
                  <span>Sin imagen</span>
                  {isAdmin && <span style={{ fontSize: '0.7rem', opacity: 0.5 }}>Pega o arrastra una captura</span>}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {isAdmin && isSelected && (
        <>
          <div className="sitemap-resize-handle sitemap-resize-nw" onPointerDown={(e) => handleResizePointerDown(e, 'nw')} />
          <div className="sitemap-resize-handle sitemap-resize-ne" onPointerDown={(e) => handleResizePointerDown(e, 'ne')} />
          <div className="sitemap-resize-handle sitemap-resize-se" onPointerDown={(e) => handleResizePointerDown(e, 'se')} />
          <div className="sitemap-resize-handle sitemap-resize-sw" onPointerDown={(e) => handleResizePointerDown(e, 'sw')} />
          <div className="sitemap-resize-handle sitemap-resize-e" onPointerDown={(e) => handleResizePointerDown(e, 'e')} />
          <div className="sitemap-resize-handle sitemap-resize-s" onPointerDown={(e) => handleResizePointerDown(e, 's')} />
        </>
      )}
    </div>
  );
};
