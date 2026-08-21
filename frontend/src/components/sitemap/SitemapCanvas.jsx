import React, { useRef, useEffect, useState, useCallback } from 'react';
import { SitemapNode } from './SitemapNode';
import { SitemapEdge, getHandleCoordinates, computeBezierPath } from './SitemapEdge';

export const SitemapCanvas = ({
  nodes,
  edges,
  pan,
  zoom,
  selectedId,
  connectingSource,
  currentArrowColor,
  isAdmin,
  onPanChange,
  onZoomChange,
  onSelectNode,
  onSelectEdge,
  onUpdateNode,
  onDeleteNode,
  onDeleteEdge,
  onStartConnection,
  onFinishConnection,
  onCancelConnection,
  onImageClick,
  onCanvasClick
}) => {
  const containerRef = useRef(null);
  const [isPanning, setIsPanning] = useState(false);
  const [activeMousePos, setActiveMousePos] = useState(null);

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const zoomDelta = e.deltaY < 0 ? 1.12 : 0.89;
    const newZoom = Math.min(Math.max(0.15, zoom * zoomDelta), 3.5);

    const newPanX = mouseX - (mouseX - pan.x) * (newZoom / zoom);
    const newPanY = mouseY - (mouseY - pan.y) * (newZoom / zoom);

    onZoomChange(newZoom);
    onPanChange({ x: Math.round(newPanX), y: Math.round(newPanY) });
  }, [pan, zoom, onPanChange, onZoomChange]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', handleWheel);
    };
  }, [handleWheel]);

  const handlePointerDown = (e) => {
    if (e.target.closest('.sitemap-node') || e.target.closest('.sitemap-edge-group') || e.target.closest('.sitemap-toolbar-floating') || e.target.closest('.sitemap-zoom-controls')) {
      return;
    }

    onCanvasClick && onCanvasClick();

    if (connectingSource) {
      onCancelConnection();
      return;
    }

    setIsPanning(true);
    const startClientX = e.clientX;
    const startClientY = e.clientY;
    const startPanX = pan.x;
    const startPanY = pan.y;

    const handlePointerMove = (moveEvent) => {
      const dx = moveEvent.clientX - startClientX;
      const dy = moveEvent.clientY - startClientY;
      onPanChange({
        x: startPanX + dx,
        y: startPanY + dy
      });
    };

    const handlePointerUp = () => {
      setIsPanning(false);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const handleGlobalPointerMove = useCallback((e) => {
    if (!connectingSource || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const canvasX = (e.clientX - rect.left - pan.x) / zoom;
    const canvasY = (e.clientY - rect.top - pan.y) / zoom;
    setActiveMousePos({ x: canvasX, y: canvasY });
  }, [connectingSource, pan, zoom]);

  const handleGlobalPointerUp = useCallback((e) => {
    if (!connectingSource) return;

    const targetNodeElement = e.target.closest('.sitemap-node');
    if (targetNodeElement) {
      const targetNodeId = nodes.find((n) => {
        const nodeHandle = e.target.closest('.sitemap-handle');
        return n.id !== connectingSource.nodeId;
      });

      const closestNode = nodes.find((n) => {
        const rect = containerRef.current.getBoundingClientRect();
        const canvasX = (e.clientX - rect.left - pan.x) / zoom;
        const canvasY = (e.clientY - rect.top - pan.y) / zoom;
        return (
          canvasX >= n.x &&
          canvasX <= n.x + (n.width || 260) &&
          canvasY >= n.y &&
          canvasY <= n.y + (n.height || 180) &&
          n.id !== connectingSource.nodeId
        );
      });

      if (closestNode) {
        onFinishConnection(closestNode.id);
        setActiveMousePos(null);
        return;
      }
    }

    onCancelConnection();
    setActiveMousePos(null);
  }, [connectingSource, nodes, pan, zoom, onFinishConnection, onCancelConnection]);

  useEffect(() => {
    if (connectingSource) {
      window.addEventListener('pointermove', handleGlobalPointerMove);
      window.addEventListener('pointerup', handleGlobalPointerUp);
      return () => {
        window.removeEventListener('pointermove', handleGlobalPointerMove);
        window.removeEventListener('pointerup', handleGlobalPointerUp);
      };
    }
  }, [connectingSource, handleGlobalPointerMove, handleGlobalPointerUp]);

  const sourceNodeForConnection = connectingSource
    ? nodes.find((n) => n.id === connectingSource.nodeId)
    : null;

  const connectionPreviewPath =
    sourceNodeForConnection && activeMousePos
      ? computeBezierPath(
          getHandleCoordinates(sourceNodeForConnection, connectingSource.handle),
          activeMousePos
        ).path
      : null;

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  return (
    <div
      ref={containerRef}
      className={`sitemap-canvas-viewport ${isPanning ? 'is-panning' : ''} ${connectingSource ? 'is-connecting' : ''}`}
      onPointerDown={handlePointerDown}
    >
      <div
        className="sitemap-grid-background"
        style={{
          backgroundSize: `${32 * zoom}px ${32 * zoom}px`,
          backgroundPosition: `${pan.x}px ${pan.y}px`
        }}
      />

      <div
        className="sitemap-transform-plane"
        style={{
          transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`
        }}
      >
        <svg className="sitemap-svg-layer">
          <defs>
            <filter id="neon-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur1" />
              <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur2" />
              <feMerge>
                <feMergeNode in="blur2" />
                <feMergeNode in="blur1" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <marker
              id="arrow-preview"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path
                d="M 0 1 L 9 5 L 0 9 z"
                fill={currentArrowColor || '#00E5FF'}
                style={{ filter: `drop-shadow(0 0 4px ${currentArrowColor || '#00E5FF'})` }}
              />
            </marker>
          </defs>

          {edges.map((edge) => (
            <SitemapEdge
              key={edge.id}
              edge={edge}
              sourceNode={nodeMap.get(edge.fromNodeId)}
              targetNode={nodeMap.get(edge.toNodeId)}
              isSelected={selectedId === edge.id}
              isAdmin={isAdmin}
              onSelect={onSelectEdge}
              onDelete={onDeleteEdge}
            />
          ))}

          {connectionPreviewPath && (
            <path
              d={connectionPreviewPath}
              fill="none"
              stroke={currentArrowColor || '#00E5FF'}
              strokeWidth="2"
              strokeDasharray="6,4"
              markerEnd="url(#arrow-preview)"
              style={{
                filter: `drop-shadow(0 0 6px ${currentArrowColor || '#00E5FF'})`
              }}
            />
          )}
        </svg>

        <div className="sitemap-nodes-layer">
          {nodes.map((node) => (
            <SitemapNode
              key={node.id}
              node={node}
              isSelected={selectedId === node.id}
              isConnectingSource={connectingSource?.nodeId === node.id}
              isAdmin={isAdmin}
              zoom={zoom}
              onSelect={onSelectNode}
              onUpdate={onUpdateNode}
              onDelete={onDeleteNode}
              onStartConnection={onStartConnection}
              onImageClick={onImageClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
