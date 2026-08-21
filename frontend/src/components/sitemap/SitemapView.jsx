import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { SitemapCanvas } from './SitemapCanvas';
import { SitemapToolbar } from './SitemapToolbar';
import { SitemapLightbox } from './SitemapLightbox';
import { SitemapLibraryDrawer } from './SitemapLibraryDrawer';
import {
  getSitemap,
  updateSitemap,
  uploadSitemapImage,
  clearSitemap as apiClearSitemap
} from '../../services/sitemapService';
import {
  connectSitemapSocket,
  getSitemapSocket,
  emitOp,
  disconnectSitemapSocket
} from '../../services/sitemapSocket';
import { UploadCloud, CheckCircle2 } from 'lucide-react';
import '../../styles/sitemap.css';

export const SitemapView = () => {
  const { user, isAdmin } = useAuth();

  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [library, setLibrary] = useState([]);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [selectedId, setSelectedId] = useState(null);
  const [connectingSource, setConnectingSource] = useState(null);
  const [currentArrowColor, setCurrentArrowColor] = useState('#00E5FF');
  const [lightboxNode, setLightboxNode] = useState(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [pasteToast, setPasteToast] = useState(null);
  const [remoteCursors, setRemoteCursors] = useState({});

  const mousePosRef = useRef({ x: 0, y: 0 });
  const panRef = useRef({ x: 0, y: 0 });
  const zoomRef = useRef(1);
  const lastCursorEmitRef = useRef(0);
  const saveTimeoutRef = useRef(null);
  const nodesRef = useRef([]);
  const edgesRef = useRef([]);
  const libraryRef = useRef([]);

  useEffect(() => { panRef.current = pan; }, [pan]);
  useEffect(() => { zoomRef.current = zoom; }, [zoom]);
  useEffect(() => { nodesRef.current = nodes; }, [nodes]);
  useEffect(() => { edgesRef.current = edges; }, [edges]);
  useEffect(() => { libraryRef.current = library; }, [library]);

  const triggerAutoSave = useCallback(() => {
    if (!isAdmin) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await updateSitemap({
          nodes: nodesRef.current,
          edges: edgesRef.current,
          library: libraryRef.current,
          viewport: { ...panRef.current, zoom: zoomRef.current }
        });
      } catch (err) {
        console.error('Auto-save error:', err);
      }
    }, 1500);
  }, [isAdmin]);

  useEffect(() => {
    const fetchSitemapData = async () => {
      try {
        const data = await getSitemap();
        if (data) {
          setNodes(data.nodes || []);
          setEdges(data.edges || []);
          setLibrary(data.library || []);
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

  useEffect(() => {
    const socket = connectSitemapSocket();

    const handleNodeUpsert = (node) => {
      setNodes((prev) => {
        const idx = prev.findIndex((n) => n.id === node.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = node;
          return next;
        }
        return [...prev, node];
      });
    };

    const handleNodeDelete = ({ id }) => {
      setNodes((prev) => prev.filter((n) => n.id !== id));
      setEdges((prev) => prev.filter((e) => e.fromNodeId !== id && e.toNodeId !== id));
    };

    const handleEdgeUpsert = (edge) => {
      setEdges((prev) => {
        const idx = prev.findIndex((e) => e.id === edge.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = edge;
          return next;
        }
        return [...prev, edge];
      });
    };

    const handleEdgeDelete = ({ id }) => {
      setEdges((prev) => prev.filter((e) => e.id !== id));
    };

    const handleLibraryUpsert = (item) => {
      setLibrary((prev) => {
        const idx = prev.findIndex((l) => l.id === item.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = item;
          return next;
        }
        return [item, ...prev];
      });
    };

    const handleLibraryDelete = ({ id }) => {
      setLibrary((prev) => prev.filter((l) => l.id !== id));
    };

    const handleSitemapUpdated = (data) => {
      if (data.nodes !== undefined) setNodes(data.nodes);
      if (data.edges !== undefined) setEdges(data.edges);
      if (data.library !== undefined) setLibrary(data.library || []);
    };

    const handleCursor = (data) => {
      console.log('[sitemap:cursor]', data.socketId, data.name, data.x, data.y);
      setRemoteCursors((prev) => ({
        ...prev,
        [data.socketId]: { name: data.name, color: data.color || '#00E5FF', x: data.x, y: data.y }
      }));
    };

    const handleCursorLeave = ({ socketId }) => {
      setRemoteCursors((prev) => {
        const next = { ...prev };
        delete next[socketId];
        return next;
      });
    };

    socket.on('sitemap:node:upsert', handleNodeUpsert);
    socket.on('sitemap:node:delete', handleNodeDelete);
    socket.on('sitemap:edge:upsert', handleEdgeUpsert);
    socket.on('sitemap:edge:delete', handleEdgeDelete);
    socket.on('sitemap:library:upsert', handleLibraryUpsert);
    socket.on('sitemap:library:delete', handleLibraryDelete);
    socket.on('sitemap:updated', handleSitemapUpdated);
    socket.on('sitemap:cursor', handleCursor);
    socket.on('sitemap:cursor:leave', handleCursorLeave);

    return () => {
      socket.off('sitemap:node:upsert', handleNodeUpsert);
      socket.off('sitemap:node:delete', handleNodeDelete);
      socket.off('sitemap:edge:upsert', handleEdgeUpsert);
      socket.off('sitemap:edge:delete', handleEdgeDelete);
      socket.off('sitemap:library:upsert', handleLibraryUpsert);
      socket.off('sitemap:library:delete', handleLibraryDelete);
      socket.off('sitemap:updated', handleSitemapUpdated);
      socket.off('sitemap:cursor', handleCursor);
      socket.off('sitemap:cursor:leave', handleCursorLeave);
      disconnectSitemapSocket();
    };
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      emitOp('sitemap:viewport', { ...pan, zoom });
    }, 1500);
    return () => clearTimeout(timeout);
  }, [pan, zoom]);

  const handleMouseMove = (e) => {
    mousePosRef.current = { x: e.clientX, y: e.clientY };

    const now = Date.now();
    if (now - lastCursorEmitRef.current < 50) return;
    lastCursorEmitRef.current = now;

    const rect = e.currentTarget.getBoundingClientRect();
    const canvasX = (e.clientX - rect.left - panRef.current.x) / zoomRef.current;
    const canvasY = (e.clientY - rect.top - panRef.current.y) / zoomRef.current;

    const socket = getSitemapSocket();
    if (socket?.connected) {
      socket.emit('sitemap:cursor', {
        x: canvasX,
        y: canvasY,
        name: user?.name || 'Usuario',
        color: user?.avatarColor || '#00E5FF'
      });
    }
  };

  const processImageUpload = useCallback(async (file, targetCanvasPos = null) => {
    if (!isAdmin) return;

    try {
      setPasteToast('Subiendo imagen...');
      const response = await uploadSitemapImage(file);
      const uploaded = response.file || response.files?.[0];

      if (!uploaded?.url) {
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
        posX = (rect.width / 2 - panRef.current.x) / zoomRef.current - 150;
        posY = (rect.height / 2 - panRef.current.y) / zoomRef.current - 110;
      }

      const fileTitle = (file.name || 'Pantalla').replace(/\.[^/.]+$/, '');
      const newNode = {
        id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        type: 'image',
        x: Math.round(posX),
        y: Math.round(posY),
        width: 300,
        height: 220,
        imageUrl: uploaded.url,
        originalName: file.name || 'image.png',
        title: fileTitle,
        zIndex: Date.now()
      };

      const libItem = {
        id: `lib-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        title: fileTitle,
        originalName: file.name || 'image.png',
        imageUrl: uploaded.url,
        createdAt: new Date().toISOString()
      };

      setNodes((prev) => [...prev, newNode]);
      setLibrary((prev) => [libItem, ...prev.filter((l) => l.title !== fileTitle)]);
      setSelectedId(newNode.id);

      emitOp('sitemap:node:upsert', newNode);
      emitOp('sitemap:library:upsert', libItem);
      triggerAutoSave();

      setPasteToast('¡Imagen agregada al sitemap!');
      setTimeout(() => setPasteToast(null), 3000);
    } catch (err) {
      console.error('Error processing image:', err);
      setPasteToast('Error al procesar la imagen');
      setTimeout(() => setPasteToast(null), 3000);
    }
  }, [isAdmin, triggerAutoSave]);

  const addScreenNodeFromLibrary = useCallback((item, targetPos = null) => {
    if (!isAdmin) return;

    let posX, posY;
    if (targetPos) {
      posX = targetPos.x;
      posY = targetPos.y;
    } else {
      const container = document.querySelector('.sitemap-view-container');
      const rect = container?.getBoundingClientRect() || { left: 0, top: 0, width: 800, height: 600 };
      posX = (rect.width / 2 - panRef.current.x) / zoomRef.current - 150;
      posY = (rect.height / 2 - panRef.current.y) / zoomRef.current - 110;
    }

    const newNode = {
      id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      type: 'image',
      x: Math.round(posX),
      y: Math.round(posY),
      width: 300,
      height: 220,
      imageUrl: item.imageUrl,
      originalName: item.originalName || item.title,
      title: item.title || 'Pantalla',
      zIndex: Date.now()
    };

    setNodes((prev) => [...prev, newNode]);
    setSelectedId(newNode.id);
    emitOp('sitemap:node:upsert', newNode);
    triggerAutoSave();

    setPasteToast('¡Pantalla añadida al mapa!');
    setTimeout(() => setPasteToast(null), 2500);
  }, [isAdmin, triggerAutoSave]);

  const handleUploadScreensToLibrary = useCallback(async (items) => {
    if (!isAdmin || !items || items.length === 0) return;
    setPasteToast('Subiendo pantallas...');

    const uploaded = await Promise.all(items.map(async (item) => {
      if (!item.file) return item;
      try {
        const res = await uploadSitemapImage(item.file);
        const u = res.file || res.files?.[0];
        if (u?.url) return { ...item, imageUrl: u.url, file: undefined };
      } catch (_) {}
      return item;
    }));

    uploaded.forEach((item) => {
      const clean = { ...item, file: undefined };
      setLibrary((prev) => [clean, ...prev.filter((l) => l.id !== clean.id)]);
      emitOp('sitemap:library:upsert', clean);
    });
    triggerAutoSave();

    setPasteToast(`¡${uploaded.length} pantalla(s) subida(s) a la galería!`);
    setTimeout(() => setPasteToast(null), 3000);
  }, [isAdmin, triggerAutoSave]);

  const handleDeleteFromLibrary = useCallback((libId) => {
    if (!isAdmin) return;
    setLibrary((prev) => prev.filter((l) => l.id !== libId));
    emitOp('sitemap:library:delete', { id: libId });
    triggerAutoSave();
  }, [isAdmin, triggerAutoSave]);

  useEffect(() => {
    const handlePaste = (e) => {
      if (!isAdmin) return;
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      let imageBlob = null;
      if (e.clipboardData?.files?.length > 0) {
        for (const f of e.clipboardData.files) {
          if (f.type.startsWith('image/')) { imageBlob = f; break; }
        }
      }
      if (!imageBlob && e.clipboardData?.items) {
        for (const item of e.clipboardData.items) {
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
          const { x: cx, y: cy } = mousePosRef.current;
          if (cx >= rect.left && cx <= rect.right && cy >= rect.top && cy <= rect.bottom) {
            targetPos = {
              x: (cx - rect.left - panRef.current.x) / zoomRef.current - 150,
              y: (cy - rect.top - panRef.current.y) / zoomRef.current - 110
            };
          }
        }
        const fileName = imageBlob.name || `pasted_image_${Date.now()}.png`;
        processImageUpload(new File([imageBlob], fileName, { type: imageBlob.type || 'image/png' }), targetPos);
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isAdmin, processImageUpload]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId && isAdmin) {
        handleDeleteSelected();
      }
      if (e.key === 'Escape') {
        setSelectedId(null);
        setConnectingSource(null);
        setLightboxNode(null);
        setIsLibraryOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!isAdmin) return;
    if (e.dataTransfer.types && Array.from(e.dataTransfer.types).includes('Files')) {
      setIsDraggingFile(true);
    }
  };

  const handleDragLeave = (e) => { e.preventDefault(); setIsDraggingFile(false); };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDraggingFile(false);
    if (!isAdmin) return;

    const container = document.querySelector('.sitemap-view-container');
    const rect = container?.getBoundingClientRect() || { left: 0, top: 0 };
    const dropPos = {
      x: (e.clientX - rect.left - panRef.current.x) / zoomRef.current - 150,
      y: (e.clientY - rect.top - panRef.current.y) / zoomRef.current - 110
    };

    const libraryData = e.dataTransfer.getData('application/json');
    if (libraryData) {
      try {
        const item = JSON.parse(libraryData);
        if (item?.imageUrl) { addScreenNodeFromLibrary(item, dropPos); return; }
      } catch (_) {}
    }

    if (e.dataTransfer?.files?.length > 0) {
      Array.from(e.dataTransfer.files).forEach((f, i) => {
        if (f.type.startsWith('image/')) {
          processImageUpload(f, { x: dropPos.x + i * 40, y: dropPos.y + i * 40 });
        }
      });
    }
  };

  const handleAddNote = () => {
    if (!isAdmin) return;

    const container = document.querySelector('.sitemap-view-container');
    const rect = container?.getBoundingClientRect() || { left: 0, top: 0, width: 800, height: 600 };
    const posX = (rect.width / 2 - panRef.current.x) / zoomRef.current - 130;
    const posY = (rect.height / 2 - panRef.current.y) / zoomRef.current - 90;

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
      zIndex: Date.now()
    };

    setNodes((prev) => [...prev, newNote]);
    setSelectedId(newNote.id);
    emitOp('sitemap:node:upsert', newNote);
    triggerAutoSave();
  };

  const handleUpdateNode = (id, updates) => {
    if (!isAdmin) return;
    setNodes((prev) => {
      const updatedNodes = prev.map((n) => (n.id === id ? { ...n, ...updates } : n));
      const updatedNode = updatedNodes.find((n) => n.id === id);
      if (updatedNode) emitOp('sitemap:node:upsert', updatedNode);
      return updatedNodes;
    });
    triggerAutoSave();
  };

  const handleDeleteNode = (id) => {
    if (!isAdmin) return;
    setNodes((prev) => prev.filter((n) => n.id !== id));
    setEdges((prev) => prev.filter((e) => e.fromNodeId !== id && e.toNodeId !== id));
    if (selectedId === id) setSelectedId(null);
    emitOp('sitemap:node:delete', { id });
    triggerAutoSave();
  };

  const handleDeleteEdge = (id) => {
    if (!isAdmin) return;
    setEdges((prev) => prev.filter((e) => e.id !== id));
    if (selectedId === id) setSelectedId(null);
    emitOp('sitemap:edge:delete', { id });
    triggerAutoSave();
  };

  const handleDeleteSelected = () => {
    if (!selectedId || !isAdmin) return;
    const isNode = nodes.some((n) => n.id === selectedId);
    if (isNode) handleDeleteNode(selectedId);
    else handleDeleteEdge(selectedId);
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
      setEdges((prev) => [...prev, newEdge]);
      emitOp('sitemap:edge:upsert', newEdge);
      triggerAutoSave();
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
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleFitView = () => {
    if (nodes.length === 0) { setPan({ x: 0, y: 0 }); setZoom(1); return; }

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

  const handleResetZoom = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

  return (
    <div
      className="sitemap-view-container"
      onMouseMove={handleMouseMove}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <SitemapToolbar
        isAdmin={isAdmin}
        zoom={zoom}
        saveStatus="saved"
        selectedId={selectedId}
        currentArrowColor={currentArrowColor}
        isLibraryOpen={isLibraryOpen}
        libraryCount={library.length}
        onZoomIn={() => setZoom((z) => Math.min(z * 1.15, 3.5))}
        onZoomOut={() => setZoom((z) => Math.max(z * 0.85, 0.15))}
        onResetZoom={handleResetZoom}
        onFitView={handleFitView}
        onAddNote={handleAddNote}
        onToggleLibrary={() => setIsLibraryOpen(!isLibraryOpen)}
        onArrowColorChange={(color) => setCurrentArrowColor(color)}
        onDeleteSelected={handleDeleteSelected}
        onClearSitemap={handleClearSitemap}
        onManualSave={() => {}}
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
        remoteCursors={remoteCursors}
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
        onCanvasClick={() => { setSelectedId(null); setConnectingSource(null); }}
      />

      {isAdmin && (
        <SitemapLibraryDrawer
          isOpen={isLibraryOpen}
          onClose={() => setIsLibraryOpen(false)}
          library={library}
          onAddToCanvas={addScreenNodeFromLibrary}
          onUploadScreens={handleUploadScreensToLibrary}
          onDeleteFromLibrary={handleDeleteFromLibrary}
        />
      )}

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
            <span>•</span>
            <span className="sitemap-hints-key">Galería</span>
            <span>Arrastrar fotos</span>
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
