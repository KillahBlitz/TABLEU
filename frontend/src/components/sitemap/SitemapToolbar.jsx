import React, { useState } from 'react';
import {
  Plus,
  Image as ImageIcon,
  FileText,
  Trash2,
  ZoomIn,
  ZoomOut,
  Maximize,
  RotateCcw,
  Sparkles,
  Save,
  Check,
  Loader2,
  ShieldCheck,
  Eye,
  Workflow
} from 'lucide-react';

const NEON_ARROW_COLORS = [
  { label: 'Cyan Neón', color: '#00E5FF' },
  { label: 'Púrpura Neón', color: '#B388FF' },
  { label: 'Menta Neón', color: '#00FFCC' },
  { label: 'Rosa Neón', color: '#FF007F' },
  { label: 'Amarillo Neón', color: '#FFE600' }
];

export const SitemapToolbar = ({
  isAdmin,
  zoom,
  saveStatus,
  selectedId,
  currentArrowColor,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onFitView,
  onAddNote,
  onUploadImageClick,
  onArrowColorChange,
  onDeleteSelected,
  onClearSitemap,
  onManualSave
}) => {
  const [showArrowColorPopover, setShowArrowColorPopover] = useState(false);

  return (
    <>
      <div className="sitemap-toolbar-floating">
        {isAdmin ? (
          <>
            <div className="sitemap-toolbar-section">
              <button
                className="sitemap-tool-btn"
                onClick={onAddNote}
                title="Crear nuevo bloque de escritura o nota"
              >
                <Plus size={15} color="var(--accent-done)" />
                <FileText size={15} />
                <span>Nota</span>
              </button>

              <button
                className="sitemap-tool-btn"
                onClick={onUploadImageClick}
                title="Subir imagen o pegar con Ctrl+V"
              >
                <Plus size={15} color="var(--accent-todo)" />
                <ImageIcon size={15} />
                <span>Imagen</span>
              </button>
            </div>

            <div className="sitemap-toolbar-divider" />

            <div className="sitemap-toolbar-section" style={{ position: 'relative' }}>
              <button
                className="sitemap-tool-btn"
                onClick={() => setShowArrowColorPopover(!showArrowColorPopover)}
                title="Color de flechas neón"
              >
                <Workflow size={15} style={{ color: currentArrowColor }} />
                <span>Flecha</span>
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    backgroundColor: currentArrowColor,
                    boxShadow: `0 0 6px ${currentArrowColor}`
                  }}
                />
              </button>

              {showArrowColorPopover && (
                <div
                  className="sitemap-color-popover"
                  onClick={(e) => e.stopPropagation()}
                >
                  {NEON_ARROW_COLORS.map((item) => (
                    <div
                      key={item.color}
                      className={`sitemap-color-dot ${currentArrowColor === item.color ? 'active' : ''}`}
                      style={{
                        backgroundColor: item.color,
                        boxShadow: `0 0 8px ${item.color}`
                      }}
                      title={item.label}
                      onClick={() => {
                        onArrowColorChange(item.color);
                        setShowArrowColorPopover(false);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {selectedId && (
              <>
                <div className="sitemap-toolbar-divider" />
                <button
                  className="sitemap-tool-btn btn-danger-tool"
                  onClick={onDeleteSelected}
                  title="Eliminar elemento seleccionado (Supr / Backspace)"
                >
                  <Trash2 size={15} />
                  <span>Eliminar</span>
                </button>
              </>
            )}

            <div className="sitemap-toolbar-divider" />

            <div className="sitemap-toolbar-section">
              <div
                className={`sitemap-save-badge ${saveStatus}`}
                onClick={onManualSave}
                style={{ cursor: 'pointer' }}
                title="Haga clic para forzar guardado"
              >
                {saveStatus === 'saving' && <Loader2 size={13} className="spin-animation" />}
                {saveStatus === 'saved' && <Check size={13} />}
                {saveStatus === 'unsaved' && <Save size={13} />}
                <span>
                  {saveStatus === 'saving'
                    ? 'Guardando...'
                    : saveStatus === 'saved'
                    ? 'Guardado'
                    : 'Sin guardar'}
                </span>
              </div>

              <button
                className="sitemap-tool-btn btn-danger-tool"
                onClick={onClearSitemap}
                title="Limpiar todo el mapa"
                style={{ padding: '6px 8px' }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          </>
        ) : (
          <div className="sitemap-readonly-badge">
            <Eye size={15} />
            <span>Modo Visualización (Lectura)</span>
          </div>
        )}
      </div>

      <div className="sitemap-zoom-controls">
        <button
          className="sitemap-zoom-btn"
          onClick={onZoomOut}
          title="Alejar zoom (-)"
        >
          <ZoomOut size={16} />
        </button>

        <span
          className="sitemap-zoom-level"
          onClick={onResetZoom}
          title="Restablecer zoom al 100%"
          style={{ cursor: 'pointer' }}
        >
          {Math.round(zoom * 100)}%
        </span>

        <button
          className="sitemap-zoom-btn"
          onClick={onZoomIn}
          title="Acercar zoom (+)"
        >
          <ZoomIn size={16} />
        </button>

        <div style={{ width: 1, height: 16, background: 'var(--border-color)', margin: '0 2px' }} />

        <button
          className="sitemap-zoom-btn"
          onClick={onFitView}
          title="Ajustar y centrar elementos"
        >
          <Maximize size={15} />
        </button>

        <button
          className="sitemap-zoom-btn"
          onClick={onResetZoom}
          title="Restablecer vista a origen"
        >
          <RotateCcw size={14} />
        </button>
      </div>
    </>
  );
};
