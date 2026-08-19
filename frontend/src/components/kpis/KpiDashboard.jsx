import React, { useState, useEffect } from 'react';
import { kpiService } from '../../services/kpiService';
import { sprintService } from '../../services/sprintService';
import { MetricCard } from './MetricCard';
import { UserPerformanceTable } from './UserPerformanceTable';
import { EpicProgressChart } from './EpicProgressChart';
import { CategoryDistributionChart } from './CategoryDistributionChart';
import { CheckCircle2, Clock, Flame, AlertOctagon, BarChart2, Calendar, Target, Flag } from 'lucide-react';

export const KpiDashboard = () => {
  const [sprints, setSprints] = useState([]);
  const [selectedSprintId, setSelectedSprintId] = useState('');
  const [sprintReport, setSprintReport] = useState(null);

  const [summary, setSummary] = useState(null);
  const [usersKpi, setUsersKpi] = useState([]);
  const [epicsKpi, setEpicsKpi] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadSprints = async () => {
    try {
      const data = await sprintService.getSprints();
      setSprints(data);
    } catch (error) {
      console.error(error);
    }
  };

  const loadKpis = async () => {
    try {
      setLoading(true);

      if (selectedSprintId) {
        const [sprintData, usersData, epicsData] = await Promise.all([
          kpiService.getBySprint(selectedSprintId),
          kpiService.getByUser({ sprintId: selectedSprintId }),
          kpiService.getByEpic({ sprintId: selectedSprintId })
        ]);

        setSprintReport(sprintData);
        setUsersKpi(usersData);
        setEpicsKpi(epicsData);
      } else {
        setSprintReport(null);
        const [summaryData, usersData, epicsData] = await Promise.all([
          kpiService.getSummary(),
          kpiService.getByUser(),
          kpiService.getByEpic()
        ]);

        setSummary(summaryData);
        setUsersKpi(usersData);
        setEpicsKpi(epicsData);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSprints();
  }, []);

  useEffect(() => {
    loadKpis();
  }, [selectedSprintId]);

  return (
    <div className="kpi-dashboard">
      <div className="kpi-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="board-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BarChart2 size={26} color="var(--accent-todo)" />
            Dashboard de KPIs & Reportes de Sprints
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', marginTop: '4px' }}>
            Métricas de avance en horas, puntos de historia y rendimiento por ciclo de entrega (Solo Administradores).
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Reporte por Sprint:
          </span>
          <select
            className="filter-select"
            value={selectedSprintId}
            onChange={(e) => setSelectedSprintId(e.target.value)}
            style={{ minWidth: '260px' }}
          >
            <option value="">Visión Global (Histórico Completo)</option>
            {sprints.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name} [{s.status === 'completed' ? 'Finalizado' : s.status === 'active' ? 'Activo' : 'Planificado'}]
              </option>
            ))}
          </select>
        </div>
      </div>

      {sprintReport && (
        <div
          style={{
            background: 'var(--bg-columns)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'rgba(0, 229, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-todo)'
                }}
              >
                <Flag size={20} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{sprintReport.name}</h2>
                {sprintReport.goal && (
                  <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                    <Target size={13} color="var(--accent-todo)" />
                    <span>{sprintReport.goal}</span>
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span
                className={`status-tag ${
                  sprintReport.status === 'active'
                    ? 'status-ready_qa'
                    : sprintReport.status === 'completed'
                    ? 'status-backlog'
                    : 'status-todo'
                }`}
              >
                {sprintReport.status === 'active'
                  ? 'Sprint Activo'
                  : sprintReport.status === 'completed'
                  ? 'Sprint Finalizado'
                  : 'Sprint Planificado'}
              </span>

              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {new Date(sprintReport.startDate).toLocaleDateString()} - {new Date(sprintReport.endDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ color: 'var(--text-secondary)', padding: '40px 0', textAlign: 'center' }}>
          Calculando métricas y KPIs en tiempo real...
        </div>
      ) : (
        <>
          <div className="kpi-grid-metrics">
            <MetricCard
              title={selectedSprintId ? "Historias Entregadas en Sprint" : "Historias Completadas"}
              value={
                selectedSprintId
                  ? `${sprintReport?.completedStories || 0} / ${sprintReport?.totalStories || 0}`
                  : `${summary?.completedStories || 0} / ${summary?.totalStories || 0}`
              }
              subtext={
                selectedSprintId
                  ? `${sprintReport?.totalStories > 0 ? Math.round(((sprintReport?.completedStories || 0) / sprintReport.totalStories) * 100) : 0}% de historias finalizadas en QA`
                  : `${summary?.totalStories > 0 ? Math.round(((summary?.completedStories || 0) / summary.totalStories) * 100) : 0}% de entrega total`
              }
              icon={CheckCircle2}
              accentClass="accent-done"
            />

            <MetricCard
              title="Avance por Horas"
              value={`${selectedSprintId ? sprintReport?.hoursProgressPercentage || 0 : summary?.hoursProgressPercentage || 0}%`}
              subtext={
                selectedSprintId
                  ? `${sprintReport?.hoursLogged || 0}h invertidas de ${sprintReport?.hoursEstimated || 0}h estimadas`
                  : `${summary?.totalLoggedHours || 0}h registradas de ${summary?.totalEstimatedHours || 0}h estimadas`
              }
              icon={Clock}
              accentClass="accent-progress"
              progressPercentage={selectedSprintId ? sprintReport?.hoursProgressPercentage || 0 : summary?.hoursProgressPercentage || 0}
              progressColor="var(--accent-in-progress)"
            />

            <MetricCard
              title="Avance por Dificultad (Story Points)"
              value={`${selectedSprintId ? sprintReport?.pointsProgressPercentage || 0 : summary?.pointsProgressPercentage || 0}%`}
              subtext={
                selectedSprintId
                  ? `${sprintReport?.pointsCompleted || 0} pts entregados de ${sprintReport?.pointsTotal || 0} pts planeados`
                  : `${summary?.completedPoints || 0} pts entregados de ${summary?.totalPoints || 0} pts`
              }
              icon={Flame}
              accentClass="accent-purple"
              progressPercentage={selectedSprintId ? sprintReport?.pointsProgressPercentage || 0 : summary?.pointsProgressPercentage || 0}
              progressColor="var(--accent-purple)"
            />

            <MetricCard
              title="Tareas Bloqueadas"
              value={`${selectedSprintId ? sprintReport?.blockedCount || 0 : summary?.blockedStoriesCount || 0}`}
              subtext={
                (selectedSprintId ? sprintReport?.blockedCount : summary?.blockedStoriesCount) > 0
                  ? 'Impedimentos reportados'
                  : 'Flujo sin bloqueos'
              }
              icon={AlertOctagon}
              accentClass="accent-blocked"
            />
          </div>

          <UserPerformanceTable usersKpi={usersKpi} onUserDeleted={loadKpis} />

          <CategoryDistributionChart usersKpi={usersKpi} />

          <EpicProgressChart epicsKpi={epicsKpi} />
        </>
      )}
    </div>
  );
};
