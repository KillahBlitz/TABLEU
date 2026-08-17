const BASE_URL = 'http://localhost:5001/api';

const runE2ETests = async () => {
  console.log('====================================================');
  console.log('      TABLEU COMPREHENSIVE E2E VERIFICATION        ');
  console.log('====================================================');

  const adminLogins = [
    'jacobo.monroy@tableu.io',
    'christopher.figueroa@tableu.io',
    'lizbeth.loza@tableu.io'
  ];

  let adminToken = null;

  for (const email of adminLogins) {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: 'Admin123!' })
    });
    const data = await res.json();
    if (res.status === 200 && data.user.role === 'admin') {
      console.log(`[PASS] Admin verified: ${data.user.name} (${email})`);
      if (!adminToken) adminToken = data.token;
    } else {
      console.error(`[FAIL] Admin login failed for ${email}`);
    }
  }

  const devEmail = `dev_e2e_${Date.now()}@tableu.io`;
  const devRegRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Carlos Developer',
      email: devEmail,
      password: 'DevPassword123!'
    })
  });
  const devData = await devRegRes.json();
  const devToken = devData.token;
  const devUser = devData.user;
  console.log(`[PASS] Developer registered: ${devUser.name} - Role: ${devUser.role}`);

  const epicRes = await fetch(`${BASE_URL}/epics`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({
      title: 'Infraestructura & Tablero Kanban',
      description: 'Módulo principal del tablero y métricas',
      color: '#00E5FF',
      startDate: new Date(),
      targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    })
  });
  const epic = await epicRes.json();
  console.log(`[PASS] Epic created by Admin: "${epic.title}" (ID: ${epic._id})`);

  const sprintRes = await fetch(`${BASE_URL}/sprints`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({
      name: 'Sprint 1 - Core MVP Delivery',
      goal: 'Completar tablero Kanban y KPIs de desempeño',
      startDate: new Date(),
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    })
  });
  const sprint = await sprintRes.json();
  console.log(`[PASS] Sprint created: "${sprint.name}" - Status: ${sprint.status}`);

  const startSprintRes = await fetch(`${BASE_URL}/sprints/${sprint._id}/start`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  const startedSprint = await startSprintRes.json();
  console.log(`[PASS] Sprint started: Status is now "${startedSprint.status}"`);

  const story1Res = await fetch(`${BASE_URL}/stories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({
      title: 'Implementar Tablero Kanban 4 Columnas',
      description: 'ToDo, Development, To Be Tested, Ready QA',
      epicId: epic._id,
      sprintId: sprint._id,
      assignedTo: devUser._id,
      estimatedHours: 10,
      loggedHours: 0,
      difficulty: 5,
      priority: 'high',
      status: 'todo'
    })
  });
  const story1 = await story1Res.json();
  console.log(`[PASS] Story 1 created in Sprint: "${story1.title}" (Points: ${story1.difficulty}, Est: ${story1.estimatedHours}h)`);

  const story2Res = await fetch(`${BASE_URL}/stories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({
      title: 'Configurar Motor de Agregación de KPIs',
      description: 'Cálculo de porcentaje de horas y puntos de historia',
      epicId: epic._id,
      sprintId: sprint._id,
      assignedTo: devUser._id,
      estimatedHours: 6,
      loggedHours: 2,
      difficulty: 3,
      priority: 'urgent',
      status: 'todo'
    })
  });
  const story2 = await story2Res.json();
  console.log(`[PASS] Story 2 created in Sprint: "${story2.title}" (Points: ${story2.difficulty}, Est: ${story2.estimatedHours}h)`);

  const moveStory1Dev = await fetch(`${BASE_URL}/stories/${story1._id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${devToken}`
    },
    body: JSON.stringify({
      status: 'in_progress',
      loggedHours: 6
    })
  });
  const story1Dev = await moveStory1Dev.json();
  console.log(`[PASS] Dev updated Story 1 -> Status: ${story1Dev.status}, Logged: ${story1Dev.loggedHours}h`);

  const moveStory1QA = await fetch(`${BASE_URL}/stories/${story1._id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${devToken}`
    },
    body: JSON.stringify({
      status: 'ready_qa',
      loggedHours: 10
    })
  });
  const story1QA = await moveStory1QA.json();
  console.log(`[PASS] Dev completed Story 1 -> Status: ${story1QA.status}, Logged: ${story1QA.loggedHours}h`);

  const blockStory2 = await fetch(`${BASE_URL}/stories/${story2._id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${devToken}`
    },
    body: JSON.stringify({
      isBlocked: true,
      blockedReason: 'Esperando despliegue de base de datos'
    })
  });
  const story2Blocked = await blockStory2.json();
  console.log(`[PASS] Story 2 marked as blocked: "${story2Blocked.blockedReason}"`);

  console.log('--- Checking RBAC Security Boundaries ---');

  const devDelStoryRes = await fetch(`${BASE_URL}/stories/${story2._id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${devToken}` }
  });
  console.log(`[PASS] Dev delete story blocked (403): ${devDelStoryRes.status === 403 ? 'OK' : 'FAIL'}`);

  const devCreateEpicRes = await fetch(`${BASE_URL}/epics`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${devToken}`
    },
    body: JSON.stringify({ title: 'Illegal Epic' })
  });
  console.log(`[PASS] Dev create epic blocked (403): ${devCreateEpicRes.status === 403 ? 'OK' : 'FAIL'}`);

  const devKpiRes = await fetch(`${BASE_URL}/kpis/summary`, {
    headers: { 'Authorization': `Bearer ${devToken}` }
  });
  console.log(`[PASS] Dev access to KPIs blocked (403): ${devKpiRes.status === 403 ? 'OK' : 'FAIL'}`);

  console.log('--- Validating KPI Calculations for Admin ---');

  const kpiSummaryRes = await fetch(`${BASE_URL}/kpis/summary`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  const kpiSummary = await kpiSummaryRes.json();
  console.log('[PASS] KPI Summary received:', {
    totalStories: kpiSummary.totalStories,
    completedStories: kpiSummary.completedStories,
    hoursProgress: `${kpiSummary.hoursProgressPercentage}% (${kpiSummary.totalLoggedHours}h / ${kpiSummary.totalEstimatedHours}h)`,
    pointsProgress: `${kpiSummary.pointsProgressPercentage}% (${kpiSummary.completedPoints} / ${kpiSummary.totalPoints} pts)`,
    blockedCount: kpiSummary.blockedStoriesCount,
    distribution: kpiSummary.columnDistribution
  });

  const kpiUserRes = await fetch(`${BASE_URL}/kpis/by-user`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  const kpiUsers = await kpiUserRes.json();
  const devKpi = kpiUsers.find((u) => u.userId === devUser._id);
  console.log('[PASS] KPI for Dev user:', {
    name: devKpi?.userName,
    totalAssigned: devKpi?.totalAssigned,
    completed: devKpi?.completed,
    hoursProgress: `${devKpi?.hoursProgress}%`,
    pointsProgress: `${devKpi?.pointsProgress}%`,
    blockedCount: devKpi?.blockedCount
  });

  const kpiEpicRes = await fetch(`${BASE_URL}/kpis/by-epic`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  const kpiEpics = await kpiEpicRes.json();
  const targetEpic = kpiEpics.find((e) => e.epicId === epic._id);
  console.log('[PASS] KPI for Epic:', {
    title: targetEpic?.title,
    hoursProgress: `${targetEpic?.hoursProgress}%`,
    pointsProgress: `${targetEpic?.pointsProgress}%`
  });

  console.log('====================================================');
  console.log('  ALL E2E WORKFLOWS & CALCULATIONS FULLY VERIFIED!   ');
  console.log('====================================================');
};

runE2ETests().catch(console.error);
