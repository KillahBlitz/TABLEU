import React from 'react';

export const MetricCard = ({
  title,
  value,
  subtext,
  icon: Icon,
  accentClass = '',
  progressPercentage = null,
  progressColor = 'var(--accent-todo)'
}) => {
  return (
    <div className={`metric-card ${accentClass}`}>
      <div className="metric-top">
        <span className="metric-title">{title}</span>
        {Icon && (
          <div className="metric-icon">
            <Icon size={18} />
          </div>
        )}
      </div>

      <div className="metric-value">{value}</div>

      {progressPercentage !== null && (
        <div className="progress-bar-container">
          <div
            className="progress-bar-fill"
            style={{
              width: `${Math.min(Math.max(progressPercentage, 0), 100)}%`,
              backgroundColor: progressColor
            }}
          />
        </div>
      )}

      {subtext && <div className="metric-sub">{subtext}</div>}
    </div>
  );
};
