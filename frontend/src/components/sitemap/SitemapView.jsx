import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { SitemapCanvas } from './SitemapCanvas';
import { SitemapToolbar } from './SitemapToolbar';
import { SitemapLightbox } from './SitemapLightbox';
import {
  getSitemap,
  updateSitemap,
  uploadSitemapImage,
  clearSitemap as apiClearSitemap
} from '../../services/sitemapService';
import { UploadCloud, CheckCircle2 } from 'lucide-react';
import '../../styles/sitemap.css';

export const SitemapView = () => {
  const { user, isAdmin } = useAuth();

  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [selectedId, setSelectedId] = useState(null);
  const [connectingSource, setConnectingSource] = useState(null);
  const [currentArrowColor, setCurrentArrowColor] = useState('#00E5FF');
  const [lightboxNode, setLightboxNode] = useState(null);
  const [saveStatus, setSaveStatus] = useState('saved');
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [pasteToast, setPasteToast] = useState(null);

  const fileInputRef = useRef(null);
  const saveTimeoutRef = useRef(null);
  const isInitialMount = useRef(true);
  const mousePosRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const fetchSitemapData = async () => {
      try {
        const data = await getSitemap();
        if (data) {
          setNodes(data.nodes || []);
          setEdges(data.edges || []);
          if (data.viewport) {
            setPan({ x: data.viewport.x || 0, y: data.viewport.y || 0 });
            setZoom(data.viewport.zoom || 1);
          }
        }
      } catch (error) {
        console.error('Error fetching sitemap:', error);
      }
    };

    fetchSitemapData();
  }, []);

  const triggerAutoSave = useCallback((updatedNodes, updatedEdges, updatedViewport) => {
    if (!isAdmin) return;
    setSaveStatus('unsaved');

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        setSaveStatus('saving');
        await updateSitemap({
          nodes: updatedNodes !== undefined ? updatedNodes : nodes,
          edges: updatedEdges !== undefined ? updatedEdges : edges,
          viewport: updatedViewport !== undefined ? updatedViewport : { ...pan, zoom }
        });
        setSaveStatus('saved');
      } catch (error) {
        console.error('Error saving sitemap:', error);
        setSaveStatus('unsaved');
      }
    }, 1200);
  }, [isAdmin, nodes, edges, pan, zoom]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
  }, [nodes, edges, pan, zoom]);

  const handleMouseMove = (e) => {
    mousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const processImageUpload = useCallback(async (file, targetCanvasPos = null) => {
    if (!isAdmin) return;

    try {
      setPasteToast('Subiendo y procesando imagen...');
      const response = await uploadSitemapImage(file);
      const uploadedFile = response.file || response.files?.[0];

      if (!uploadedFile) {
        setPasteToast('Error al subir la imagen');
        setTimeout(() => setPasteToast(null), 3000);
        return;
      }

      let posX, posY;
      if (targetCanvasPos) {
        posX = targetCanvasPos.x;
        posY = targetCanvasPos.y;
      } else {
        const container = document.querySelector('.sitemap-view-container');
        const rect = container?.getBoundingClientRect() || { left: 0, top: 0, width: 800, height: 600 };
        const centerClientX = rect.left + rect.width / 2;
        const centerClientY = rect.top + rect.height / 2;

        posX = (centerClientX - rect.left - pan.x) / zoom - 150;
        posY = (centerClientY - rect.top - pan.y) / zoom - 110;
      }

      const newNode = {
        id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        type: 'image',
        x: Math.round(posX),
        y: Math.round(posY),
        width: 300,
        height: 220,
        imageUrl: uploadedFile.url,
        originalName: uploadedFile.originalName,
        title: (uploadedFile.originalName || 'Pantalla').replace(/\.[^/.]+$/, ''),
        zIndex: nodes.length + 1
      };

      const newNodesList = [...nodes, newNode];
      setNodes(newNodesList);
      setSelectedId(newNode.id);
      triggerAutoSave(newNodesList, edges, { ...pan, zoom });

      setPasteToast('¡Imagen agregada al sitemap!');
      setTimeout(() => setPasteToast(null), 3000);
    } catch (err) {
      console.error(err);
      setPasteToast('Error al procesar la imagen');
      setTimeout(() => setPasteToast(null), 3000);
    }
  }, [isAdmin, pan, zoom, nodes, edges, triggerAutoSave]);

  useEffect(() => {
    const handlePaste = (e) => {
      if (!isAdmin) return;
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      let imageBlob = null;
      if (e.clipboardData?.files && e.clipboardData.files.length > 0) {
        for (let i = 0; i < e.clipboardData.files.length; i++) {
          if (e.clipboardData.files[i].type.startsWith('image/')) {
            imageBlob = e.clipboardData.files[i];
            break;
          }
        }
      }

      if (!imageBlob && e.clipboardData?.items) {
        for (let i = 0; i < e.clipboardData.items.length; i++) {
          const item = e.clipboardData.items[i];
          if (item.type.indexOf('image') !== -1) {
            imageBlob = item.getAsFile();
            if (imageBlob) break;
          }
        }
      }

      if (imageBlob) {
        e.preventDefault();
        const container = document.querySelector('.sitemap-view-container');
        let targetPos = null;

        if (container) {
          const rect = container.getBoundingClientRect();
          const clientX = mousePosRef.current.x;
          const clientY = mousePosRef.current.y;

          if (
            clientX >= rect.left &&
            clientX <= rect.right &&
            clientY >= rect.top &&
            clientY <= rect.bottom
          ) {
            targetPos = {
              x: (clientX - rect.left - pan.x) / zoom - 150,
              y: (clientY - rect.top - pan.y) / zoom - 110
            };
          }
        }

        const fileName = imageBlob.name || `pasted_image_${Date.now()}.png`;
        const fileToUpload = new File([imageBlob], fileName, {
          type: imageBlob.type || 'image/png'
        });

        processImageUpload(fileToUpload, targetPos);
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isAdmin, pan, zoom, processImageUpload]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId && isAdmin) {
        handleDeleteSelected();
      }

      if (e.key === 'Escape') {
        setSelectedId(null);
        setConnectingSource(null);
        setLightboxNode(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!isAdmin) return;
    setIsDraggingFile(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDraggingFile(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDraggingFile(false);
    if (!isAdmin) return;

    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      const container = document.querySelector('.sitemap-view-container');
      const rect = container?.getBoundingClientRect() || { left: 0, top: 0 };
      const dropPos = {
        x: (e.clientX - rect.left - pan.x) / zoom - 150,
        y: (e.clientY - rect.top - pan.y) / zoom - 110
      };

      for (let i = 0; i < files.length; i++) {
        if (files[i].type.startsWith('image/')) {
          processImageUpload(files[i], { x: dropPos.x + i * 40, y: dropPos.y + i * 40 });
        }
      }
    }
  };

  const handleAddNote = () => {
    if (!isAdmin) return;

    const container = document.querySelector('.sitemap-view-container');
    const rect = container?.getBoundingClientRect() || { left: 0, top: 0, width: 800, height: 600 };
    const centerClientX = rect.left + rect.width / 2;
    const centerClientY = rect.top + rect.height / 2;

    const posX = (centerClientX - rect.left - pan.x) / zoom - 130;
    const posY = (centerClientY - rect.top - pan.y) / zoom - 90;

    const newNote = {
      id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      type: 'note',
      x: Math.round(posX),
      y: Math.round(posY),
      width: 260,
      height: 190,
      title: 'Nueva Nota',
      content: '',
      color: '#FF7D8A',
      zIndex: nodes.length + 1
    };

    const newNodesList = [...nodes, newNote];
    setNodes(newNodesList);
    setSelectedId(newNote.id);
    triggerAutoSave(newNodesList, edges, { ...pan, zoom });
  };

  const handleFileInputChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        processImageUpload(files[i]);
      }
    }
    e.target.value = '';
  };

  const handleUpdateNode = (id, updates) => {
    if (!isAdmin) return;

    const updatedNodes = nodes.map((n) => (n.id === id ? { ...n, ...updates } : n));
    setNodes(updatedNodes);
    triggerAutoSave(updatedNodes, edges, { ...pan, zoom });
  };

  const handleDeleteNode = (id) => {
    if (!isAdmin) return;

    const updatedNodes = nodes.filter((n) => n.id !== id);
    const updatedEdges = edges.filter((e) => e.fromNodeId !== id && e.toNodeId !== id);
    setNodes(updatedNodes);
    setEdges(updatedEdges);
    if (selectedId === id) setSelectedId(null);
    triggerAutoSave(updatedNodes, updatedEdges, { ...pan, zoom });
  };

  const handleDeleteEdge = (id) => {
    if (!isAdmin) return;

    const updatedEdges = edges.filter((e) => e.id !== id);
    setEdges(updatedEdges);
    if (selectedId === id) setSelectedId(null);
    triggerAutoSave(nodes, updatedEdges, { ...pan, zoom });
  };

  const handleDeleteSelected = () => {
    if (!selectedId || !isAdmin) return;

    const isNode = nodes.some((n) => n.id === selectedId);
    if (isNode) {
      handleDeleteNode(selectedId);
    } else {
      handleDeleteEdge(selectedId);
    }
  };

  const handleStartConnection = (nodeId, handle = 'auto') => {
    if (!isAdmin) return;
    setConnectingSource({ nodeId, handle });
  };

  const handleFinishConnection = (targetNodeId, targetHandle = 'auto') => {
    if (!isAdmin || !connectingSource || connectingSource.nodeId === targetNodeId) {
      setConnectingSource(null);
      return;
    }

    const exists = edges.some(
      (e) => e.fromNodeId === connectingSource.nodeId && e.toNodeId === targetNodeId
    );

    if (!exists) {
      const newEdge = {
        id: `edge-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        fromNodeId: connectingSource.nodeId,
        toNodeId: targetNodeId,
        fromHandle: connectingSource.handle || 'auto',
        toHandle: targetHandle || 'auto',
        color: currentArrowColor || '#00E5FF',
        style: 'curved'
      };

      const updatedEdges = [...edges, newEdge];
      setEdges(updatedEdges);
      triggerAutoSave(nodes, updatedEdges, { ...pan, zoom });
    }

    setConnectingSource(null);
  };

  const handleClearSitemap = async () => {
    if (!isAdmin) return;
    if (window.confirm('¿Estás seguro de que deseas limpiar todo el sitemap? Esta acción eliminará todas las pantallas, notas y flechas conectadas.')) {
      setNodes([]);
      setEdges([]);
      setSelectedId(null);
      setConnectingSource(null);
      try {
        await apiClearSitemap();
        setSaveStatus('saved');
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleFitView = () => {
    if (nodes.length === 0) {
      setPan({ x: 0, y: 0 });
      setZoom(1);
      return;
    }

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    nodes.forEach((n) => {
      minX = Math.min(minX, n.x);
      minY = Math.min(minY, n.y);
      maxX = Math.max(maxX, n.x + (n.width || 260));
      maxY = Math.max(maxY, n.y + (n.height || 180));
    });

    const padding = 100;
    const contentW = maxX - minX + padding * 2;
    const contentH = maxY - minY + padding * 2;

    const container = document.querySelector('.sitemap-view-container');
    const viewW = container?.clientWidth || 1000;
    const viewH = container?.clientHeight || 700;

    const fitZoom = Math.min(Math.max(0.2, Math.min(viewW / contentW, viewH / contentH)), 1.5);
    const fitPanX = (viewW - (maxX + minX) * fitZoom) / 2;
    const fitPanY = (viewH - (maxY + minY) * fitZoom) / 2;

    setZoom(fitZoom);
    setPan({ x: Math.round(fitPanX), y: Math.round(fitPanY) });
  };

  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <div
      className="sitemap-view-container"
      onMouseMove={handleMouseMove}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={handleFileInputChange}
      />

      <SitemapToolbar
        isAdmin={isAdmin}
        zoom={zoom}
        saveStatus={saveStatus}
        selectedId={selectedId}
        currentArrowColor={currentArrowColor}
        isConnecting={!!connectingSource}
        onZoomIn={() => setZoom((z) => Math.min(z * 1.15, 3.5))}
        onZoomOut={() => setZoom((z) => Math.max(z * 0.85, 0.15))}
        onResetZoom={handleResetZoom}
        onFitView={handleFitView}
        onAddNote={handleAddNote}
        onUploadImageClick={() => fileInputRef.current?.click()}
        onArrowColorChange={(color) => setCurrentArrowColor(color)}
        onDeleteSelected={handleDeleteSelected}
        onClearSitemap={handleClearSitemap}
        onManualSave={() => triggerAutoSave(nodes, edges, { ...pan, zoom })}
      />

      <SitemapCanvas
        nodes={nodes}
        edges={edges}
        pan={pan}
        zoom={zoom}
        selectedId={selectedId}
        connectingSource={connectingSource}
        currentArrowColor={currentArrowColor}
        isAdmin={isAdmin}
        onPanChange={(newPan) => setPan(newPan)}
        onZoomChange={(newZoom) => setZoom(newZoom)}
        onSelectNode={(id) => setSelectedId(id)}
        onSelectEdge={(id) => setSelectedId(id)}
        onUpdateNode={handleUpdateNode}
        onDeleteNode={handleDeleteNode}
        onDeleteEdge={handleDeleteEdge}
        onStartConnection={handleStartConnection}
        onFinishConnection={handleFinishConnection}
        onCancelConnection={() => setConnectingSource(null)}
        onImageClick={(node) => setLightboxNode(node)}
        onCanvasClick={() => {
          setSelectedId(null);
          setConnectingSource(null);
        }}
      />

      {isDraggingFile && (
        <div className="sitemap-drag-indicator">
          <UploadCloud size={48} color="var(--accent-todo)" />
          <span className="sitemap-drag-title">Suelta la imagen para colocarla en el Sitemap</span>
        </div>
      )}

      {pasteToast && (
        <div className="sitemap-paste-toast">
          <CheckCircle2 size={18} color="var(--accent-done)" />
          <span>{pasteToast}</span>
        </div>
      )}

      <div className="sitemap-hints-overlay">
        <span>Navegación:</span>
        <span className="sitemap-hints-key">Rueda</span>
        <span>Zoom</span>
        <span>•</span>
        <span className="sitemap-hints-key">Arrastrar</span>
        <span>Mover mapa</span>
        {isAdmin && (
          <>
            <span>•</span>
            <span className="sitemap-hints-key">Ctrl + V</span>
            <span>Pegar imagen</span>
          </>
        )}
      </div>

      {lightboxNode && (
        <SitemapLightbox
          node={lightboxNode}
          onClose={() => setLightboxNode(null)}
        />
      )}
    </div>
  );
};

export default SitemapView;
