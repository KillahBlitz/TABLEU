import React, { useRef, useState } from 'react';
import {
  X,
  UploadCloud,
  Plus,
  Trash2,
  GripVertical,
  Image as ImageIcon,
  Check,
  Search
} from 'lucide-react';

export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

export const SitemapLibraryDrawer = ({
  isOpen,
  onClose,
  library = [],
  onAddToCanvas,
  onUploadScreens,
  onDeleteFromLibrary
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFiles = async (files) => {
    if (!files || files.length === 0) return;
    const items = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        try {
          const base64 = await fileToBase64(file);
          items.push({
            id: `lib-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
            title: file.name.replace(/\.[^/.]+$/, ''),
            originalName: file.name,
            imageUrl: base64,
            file: file,
            createdAt: new Date().toISOString()
          });
        } catch (err) {
          console.error('Error reading file:', err);
        }
      }
    }
    if (items.length > 0) {
      onUploadScreens(items);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const filteredLibrary = library.filter((item) =>
    (item.title || item.originalName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="sitemap-library-drawer">
      <div className="sitemap-library-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ImageIcon size={18} color="var(--accent-todo)" />
          <span className="sitemap-library-title">Galería de Pantallas</span>
          <span className="sitemap-library-count">{library.length}</span>
        </div>
        <button className="btn-icon" onClick={onClose} title="Cerrar panel">
          <X size={18} />
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = '';
        }}
      />

      <div
        className={`sitemap-library-dropzone ${isDraggingOver ? 'drag-over' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true); }}
        onDragLeave={() => setIsDraggingOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <UploadCloud size={24} color="var(--accent-todo)" />
        <span style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-primary)' }}>
          Subir nuevas pantallas
        </span>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
          Arrastra imágenes aquí o haz clic para examinar
        </span>
      </div>

      {library.length > 3 && (
        <div className="sitemap-library-search">
          <Search size={14} color="var(--text-secondary)" />
          <input
            type="text"
            placeholder="Buscar pantalla..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      )}

      <div className="sitemap-library-list">
        {filteredLibrary.length === 0 ? (
          <div className="sitemap-library-empty">
            <ImageIcon size={32} opacity={0.3} />
            <span>No hay pantallas en la galería</span>
            <span style={{ fontSize: '0.74rem', opacity: 0.6 }}>
              Sube tus imágenes arriba para arrastrarlas al mapa
            </span>
          </div>
        ) : (
          filteredLibrary.map((item) => (
            <div
              key={item.id}
              className="sitemap-library-item"
              draggable={true}
              onDragStart={(e) => {
                e.dataTransfer.setData('application/json', JSON.stringify(item));
                e.dataTransfer.effectAllowed = 'copy';
              }}
            >
              <div className="sitemap-library-item-thumb">
                <img src={item.imageUrl} alt={item.title} />
              </div>

              <div className="sitemap-library-item-info">
                <span className="sitemap-library-item-name">{item.title || item.originalName}</span>
                <span className="sitemap-library-item-hint">Arrastrar al mapa</span>
              </div>

              <div className="sitemap-library-item-actions">
                <button
                  className="sitemap-library-btn add"
                  title="Agregar al centro del mapa"
                  onClick={() => onAddToCanvas(item)}
                >
                  <Plus size={14} />
                </button>
                <button
                  className="sitemap-library-btn delete"
                  title="Eliminar de la galería"
                  onClick={() => onDeleteFromLibrary(item.id)}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SitemapLibraryDrawer;
