import React from 'react';
import { Wrench, BookOpen, Flag, Bug, Sparkles } from 'lucide-react';

export const CATEGORY_CONFIG = {
  tarea: { label: 'Tarea', icon: Wrench, color: '#00E5FF' },
  historia: { label: 'Historia', icon: BookOpen, color: '#B388FF' },
  hito: { label: 'Hito', icon: Flag, color: '#00FFCC' },
  bug: { label: 'Bug', icon: Bug, color: '#FF007F' },
  mejora: { label: 'Mejora', icon: Sparkles, color: '#FFEA00' }
};

export const CATEGORY_OPTIONS = Object.entries(CATEGORY_CONFIG).map(([value, cfg]) => ({
  value,
  ...cfg
}));

export const CategoryBadge = ({ category, size = 14, showLabel = true }) => {
  const cfg = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.tarea;
  const Icon = cfg.icon;

  return (
    <span
      className="category-pill"
      style={{
        backgroundColor: `${cfg.color}18`,
        color: cfg.color,
        border: `1px solid ${cfg.color}33`
      }}
    >
      <Icon size={size - 2} />
      {showLabel && <span>{cfg.label}</span>}
    </span>
  );
};
