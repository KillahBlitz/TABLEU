import React, { useState, useEffect, useCallback } from 'react';
import { attendanceService } from '../../services/attendanceService';
import { sprintService } from '../../services/sprintService';
import { RoleBadge, JobRoleBadge } from '../common/RoleBadge';
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
  Check,
  Clock,
  Target,
  Flame,
  Award,
  Filter,
  CheckCheck
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

  const [coveredData, setCoveredData] = useState({ summary: {}, users: [] });
  const [coveredLoading, setCoveredLoading] = useState(false);
  const [sprints, setSprints] = useState([]);
  const [selectedSprint, setSelectedSprint] = useState('');
  const [editingRequiredHours, setEditingRequiredHours] = useState({});
  const [savingHoursId, setSavingHoursId] = useState(null);
  const [savedHoursId, setSavedHoursId] = useState(null);

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

  const fetchCoveredHours = useCallback(async () => {
    setCoveredLoading(true);
    try {
      const params = {};
      if (selectedSprint) params.sprintId = selectedSprint;
      const data = await attendanceService.getCoveredHours(params);
      setCoveredData(data);

      const initialHours = {};
      (data.users || []).forEach((u) => {
        initialHours[u.userId] = u.requiredHours;
      });
      setEditingRequiredHours(initialHours);
    } catch (error) {
      console.error(error);
    } finally {
      setCoveredLoading(false);
    }
  }, [selectedSprint]);

  const loadSprints = async () => {
    try {
      const data = await sprintService.getSprints();
      setSprints(data || []);
    } catch {
      setSprints([]);
    }
  };

  useEffect(() => {
    loadSprints();
  }, []);

  useEffect(() => {
    if (viewMode === 'summary') {
      fetchSummary();
    } else if (viewMode === 'covered_hours') {
      fetchCoveredHours();
    }
  }, [viewMode, fetchSummary, fetchCoveredHours]);

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

  const handleHoursInputChange = (userId, val) => {
    const num = Math.max(0, Number(val) || 0);
    setEditingRequiredHours((prev) => ({
      ...prev,
      [userId]: num
    }));
  };

  const handleSaveUserHours = async (userId) => {
    const val = editingRequiredHours[userId];
    if (val === undefined) return;

    setSavingHoursId(userId);
    try {
      await attendanceService.updateRequiredHours(userId, val);
      setSavedHoursId(userId);
      setTimeout(() => setSavedHoursId(null), 2000);
      await fetchCoveredHours();
    } catch (error) {
      alert(error.message || 'Error al actualizar las horas requeridas');
    } finally {
      setSavingHoursId(null);
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

  const summary = coveredData.summary || {};
  const usersCovered = coveredData.users || [];

  return (
    <div className="attendance-dashboard">
      <div className="attendance-header">
        <div className="attendance-header-left">
          <h2>
            <ClipboardCheck size={22} style={{ color: 'var(--accent-todo)' }} />
            Control de Asistencias & Horas
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
            <button
              className={`toggle-btn ${viewMode === 'covered_hours' ? 'active' : ''}`}
              onClick={() => setViewMode('covered_hours')}
            >
              <Clock size={14} style={{ marginRight: '6px' }} />
              Horas Cubiertas
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
                    <th>Rol Sistema</th>
                    <th>Rol Asignado</th>
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
                          <JobRoleBadge jobRole={record.jobRole} />
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
                  <th>Rol Sistema</th>
                  <th>Rol Asignado</th>
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
                    <td>
                      <JobRoleBadge jobRole={user.jobRole} />
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

      {viewMode === 'covered_hours' && (
        <div className="covered-hours-section">
          <div className="covered-hours-header">
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={20} color="var(--accent-todo)" />
                Cumplimiento de Horas Cubiertas por Historias
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Contabiliza las horas registradas/invertidas en las historias asignadas frente a las horas requeridas por usuario.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Filter size={14} color="var(--text-secondary)" />
              <select
                className="filter-select"
                value={selectedSprint}
                onChange={(e) => setSelectedSprint(e.target.value)}
                style={{ minWidth: '180px' }}
              >
                <option value="">Todas las Historias (Global)</option>
                {sprints.map((sp) => (
                  <option key={sp._id} value={sp._id}>
                    {sp.name} ({sp.status})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="covered-summary-metrics-grid">
            <div className="covered-metric-card accent-todo">
              <div className="covered-metric-top">
                <span className="covered-metric-title">Horas Requeridas Totales</span>
                <div className="covered-metric-icon todo">
                  <Target size={18} />
                </div>
              </div>
              <div className="covered-metric-value">{summary.totalRequired || 0}h</div>
              <div className="covered-metric-sub">Meta global del equipo</div>
            </div>

            <div className="covered-metric-card accent-done">
              <div className="covered-metric-top">
                <span className="covered-metric-title">Horas Cubiertas (Historias)</span>
                <div className="covered-metric-icon done">
                  <Clock size={18} />
                </div>
              </div>
              <div className="covered-metric-value">{summary.totalCovered || 0}h</div>
              <div className="covered-metric-sub">Invertidas en historias</div>
            </div>

            <div className="covered-metric-card accent-progress">
              <div className="covered-metric-top">
                <span className="covered-metric-title">Cobertura Global</span>
                <div className="covered-metric-icon progress">
                  <TrendingUp size={18} />
                </div>
              </div>
              <div className="covered-metric-value">{summary.globalCoveragePercentage || 0}%</div>
              <div className="progress-bar-container" style={{ marginTop: '6px', height: '6px' }}>
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${Math.min(summary.globalCoveragePercentage || 0, 100)}%`,
                    backgroundColor: (summary.globalCoveragePercentage || 0) >= 100 ? 'var(--accent-done)' : 'var(--accent-todo)'
                  }}
                />
              </div>
            </div>

            <div className="covered-metric-card accent-purple">
              <div className="covered-metric-top">
                <span className="covered-metric-title">Metas Cumplidas</span>
                <div className="covered-metric-icon purple">
                  <Award size={18} />
                </div>
              </div>
              <div className="covered-metric-value">
                {summary.usersGoalMetCount || 0} / {summary.totalUsers || 0}
              </div>
              <div className="covered-metric-sub">Desarrolladores al 100%+</div>
            </div>
          </div>

          <div className="attendance-table-section" style={{ marginTop: '20px' }}>
            <div className="attendance-table-header">
              <h3>
                <Users size={18} color="var(--accent-todo)" />
                Detalle de Horas por Desarrollador
              </h3>
            </div>

            {coveredLoading ? (
              <div className="loading-state">
                <div className="spinner" />
                Calculando horas cubiertas...
              </div>
            ) : usersCovered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                No hay desarrolladores registrados.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="attendance-table">
                  <thead>
                    <tr>
                      <th>Miembro</th>
                      <th>Rol Asignado</th>
                      <th>Historias</th>
                      <th>Horas Requeridas (Meta)</th>
                      <th>Horas Cubiertas</th>
                      <th>Avance / Cobertura</th>
                      <th>Balance</th>
                      <th>Estado</th>
                      <th>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersCovered.map((user) => {
                      const currentRequired = editingRequiredHours[user.userId] !== undefined
                        ? editingRequiredHours[user.userId]
                        : user.requiredHours;

                      const isSavingThis = savingHoursId === user.userId;
                      const isSavedThis = savedHoursId === user.userId;
                      const hasChangedHours = currentRequired !== user.requiredHours;

                      const pct = user.coveredPercentage || 0;
                      let pctColor = 'var(--accent-blocked)';
                      if (pct >= 100) pctColor = 'var(--accent-done)';
                      else if (pct >= 70) pctColor = 'var(--accent-todo)';
                      else if (pct >= 40) pctColor = 'var(--accent-in-progress)';

                      return (
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
                            <JobRoleBadge jobRole={user.jobRole} />
                          </td>

                          <td>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>
                              <span style={{ fontWeight: 700, color: user.completedStoriesCount > 0 ? 'var(--accent-done)' : 'var(--text-primary)' }}>
                                {user.completedStoriesCount}
                              </span>
                              <span style={{ color: 'var(--text-muted)' }}> / {user.totalStories}</span>
                            </div>
                          </td>

                          <td style={{ minWidth: '140px' }}>
                            <div className="required-hours-edit-cell">
                              <input
                                type="number"
                                min="0"
                                step="1"
                                className="required-hours-input"
                                value={currentRequired}
                                onChange={(e) => handleHoursInputChange(user.userId, e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveUserHours(user.userId);
                                }}
                              />
                              <span className="hours-unit-label">h</span>
                            </div>
                          </td>

                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '0.94rem', color: '#FFFFFF' }}>
                                {user.loggedHours}h
                              </span>
                              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                Estimadas: {user.estimatedHours}h
                              </span>
                            </div>
                          </td>

                          <td style={{ minWidth: '180px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px', fontFamily: 'var(--font-mono)' }}>
                              <span>{user.loggedHours}h / {user.requiredHours}h</span>
                              <span style={{ color: pctColor, fontWeight: 800 }}>{pct}%</span>
                            </div>
                            <div className="progress-bar-container">
                              <div
                                className="progress-bar-fill"
                                style={{
                                  width: `${Math.min(pct, 100)}%`,
                                  backgroundColor: pctColor
                                }}
                              />
                            </div>
                          </td>

                          <td>
                            {user.isGoalMet ? (
                              <span
                                className="balance-pill surplus"
                                title="Horas cubiertas por encima de la meta"
                              >
                                +{user.excessHours}h
                              </span>
                            ) : (
                              <span
                                className="balance-pill remaining"
                                title="Horas faltantes para cumplir la meta"
                              >
                                -{user.remainingHours}h
                              </span>
                            )}
                          </td>

                          <td>
                            {user.isGoalMet ? (
                              <span className="coverage-status-badge met">
                                <CheckCheck size={12} />
                                Meta Cumplida
                              </span>
                            ) : pct > 0 ? (
                              <span className="coverage-status-badge progress">
                                <Clock size={12} />
                                En Progreso
                              </span>
                            ) : (
                              <span className="coverage-status-badge pending">
                                <Clock size={12} />
                                Sin Avance
                              </span>
                            )}
                          </td>

                          <td>
                            <button
                              type="button"
                              className={`btn btn-sm ${hasChangedHours ? 'btn-primary' : 'btn-secondary'}`}
                              style={{ padding: '4px 8px', fontSize: '0.74rem' }}
                              onClick={() => handleSaveUserHours(user.userId)}
                              disabled={isSavingThis}
                              title="Guardar horas requeridas"
                            >
                              {isSavingThis ? (
                                <Loader2 size={12} className="spin-animation" />
                              ) : isSavedThis ? (
                                <Check size={12} color="var(--accent-done)" />
                              ) : (
                                <Save size={12} />
                              )}
                              <span>{isSavedThis ? 'Listo' : 'Guardar'}</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
