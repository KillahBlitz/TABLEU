import React from 'react';
import { Trash2 } from 'lucide-react';

export const getHandleCoordinates = (node, handle = 'auto', otherNode = null) => {
  if (!node) return { x: 0, y: 0 };
  const w = node.width || 260;
  const h = node.height || 180;
  const cx = node.x + w / 2;
  const cy = node.y + h / 2;

  if (handle === 'top') return { x: cx, y: node.y - 12 };
  if (handle === 'bottom') return { x: cx, y: node.y + h + 12 };
  if (handle === 'left') return { x: node.x - 12, y: cy };
  if (handle === 'right') return { x: node.x + w + 12, y: cy };

  if (otherNode) {
    const ocx = otherNode.x + (otherNode.width || 260) / 2;
    const ocy = otherNode.y + (otherNode.height || 180) / 2;
    const dx = ocx - cx;
    const dy = ocy - cy;

    if (Math.abs(dx) >= Math.abs(dy)) {
      return dx >= 0 ? { x: node.x + w + 12, y: cy } : { x: node.x - 12, y: cy };
    } else {
      return dy >= 0 ? { x: cx, y: node.y + h + 12 } : { x: cx, y: node.y - 12 };
    }
  }

  return { x: node.x + w + 12, y: cy };
};

export const computeBezierPath = (sourcePos, targetPos) => {
  const dx = targetPos.x - sourcePos.x;
  const dy = targetPos.y - sourcePos.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const curvature = Math.max(35, Math.min(dist * 0.35, 140));

  let cx1 = sourcePos.x;
  let cy1 = sourcePos.y;
  let cx2 = targetPos.x;
  let cy2 = targetPos.y;

  if (Math.abs(dx) >= Math.abs(dy)) {
    const sign = dx >= 0 ? 1 : -1;
    cx1 = sourcePos.x + curvature * sign;
    cx2 = targetPos.x - curvature * sign;
  } else {
    const sign = dy >= 0 ? 1 : -1;
    cy1 = sourcePos.y + curvature * sign;
    cy2 = targetPos.y - curvature * sign;
  }

  const midX = (sourcePos.x + targetPos.x) / 2;
  const midY = (sourcePos.y + targetPos.y) / 2;

  const path = `M ${sourcePos.x} ${sourcePos.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${targetPos.x} ${targetPos.y}`;

  return { path, midX, midY };
};

export const getMarkerId = (color = '#00E5FF') => {
  return `arrow-marker-${color.replace('#', '')}`;
};

export const SitemapEdge = ({
  edge,
  sourceNode,
  targetNode,
  isSelected,
  isAdmin,
  onSelect,
  onDelete
}) => {
  if (!sourceNode || !targetNode) return null;

  const sourcePos = getHandleCoordinates(sourceNode, edge.fromHandle, targetNode);
  const targetPos = getHandleCoordinates(targetNode, edge.toHandle, sourceNode);
  const { path, midX, midY } = computeBezierPath(sourcePos, targetPos);

  const neonColor = edge.color || '#00E5FF';
  const markerId = getMarkerId(neonColor);

  return (
    <g
      className={`sitemap-edge-group ${isSelected ? 'is-selected' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        onSelect && onSelect(edge.id);
      }}
      style={{ '--edge-glow-color': neonColor }}
    >
      <path
        d={path}
        className="sitemap-edge-hitbox"
      />

      <path
        d={path}
        className="sitemap-edge-path"
        stroke={neonColor}
        strokeWidth="1.8"
        markerEnd={`url(#${markerId})`}
        style={{
          filter: `drop-shadow(0 0 3px ${neonColor}) drop-shadow(0 0 6px ${neonColor}99)`
        }}
      />

      {isAdmin && isSelected && (
        <g
          className="sitemap-edge-delete-btn"
          transform={`translate(${midX}, ${midY})`}
          onClick={(e) => {
            e.stopPropagation();
            onDelete && onDelete(edge.id);
          }}
        >
          <circle r="12" fill="#181824" stroke="var(--accent-blocked)" strokeWidth="1.5" />
          <g transform="translate(-6, -6)">
            <Trash2 size={12} color="var(--accent-blocked)" />
          </g>
        </g>
      )}
    </g>
  );
};
