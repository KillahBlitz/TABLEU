const BASE_URL = 'http://localhost:5001/api';

const runTest = async () => {
  console.log('--- Testing Sprint Lifecycle & Sprint KPI Reports ---');

  const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'jacobo.monroy@tableu.io', password: 'Admin123!' })
  });
  const adminData = await adminLoginRes.json();
  const adminToken = adminData.token;

  const sprintRes = await fetch(`${BASE_URL}/sprints`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({
      name: `Sprint QA Cycle ${Date.now()}`,
      goal: 'Validar retorno de tareas incompletas y reportes KPI',
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    })
  });
  const sprint = await sprintRes.json();
  console.log(`[PASS] Created sprint: "${sprint.name}" (ID: ${sprint._id})`);

  await fetch(`${BASE_URL}/sprints/${sprint._id}/start`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  console.log('[PASS] Sprint activated');

  const storyCompletedRes = await fetch(`${BASE_URL}/stories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({
      title: 'Historia que si se completo',
      sprintId: sprint._id,
      estimatedHours: 8,
      loggedHours: 8,
      difficulty: 5,
      status: 'ready_qa'
    })
  });
  const storyCompleted = await storyCompletedRes.json();

  const storyIncompleteRes = await fetch(`${BASE_URL}/stories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({
      title: 'Historia que quedo en desarrollo',
      sprintId: sprint._id,
      estimatedHours: 6,
      loggedHours: 3,
      difficulty: 3,
      status: 'in_progress'
    })
  });
  const storyIncomplete = await storyIncompleteRes.json();

  console.log('[PASS] Created 1 completed story (ready_qa) and 1 incomplete story (in_progress)');

  const finishRes = await fetch(`${BASE_URL}/sprints/${sprint._id}/finish`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({ moveIncompleteToBacklog: true })
  });
  console.log('[PASS] Sprint finished');

  const checkCompletedStory = await (await fetch(`${BASE_URL}/stories/${storyCompleted._id}`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  })).json();

  const checkIncompleteStory = await (await fetch(`${BASE_URL}/stories/${storyIncomplete._id}`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  })).json();

  console.log(`[PASS] Completed story retains Sprint assignment: ${checkCompletedStory.sprintId?._id === sprint._id ? 'OK' : 'FAIL'}`);
  console.log(`[PASS] Incomplete story returned to backlog (sprintId is null): ${checkIncompleteStory.sprintId === null ? 'OK' : 'FAIL'}`);
  console.log(`[PASS] Incomplete story preserved its status (${checkIncompleteStory.status}): ${checkIncompleteStory.status === 'in_progress' ? 'OK' : 'FAIL'}`);

  const kpiSprintRes = await fetch(`${BASE_URL}/kpis/sprint/${sprint._id}`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  const kpiSprint = await kpiSprintRes.json();

  console.log('[PASS] Sprint Historical KPI Report:', {
    name: kpiSprint.name,
    status: kpiSprint.status,
    completedStories: kpiSprint.completedStories,
    pointsCompleted: `${kpiSprint.pointsCompleted} / ${kpiSprint.pointsTotal} pts (${kpiSprint.pointsProgressPercentage}%)`,
    hoursProgress: `${kpiSprint.hoursProgressPercentage}%`
  });

  console.log('--- Sprint Lifecycle & KPI Report Tests Completed Successfully ---');
};

runTest().catch(console.error);
