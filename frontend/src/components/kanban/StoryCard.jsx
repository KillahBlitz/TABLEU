import React from 'react';
import { AlertOctagon, Clock, Layers, Flame, ChevronLeft, ChevronRight } from 'lucide-react';

export const StoryCard = ({
  story,
  onClick,
  onDragStart,
  onMoveStatus,
  prevStatus,
  nextStatus,
  prevLabel,
  nextLabel
}) => {
  const assigneeInitials = story.assignedTo?.name
    ? story.assignedTo.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : null;

  const handleDragStart = (e) => {
    e.stopPropagation();
    e.dataTransfer.setData('text/plain', story._id);
    e.dataTransfer.setData('storyId', story._id);
    e.dataTransfer.effectAllowed = 'move';
    if (onDragStart) onDragStart(e, story);
  };

  return (
    <div
      className={`story-card ${story.isBlocked ? 'blocked' : ''}`}
      draggable
      onDragStart={handleDragStart}
      onClick={onClick}
    >
      <div className="story-card-top">
        {story.epicId ? (
          <span
            className="epic-pill"
            style={{
              backgroundColor: `${story.epicId.color || '#00E5FF'}22`,
              color: story.epicId.color || '#00E5FF',
              border: `1px solid ${story.epicId.color || '#00E5FF'}44`
            }}
          >
            <Layers size={10} />
            {story.epicId.title}
          </span>
        ) : (
          <div />
        )}

        <span className={`priority-pill priority-${story.priority || 'medium'}`}>
          {story.priority || 'medium'}
        </span>
      </div>

      <div className="story-card-title">{story.title}</div>

      {story.description && (
        <div className="story-card-desc">{story.description}</div>
      )}

      {story.isBlocked && (
        <div className="story-blocked-banner">
          <AlertOctagon size={14} />
          <span>{story.blockedReason || 'Bloqueo reportado'}</span>
        </div>
      )}

      <div className="story-card-footer">
        <div className="story-metrics">
          <span className="diff-badge" title="Story points (Dificultad)">
            <Flame size={12} color="var(--accent-in-progress)" />
            {story.difficulty || 1}pt
          </span>

          <span className="hours-badge" title="Horas invertidas / estimadas">
            <Clock size={12} />
            {story.loggedHours || 0}h / {story.estimatedHours || 0}h
          </span>
        </div>

        <div className="story-assignee">
          {story.assignedTo ? (
            <div
              className="assignee-avatar"
              style={{ backgroundColor: story.assignedTo.avatarColor || '#00E5FF' }}
              title={`Asignado a: ${story.assignedTo.name}`}
            >
              {assigneeInitials}
            </div>
          ) : (
            <span className="unassigned-badge">Sin asignar</span>
          )}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: '6px',
          borderTop: '1px solid rgba(255, 255, 255, 0.04)',
          marginTop: '2px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {prevStatus ? (
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            style={{ padding: '2px 6px', fontSize: '0.7rem' }}
            onClick={() => onMoveStatus && onMoveStatus(story._id, prevStatus)}
            title={`Mover a ${prevLabel}`}
          >
            <ChevronLeft size={12} />
            <span>{prevLabel}</span>
          </button>
        ) : (
          <div />
        )}

        {nextStatus ? (
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            style={{ padding: '2px 6px', fontSize: '0.7rem', marginLeft: 'auto' }}
            onClick={() => onMoveStatus && onMoveStatus(story._id, nextStatus)}
            title={`Mover a ${nextLabel}`}
          >
            <span>{nextLabel}</span>
            <ChevronRight size={12} />
          </button>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
};
