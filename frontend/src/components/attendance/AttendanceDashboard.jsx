import React, { useState, useEffect, useCallback } from 'react';
import { attendanceService } from '../../services/attendanceService';
import { RoleBadge } from '../common/RoleBadge';
import {
  ClipboardCheck,
  ChevronLeft,
  ChevronRight,
  Save,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Users,
  CalendarDays,
  TrendingUp,
  Loader2,
  Check
} from 'lucide-react';
import '../../styles/attendance.css';

const formatDateISO = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatDateDisplay = (dateStr) => {
  const [year, month, day] = dateStr.split('-');
  const d = new Date(Number(year), Number(month) - 1, Number(day));
  return d.toLocaleDateString('es-MX', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const getWeekRange = (dateStr) => {
  const d = new Date(dateStr + 'T12:00:00');
  const day = d.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diffToMonday);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return {
    start: formatDateISO(monday),
    end: formatDateISO(sunday)
  };
};

export const AttendanceDashboard = () => {
  const [selectedDate, setSelectedDate] = useState(formatDateISO(new Date()));
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [localChanges, setLocalChanges] = useState({});
  const [viewMode, setViewMode] = useState('daily');
  const [summaryData, setSummaryData] = useState([]);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryRange, setSummaryRange] = useState(() => getWeekRange(formatDateISO(new Date())));

  const fetchAttendance = useCallback(async () => {
    setLoading(true);
    try {
      const data = await attendanceService.getByDate(selectedDate);
      setRecords(data);
      setLocalChanges({});
      setSaved(false);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  const fetchSummary = useCallback(async () => {
    setSummaryLoading(true);
    try {
      const data = await attendanceService.getSummary(summaryRange.start, summaryRange.end);
      setSummaryData(data);
    } catch (error) {
      console.error(error);
    } finally {
      setSummaryLoading(false);
    }
  }, [summaryRange]);

  useEffect(() => {
    if (viewMode === 'summary') {
      fetchSummary();
    }
  }, [viewMode, fetchSummary]);

  const handleDateChange = (offset) => {
    const current = new Date(selectedDate + 'T12:00:00');
    current.setDate(current.getDate() + offset);
    setSelectedDate(formatDateISO(current));
  };

  const handleStatusChange = (userId, status) => {
    setLocalChanges((prev) => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        status,
        userId,
        date: selectedDate
      }
    }));
    setSaved(false);
  };

  const handleNoteChange = (userId, note) => {
    setLocalChanges((prev) => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        note,
        userId,
        date: selectedDate
      }
    }));
    setSaved(false);
  };

  const getEffectiveStatus = (record) => {
    if (localChanges[record.userId]?.status !== undefined) {
      return localChanges[record.userId].status;
    }
    return record.status;
  };

  const getEffectiveNote = (record) => {
    if (localChanges[record.userId]?.note !== undefined) {
      return localChanges[record.userId].note;
    }
    return record.note;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const bulkRecords = records.map((r) => ({
        userId: r.userId,
        date: selectedDate,
        status: getEffectiveStatus(r),
        note: getEffectiveNote(r)
      }));

      await attendanceService.bulkMark(bulkRecords);
      setSaved(true);
      setLocalChanges({});
      await fetchAttendance();
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const presentCount = records.filter(
    (r) => getEffectiveStatus(r) === 'present'
  ).length;
  const absentCount = records.filter(
    (r) => getEffectiveStatus(r) === 'absent'
  ).length;
  const unregisteredCount = records.filter(
    (r) => getEffectiveStatus(r) === 'unregistered'
  ).length;

  const hasChanges = Object.keys(localChanges).length > 0;

  const getInitials = (name) =>
    name
      ? name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2)
      : 'U';

  return (
    <div className="attendance-dashboard">
      <div className="attendance-header">
        <div className="attendance-header-left">
          <h2>
            <ClipboardCheck size={22} style={{ color: 'var(--accent-todo)' }} />
            Control de Asistencias
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="attendance-view-toggle">
            <button
              className={`toggle-btn ${viewMode === 'daily' ? 'active' : ''}`}
              onClick={() => setViewMode('daily')}
            >
              <CalendarDays size={14} style={{ marginRight: '6px' }} />
              Diario
            </button>
            <button
              className={`toggle-btn ${viewMode === 'summary' ? 'active' : ''}`}
              onClick={() => setViewMode('summary')}
            >
              <TrendingUp size={14} style={{ marginRight: '6px' }} />
              Resumen
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'daily' && (
        <>
          <div className="attendance-date-nav">
            <button onClick={() => handleDateChange(-1)} title="Día anterior">
              <ChevronLeft size={18} />
            </button>
            <input
              type="date"
              className="attendance-date-input"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
            <button onClick={() => handleDateChange(1)} title="Día siguiente">
              <ChevronRight size={18} />
            </button>
          </div>

          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'capitalize' }}>
            {formatDateDisplay(selectedDate)}
          </div>

          <div className="attendance-summary-grid">
            <div className="attendance-summary-card present">
              <div className="summary-icon-box present">
                <CheckCircle2 size={20} />
              </div>
              <div className="summary-info">
                <h4>{presentCount}</h4>
                <span>Presentes</span>
              </div>
            </div>
            <div className="attendance-summary-card absent">
              <div className="summary-icon-box absent">
                <XCircle size={20} />
              </div>
              <div className="summary-info">
                <h4>{absentCount}</h4>
                <span>Ausentes</span>
              </div>
            </div>
            <div className="attendance-summary-card unregistered">
              <div className="summary-icon-box unregistered">
                <HelpCircle size={20} />
              </div>
              <div className="summary-info">
                <h4>{unregisteredCount}</h4>
                <span>Sin Registrar</span>
              </div>
            </div>
          </div>

          <div className="attendance-table-section">
            <div className="attendance-table-header">
              <h3>
                <Users size={18} style={{ color: 'var(--accent-todo)' }} />
                Miembros del Equipo
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {saved && (
                  <div className="save-indicator">
                    <Check size={16} />
                    Guardado
                  </div>
                )}
                <button
                  className="btn btn-primary"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <Loader2 size={16} className="spinner" />
                  ) : (
                    <Save size={16} />
                  )}
                  {saving ? 'Guardando...' : 'Guardar Todo'}
                </button>
              </div>
            </div>

            {loading ? (
              <div className="loading-state">
                <div className="spinner" />
                Cargando asistencias...
              </div>
            ) : (
              <table className="attendance-table">
                <thead>
                  <tr>
                    <th>Miembro</th>
                    <th>Rol</th>
                    <th>Estado</th>
                    <th>Nota</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record) => {
                    const status = getEffectiveStatus(record);
                    const note = getEffectiveNote(record);

                    return (
                      <tr key={record.userId}>
                        <td>
                          <div className="attendance-user-cell">
                            <div
                              className="attendance-avatar"
                              style={{ backgroundColor: record.avatarColor || '#00E5FF' }}
                            >
                              {getInitials(record.userName)}
                            </div>
                            <div className="attendance-user-info">
                              <span className="attendance-user-name">{record.userName}</span>
                              <span className="attendance-user-email">{record.email}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <RoleBadge role={record.role} />
                        </td>
                        <td>
                          <div className="status-selector">
                            <button
                              className={`status-btn ${status === 'present' ? 'active-present' : ''}`}
                              onClick={() => handleStatusChange(record.userId, 'present')}
                            >
                              Asistencia
                            </button>
                            <button
                              className={`status-btn ${status === 'absent' ? 'active-absent' : ''}`}
                              onClick={() => handleStatusChange(record.userId, 'absent')}
                            >
                              Falta
                            </button>
                            <button
                              className={`status-btn ${status === 'unregistered' ? 'active-unregistered' : ''}`}
                              onClick={() => handleStatusChange(record.userId, 'unregistered')}
                            >
                              Sin Registro
                            </button>
                          </div>
                        </td>
                        <td>
                          <input
                            type="text"
                            className="attendance-note-input"
                            placeholder="Agregar nota..."
                            value={note}
                            onChange={(e) => handleNoteChange(record.userId, e.target.value)}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            {!loading && records.length > 0 && (
              <div className="attendance-actions-bar">
                {hasChanges && (
                  <span style={{ fontSize: '0.8rem', color: 'var(--accent-in-progress)' }}>
                    Cambios sin guardar
                  </span>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {viewMode === 'summary' && (
        <div className="summary-table-section">
          <h3>
            <TrendingUp size={18} style={{ color: 'var(--accent-todo)' }} />
            Resumen de Asistencias
          </h3>

          <div className="summary-range-selector">
            <label>Desde:</label>
            <input
              type="date"
              value={summaryRange.start}
              onChange={(e) =>
                setSummaryRange((prev) => ({ ...prev, start: e.target.value }))
              }
            />
            <label>Hasta:</label>
            <input
              type="date"
              value={summaryRange.end}
              onChange={(e) =>
                setSummaryRange((prev) => ({ ...prev, end: e.target.value }))
              }
            />
            <button className="btn btn-secondary btn-sm" onClick={fetchSummary}>
              Actualizar
            </button>
          </div>

          {summaryLoading ? (
            <div className="loading-state">
              <div className="spinner" />
              Calculando resumen...
            </div>
          ) : (
            <table className="attendance-table">
              <thead>
                <tr>
                  <th>Miembro</th>
                  <th>Rol</th>
                  <th>Presentes</th>
                  <th>Ausentes</th>
                  <th>Sin Registro</th>
                  <th>Tasa de Asistencia</th>
                </tr>
              </thead>
              <tbody>
                {summaryData.map((user) => (
                  <tr key={user.userId}>
                    <td>
                      <div className="attendance-user-cell">
                        <div
                          className="attendance-avatar"
                          style={{ backgroundColor: user.avatarColor || '#00E5FF' }}
                        >
                          {getInitials(user.userName)}
                        </div>
                        <div className="attendance-user-info">
                          <span className="attendance-user-name">{user.userName}</span>
                          <span className="attendance-user-email">{user.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <RoleBadge role={user.role} />
                    </td>
                    <td style={{ color: 'var(--accent-done)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                      {user.presentCount}
                    </td>
                    <td style={{ color: 'var(--accent-blocked)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                      {user.absentCount}
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                      {user.unregisteredCount}
                    </td>
                    <td>
                      <div className="rate-cell">
                        <span className="rate-value">{user.attendanceRate}%</span>
                        <div className="attendance-rate-bar">
                          <div
                            className="attendance-rate-fill"
                            style={{ width: `${Math.min(user.attendanceRate, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};
