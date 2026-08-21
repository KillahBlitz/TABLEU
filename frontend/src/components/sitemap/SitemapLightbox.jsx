import React, { useEffect } from 'react';
import { X, Image as ImageIcon, Download } from 'lucide-react';

const buildImageUrl = (rawUrl) => {
  if (!rawUrl) return null;
  if (rawUrl.startsWith('data:') || rawUrl.startsWith('blob:') || rawUrl.startsWith('http')) {
    return rawUrl;
  }
  if (rawUrl.startsWith('/api/sitemap/image/')) return rawUrl;
  const filename = rawUrl.split('/').pop();
  return `/api/sitemap/image/${filename}`;
};

export const SitemapLightbox = ({ node, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!node) return null;

  const imageUrl = buildImageUrl(node.imageUrl);

  return (
    <div className="sitemap-lightbox-modal" onClick={onClose}>
      <div className="sitemap-lightbox-topbar" onClick={(e) => e.stopPropagation()}>
        <div className="sitemap-lightbox-title">
          <ImageIcon size={20} color="var(--accent-todo)" />
          <span>{node.title || node.originalName || 'Vista Sitemap'}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <a
            href={imageUrl}
            target="_blank"
            rel="noopener noreferrer"
            download={node.originalName || 'vista_sitemap.png'}
            className="btn btn-secondary btn-sm"
          >
            <Download size={14} />
            <span>Descargar</span>
          </a>

          <button className="btn-icon" onClick={onClose} title="Cerrar (Esc)">
            <X size={22} />
          </button>
        </div>
      </div>

      <div className="sitemap-lightbox-content" onClick={(e) => e.stopPropagation()}>
        <img
          src={imageUrl}
          alt={node.title || 'Sitemap Screen'}
          className="sitemap-lightbox-img"
        />
      </div>
    </div>
  );
};
