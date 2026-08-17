import React, { useState } from 'react';
import { StoryCard } from './StoryCard';

export const KanbanColumn = ({
  statusKey,
  title,
  colClass,
  stories = [],
  onCardClick,
  onDragStart,
  onDropStory,
  onMoveStatus,
  prevStatus,
  nextStatus,
  prevLabel,
  nextLabel
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const storyId = e.dataTransfer.getData('storyId') || e.dataTransfer.getData('text/plain');
    if (storyId && onDropStory) {
      onDropStory(storyId, statusKey);
    }
  };

  return (
    <div
      className={`kanban-column ${colClass} ${isDragOver ? 'drag-over' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="column-header">
        <div className="column-title-wrap">
          <div className="column-dot" />
          <span className="column-title">{title}</span>
        </div>
        <span className="column-count">{stories.length}</span>
      </div>

      <div className="column-body">
        {stories.length === 0 ? (
          <div className="empty-column-placeholder">
            <span>No hay historias aquí</span>
          </div>
        ) : (
          stories.map((story) => (
            <StoryCard
              key={story._id}
              story={story}
              onClick={() => onCardClick(story)}
              onDragStart={onDragStart}
              onMoveStatus={onMoveStatus}
              prevStatus={prevStatus}
              nextStatus={nextStatus}
              prevLabel={prevLabel}
              nextLabel={nextLabel}
            />
          ))
        )}
      </div>
    </div>
  );
};
