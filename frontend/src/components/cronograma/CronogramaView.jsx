import React, { useState, useEffect, useMemo, useRef } from 'react';
import { epicService } from '../../services/epicService';
import { EpicManagerModal } from '../epics/EpicManagerModal';
import { useAuth } from '../../context/AuthContext';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Layers,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  Edit2,
  CalendarRange,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import '../../styles/cronograma.css';

const parseDateValue = (val) => {
  if (!val) return null;
  if (typeof val === 'string') {
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof val === 'object' && val.$date) {
    const d = new Date(val.$date);
    return isNaN(d.getTime()) ? null : d;
  }
  if (val instanceof Date) return val;
  return null;
};

const formatDateDisplay = (date) => {
  if (!date) return '-';
  const d = parseDateValue(date);
  if (!d) return '-';
  return d.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const formatShortDate = (date) => {
  if (!date) return '';
  const d = parseDateValue(date);
  if (!d) return '';
  return d.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short'
  });
};

const startOfDay = (d) => {
  const res = new Date(d);
  res.setHours(0, 0, 0, 0);
  return res;
};

const endOfDay = (d) => {
  const res = new Date(d);
  res.setHours(23, 59, 59, 999);
  return res;
};

const addDays = (d, days) => {
  const res = new Date(d);
  res.setDate(res.getDate() + days);
  return res;
};

const isSameDay = (d1, d2) => {
  if (!d1 || !d2) return false;
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

export const CronogramaView = () => {
  const { isAdmin } = useAuth();
  const [epics, setEpics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewScale, setViewScale] = useState('month');
  const [searchQuery, setSearchQuery] = useState('');
  const [isEpicModalOpen, setIsEpicModalOpen] = useState(false);
  const [selectedEpic, setSelectedEpic] = useState(null);
  const [isUnscheduledOpen, setIsUnscheduledOpen] = useState(false);
  const gridScrollRef = useRef(null);

  const fetchEpics = async () => {
    try {
      setLoading(true);
      const data = await epicService.getEpics();
      setEpics(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEpics();
  }, []);

  const timelineRange = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    if (viewScale === 'weeks') {
      const start = startOfDay(addDays(currentDate, -14));
      const end = endOfDay(addDays(currentDate, 14));
      return { start, end };
    }

    if (viewScale === 'quarter') {
      const qStartMonth = Math.floor(month / 3) * 3;
      const start = startOfDay(new Date(year, qStartMonth, 1));
      const end = endOfDay(new Date(year, qStartMonth + 3, 0));
      return { start, end };
    }

    if (viewScale === 'year') {
      const start = startOfDay(new Date(year, 0, 1));
      const end = endOfDay(new Date(year, 11, 31));
      return { start, end };
    }

    const start = startOfDay(new Date(year, month, 1));
    const end = endOfDay(new Date(year, month + 1, 0));
    return { start, end };
  }, [currentDate, viewScale]);

  const daysList = useMemo(() => {
    const days = [];
    let cur = new Date(timelineRange.start);
    while (cur <= timelineRange.end) {
      days.push(new Date(cur));
      cur = addDays(cur, 1);
    }
    return days;
  }, [timelineRange]);

  const monthsGrouped = useMemo(() => {
    const groups = [];
    let currentMonth = null;
    let count = 0;

    daysList.forEach((day) => {
      const mKey = `${day.getFullYear()}-${day.getMonth()}`;
      if (mKey !== currentMonth) {
        if (currentMonth !== null) {
          groups.push({
            name: new Date(day.getFullYear(), day.getMonth() - 1, 1).toLocaleDateString('es-ES', {
              month: 'long',
              year: 'numeric'
            }),
            count
          });
        }
        currentMonth = mKey;
        count = 1;
      } else {
        count++;
      }
    });

    if (count > 0 && daysList.length > 0) {
      const lastDay = daysList[daysList.length - 1];
      groups.push({
        name: lastDay.toLocaleDateString('es-ES', {
          month: 'long',
          year: 'numeric'
        }),
        count
      });
    }

    return groups;
  }, [daysList]);

  const handlePrevPeriod = () => {
    if (viewScale === 'weeks') {
      setCurrentDate((prev) => addDays(prev, -14));
    } else if (viewScale === 'quarter') {
      setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 3, 1));
    } else if (viewScale === 'year') {
      setCurrentDate((prev) => new Date(prev.getFullYear() - 1, 0, 1));
    } else {
      setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    }
  };

  const handleNextPeriod = () => {
    if (viewScale === 'weeks') {
      setCurrentDate((prev) => addDays(prev, 14));
    } else if (viewScale === 'quarter') {
      setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 3, 1));
    } else if (viewScale === 'year') {
      setCurrentDate((prev) => new Date(prev.getFullYear() + 1, 0, 1));
    } else {
      setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const filteredEpics = useMemo(() => {
    return epics.filter((epic) => {
      const matchesSearch =
        epic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (epic.description && epic.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesSearch;
    });
  }, [epics, searchQuery]);

  const { scheduledEpics, unscheduledEpics } = useMemo(() => {
    const scheduled = [];
    const unscheduled = [];

    filteredEpics.forEach((epic) => {
      const start = parseDateValue(epic.startDate);
      const target = parseDateValue(epic.targetDate);
      if (start && target) {
        scheduled.push({ ...epic, parsedStart: start, parsedTarget: target });
      } else {
        unscheduled.push(epic);
      }
    });

    scheduled.sort((a, b) => a.parsedStart - b.parsedStart);

    return { scheduledEpics: scheduled, unscheduledEpics: unscheduled };
  }, [filteredEpics]);

  const totalRangeMs = timelineRange.end.getTime() - timelineRange.start.getTime();

  const getEpicPosition = (epic) => {
    const startMs = epic.parsedStart.getTime();
    const endMs = epic.parsedTarget.getTime();

    const rangeStartMs = timelineRange.start.getTime();
    const rangeEndMs = timelineRange.end.getTime();

    const clampedStartMs = Math.max(startMs, rangeStartMs);
    const clampedEndMs = Math.min(endMs, rangeEndMs);

    const leftPercent = Math.max(0, Math.min(100, ((clampedStartMs - rangeStartMs) / totalRangeMs) * 100));
    const widthPercent = Math.max(
      1.5,
      Math.min(100 - leftPercent, ((clampedEndMs - clampedStartMs + 86400000) / totalRangeMs) * 100)
    );

    const isVisible = endMs >= rangeStartMs && startMs <= rangeEndMs;

    return { leftPercent, widthPercent, isVisible };
  };

  const todayPosition = useMemo(() => {
    const today = startOfDay(new Date());
    const todayMs = today.getTime();
    const rangeStartMs = timelineRange.start.getTime();
    const rangeEndMs = timelineRange.end.getTime();

    if (todayMs >= rangeStartMs && todayMs <= rangeEndMs) {
      return ((todayMs - rangeStartMs) / totalRangeMs) * 100;
    }
    return null;
  }, [timelineRange, totalRangeMs]);

  const currentPeriodTitle = useMemo(() => {
    if (viewScale === 'weeks') {
      return `${formatShortDate(timelineRange.start)} - ${formatShortDate(timelineRange.end)}`;
    }
    if (viewScale === 'quarter') {
      const q = Math.floor(currentDate.getMonth() / 3) + 1;
      return `Q${q} ${currentDate.getFullYear()}`;
    }
    if (viewScale === 'year') {
      return `${currentDate.getFullYear()}`;
    }
    return currentDate.toLocaleDateString('es-ES', {
      month: 'long',
      year: 'numeric'
    });
  }, [currentDate, viewScale, timelineRange]);

  const stats = useMemo(() => {
    const total = epics.length;
    const scheduled = scheduledEpics.length;
    const unscheduled = unscheduledEpics.length;
    return { total, scheduled, unscheduled };
  }, [epics, scheduledEpics, unscheduledEpics]);

  return (
    <div className={`cronograma-container scale-${viewScale}`}>
      <div className="cronograma-toolbar">
        <div className="cronograma-nav-controls">
          <button className="btn-icon" onClick={handlePrevPeriod} title="Periodo anterior">
            <ChevronLeft size={18} />
          </button>
          <span className="cronograma-date-title">{currentPeriodTitle}</span>
          <button className="btn-icon" onClick={handleNextPeriod} title="Periodo siguiente">
            <ChevronRight size={18} />
          </button>
          <button className="btn btn-secondary btn-sm" onClick={handleToday}>
            Hoy
          </button>

          <div className="cronograma-scale-selector">
            <button
              className={`scale-btn ${viewScale === 'weeks' ? 'active' : ''}`}
              onClick={() => setViewScale('weeks')}
            >
              Semanas
            </button>
            <button
              className={`scale-btn ${viewScale === 'month' ? 'active' : ''}`}
              onClick={() => setViewScale('month')}
            >
              Mes
            </button>
            <button
              className={`scale-btn ${viewScale === 'quarter' ? 'active' : ''}`}
              onClick={() => setViewScale('quarter')}
            >
              Trimestre
            </button>
            <button
              className={`scale-btn ${viewScale === 'year' ? 'active' : ''}`}
              onClick={() => setViewScale('year')}
            >
              Año
            </button>
          </div>
        </div>

        <div className="cronograma-filters">
          <div className="cronograma-search">
            <Search size={14} className="cronograma-search-icon" />
            <input
              type="text"
              placeholder="Buscar épica..."
              className="cronograma-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {isAdmin && (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setIsEpicModalOpen(true)}
            >
              <Plus size={14} />
              <span>Gestionar Épicas</span>
            </button>
          )}
        </div>
      </div>

      <div className="cronograma-stats-strip">
        <div className="stat-chip">
          <Layers size={12} color="var(--text-secondary)" />
          <span>Total: <strong>{stats.total}</strong></span>
        </div>
        <div className="stat-chip">
          <span className="stat-dot" style={{ backgroundColor: 'var(--accent-todo)' }} />
          <span>Calendarizadas: <strong>{stats.scheduled}</strong></span>
        </div>
        {unscheduledEpics.length > 0 && (
          <div
            className="stat-chip"
            style={{ cursor: 'pointer', borderColor: 'rgba(255, 140, 0, 0.4)' }}
            onClick={() => setIsUnscheduledOpen(true)}
          >
            <Clock size={12} color="#FF8C00" />
            <span style={{ color: '#FF8C00' }}>Sin fechas: <strong>{stats.unscheduled}</strong></span>
          </div>
        )}
      </div>

      <div className="cronograma-workspace">
        <div className="cronograma-main-area">
          <div className="cronograma-grid-wrapper" ref={gridScrollRef}>
            <div className="cronograma-epics-sidebar">
              <div className="epics-sidebar-header">
                <span>Épica ({scheduledEpics.length})</span>
                <span>Progreso</span>
              </div>

              {scheduledEpics.length === 0 && !loading && (
                <div style={{ padding: '24px 16px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                  No hay épicas calendarizadas.
                </div>
              )}

              {scheduledEpics.map((epic) => (
                <div
                  key={epic._id}
                  className="epics-sidebar-row"
                  onClick={() => setSelectedEpic(epic)}
                >
                  <div className="epic-sidebar-info">
                    <div
                      className="epic-color-bar"
                      style={{ backgroundColor: epic.color || '#00E5FF' }}
                    />
                    <div className="epic-sidebar-text">
                      <span className="epic-sidebar-title" title={epic.title}>
                        {epic.title}
                      </span>
                      <div className="epic-sidebar-meta">
                        <span>
                          {formatShortDate(epic.startDate)} - {formatShortDate(epic.targetDate)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', minWidth: '45px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {epic.completedStories || 0}/{epic.totalStories || 0}
                    </span>
                    <div className="epic-progress-bar-container" style={{ width: '45px' }}>
                      <div
                        className="epic-progress-bar-fill"
                        style={{
                          width: `${epic.totalStories > 0 ? (epic.completedStories / epic.totalStories) * 100 : 0}%`,
                          backgroundColor: epic.color || 'var(--accent-done)'
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="cronograma-timeline-panel">
              <div className="timeline-header-container">
                <div className="timeline-header-months">
                  {monthsGrouped.map((grp, idx) => (
                    <div
                      key={idx}
                      className="timeline-month-cell"
                      style={{ flex: grp.count }}
                    >
                      {grp.name}
                    </div>
                  ))}
                </div>

                <div className="timeline-header-days">
                  {daysList.map((day, idx) => {
                    const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                    const isToday = isSameDay(day, new Date());
                    const dayName = day.toLocaleDateString('es-ES', { weekday: 'narrow' });
                    return (
                      <div
                        key={idx}
                        className={`timeline-day-cell ${isWeekend ? 'is-weekend' : ''} ${isToday ? 'is-today' : ''}`}
                      >
                        {viewScale !== 'year' && <span className="timeline-day-num">{day.getDate()}</span>}
                        {viewScale !== 'year' && <span className="timeline-day-name">{dayName}</span>}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="timeline-grid-body">
                <div className="timeline-grid-columns">
                  {daysList.map((day, idx) => {
                    const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                    return (
                      <div
                        key={idx}
                        className={`timeline-grid-col ${isWeekend ? 'is-weekend' : ''}`}
                      />
                    );
                  })}
                </div>

                {todayPosition !== null && (
                  <div
                    className="timeline-today-line"
                    style={{ left: `${todayPosition}%` }}
                  >
                    <span className="timeline-today-tag">HOY</span>
                  </div>
                )}

                {scheduledEpics.length === 0 && !loading && (
                  <div className="cronograma-empty-state">
                    <CalendarRange size={36} color="var(--text-muted)" />
                    <p>No hay épicas en el rango de fechas actual.</p>
                    {isAdmin && (
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => setIsEpicModalOpen(true)}
                      >
                        Asignar fechas a épicas
                      </button>
                    )}
                  </div>
                )}

                {scheduledEpics.map((epic) => {
                  const { leftPercent, widthPercent, isVisible } = getEpicPosition(epic);
                  if (!isVisible) {
                    return <div key={epic._id} className="timeline-row" />;
                  }

                  const color = epic.color || '#00E5FF';

                  return (
                    <div key={epic._id} className="timeline-row">
                      <div className="epic-block-track">
                        <div
                          className="epic-block"
                          onClick={() => setSelectedEpic(epic)}
                          title={`${epic.title} (${formatShortDate(epic.startDate)} - ${formatShortDate(epic.targetDate)})`}
                          style={{
                            left: `${leftPercent}%`,
                            width: `${widthPercent}%`,
                            backgroundColor: `${color}38`,
                            border: `1px solid ${color}`,
                            boxShadow: `0 0 16px ${color}44`,
                            borderLeft: `6px solid ${color}`
                          }}
                        >
                          <div className="epic-block-content">
                            <span className="epic-block-title">{epic.title}</span>
                            {widthPercent > 20 && (
                              <span className="epic-block-dates">
                                {formatShortDate(epic.startDate)} - {formatShortDate(epic.targetDate)}
                              </span>
                            )}
                          </div>

                          {widthPercent > 28 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                              <span style={{ fontSize: '0.72rem', color: '#ffffff', fontWeight: 600, textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
                                {epic.completedStories || 0}/{epic.totalStories || 0} tareas
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {unscheduledEpics.length > 0 && (
            <div className="cronograma-unscheduled-drawer">
              <div
                className="unscheduled-header"
                onClick={() => setIsUnscheduledOpen(!isUnscheduledOpen)}
              >
                <div className="unscheduled-title">
                  <Clock size={16} color="#FF8C00" />
                  <span>Épicas sin fechas configuradas ({unscheduledEpics.length})</span>
                </div>
                {isUnscheduledOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
              </div>

              {isUnscheduledOpen && (
                <div className="unscheduled-list">
                  {unscheduledEpics.map((epic) => (
                    <div
                      key={epic._id}
                      className="unscheduled-card"
                      onClick={() => {
                        if (isAdmin) {
                          setIsEpicModalOpen(true);
                        } else {
                          setSelectedEpic(epic);
                        }
                      }}
                    >
                      <div
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: epic.color || '#00E5FF'
                        }}
                      />
                      <span>{epic.title}</span>
                      {isAdmin && (
                        <span style={{ fontSize: '0.7rem', color: 'var(--accent-todo)' }}>
                          Asignar fechas
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {selectedEpic && (
        <div className="epic-detail-modal-backdrop" onClick={() => setSelectedEpic(null)}>
          <div className="epic-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="epic-detail-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '14px',
                    height: '14px',
                    borderRadius: '4px',
                    backgroundColor: selectedEpic.color || '#00E5FF'
                  }}
                />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{selectedEpic.title}</h3>
              </div>
              <button className="btn-icon" onClick={() => setSelectedEpic(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="epic-detail-body">
              {selectedEpic.description && (
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {selectedEpic.description}
                </p>
              )}

              <div className="epic-detail-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <div className="epic-detail-item">
                  <span className="epic-detail-label">Fecha de Inicio</span>
                  <span className="epic-detail-value">{formatDateDisplay(selectedEpic.startDate)}</span>
                </div>

                <div className="epic-detail-item">
                  <span className="epic-detail-label">Fecha de Fin / Objetivo</span>
                  <span className="epic-detail-value">{formatDateDisplay(selectedEpic.targetDate)}</span>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Progreso de Historias</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                    {selectedEpic.completedStories || 0} de {selectedEpic.totalStories || 0} completadas
                  </span>
                </div>
                <div className="epic-progress-bar-container">
                  <div
                    className="epic-progress-bar-fill"
                    style={{
                      width: `${selectedEpic.totalStories > 0 ? (selectedEpic.completedStories / selectedEpic.totalStories) * 100 : 0}%`,
                      backgroundColor: selectedEpic.color || 'var(--accent-done)'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
                {isAdmin && (
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      setSelectedEpic(null);
                      setIsEpicModalOpen(true);
                    }}
                  >
                    <Edit2 size={14} />
                    <span>Editar Épica</span>
                  </button>
                )}
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => setSelectedEpic(null)}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isEpicModalOpen && (
        <EpicManagerModal
          isOpen={isEpicModalOpen}
          onClose={() => setIsEpicModalOpen(false)}
          onEpicsUpdated={fetchEpics}
        />
      )}
    </div>
  );
};
