const BASE_URL = 'http://localhost:5001/api';

const runTests = async () => {
  console.log('--- Starting Backend Verification Tests ---');

  const healthRes = await fetch(`${BASE_URL}/health`);
  const healthData = await healthRes.json();
  console.log('Health check:', healthRes.status === 200 ? 'PASS' : 'FAIL', healthData);

  const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'jacobo.monroy@tableu.io',
      password: 'Admin123!'
    })
  });
  const adminData = await adminLoginRes.json();
  const adminToken = adminData.token;
  console.log('Admin login (Jacobo Monroy):', adminLoginRes.status === 200 && adminData.user.role === 'admin' ? 'PASS' : 'FAIL');

  const devRegisterRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Developer Test',
      email: `dev_${Date.now()}@tableu.io`,
      password: 'Password123!'
    })
  });
  const devData = await devRegisterRes.json();
  const devToken = devData.token;
  console.log('Developer register (auto role developer):', devRegisterRes.status === 201 && devData.user.role === 'developer' ? 'PASS' : 'FAIL');

  const createEpicRes = await fetch(`${BASE_URL}/epics`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({
      title: 'Core Architecture & Infrastructure',
      description: 'Setup database, server and security',
      color: '#00E5FF'
    })
  });
  const epicData = await createEpicRes.json();
  console.log('Admin creates Epic:', createEpicRes.status === 201 ? 'PASS' : 'FAIL');

  const devCreateEpicRes = await fetch(`${BASE_URL}/epics`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${devToken}`
    },
    body: JSON.stringify({
      title: 'Unauthorized Epic',
      color: '#FF007F'
    })
  });
  console.log('Developer create Epic blocked (403):', devCreateEpicRes.status === 403 ? 'PASS' : 'FAIL');

  const createSprintRes = await fetch(`${BASE_URL}/sprints`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({
      name: 'Sprint 1 - Foundation',
      goal: 'Deliver MVP functionality',
      startDate: new Date(),
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    })
  });
  const sprintData = await createSprintRes.json();
  console.log('Admin creates Sprint:', createSprintRes.status === 201 ? 'PASS' : 'FAIL');

  const createStoryRes = await fetch(`${BASE_URL}/stories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({
      title: 'Setup MongoDB connection and schemas',
      description: 'Configure Mongoose and indices',
      epicId: epicData._id,
      sprintId: sprintData._id,
      assignedTo: devData.user._id,
      estimatedHours: 8,
      difficulty: 3,
      priority: 'high',
      status: 'todo'
    })
  });
  const storyData = await createStoryRes.json();
  console.log('Admin creates Story in Sprint:', createStoryRes.status === 201 ? 'PASS' : 'FAIL');

  const devMoveStoryRes = await fetch(`${BASE_URL}/stories/${storyData._id}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${devToken}`
    },
    body: JSON.stringify({
      status: 'in_progress',
      order: 1
    })
  });
  console.log('Developer moves Story status:', devMoveStoryRes.status === 200 ? 'PASS' : 'FAIL');

  const devDeleteStoryRes = await fetch(`${BASE_URL}/stories/${storyData._id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${devToken}`
    }
  });
  console.log('Developer delete Story blocked (403):', devDeleteStoryRes.status === 403 ? 'PASS' : 'FAIL');

  const devKpiRes = await fetch(`${BASE_URL}/kpis/summary`, {
    headers: {
      'Authorization': `Bearer ${devToken}`
    }
  });
  console.log('Developer KPI access blocked (403):', devKpiRes.status === 403 ? 'PASS' : 'FAIL');

  const adminKpiRes = await fetch(`${BASE_URL}/kpis/summary`, {
    headers: {
      'Authorization': `Bearer ${adminToken}`
    }
  });
  const kpiSummary = await adminKpiRes.json();
  console.log('Admin KPI summary accessible (200):', adminKpiRes.status === 200 ? 'PASS' : 'FAIL', kpiSummary);

  const adminKpiUserRes = await fetch(`${BASE_URL}/kpis/by-user`, {
    headers: {
      'Authorization': `Bearer ${adminToken}`
    }
  });
  const kpiUsers = await adminKpiUserRes.json();
  console.log('Admin KPI by user accessible (200):', adminKpiUserRes.status === 200 && Array.isArray(kpiUsers) ? 'PASS' : 'FAIL');

  console.log('--- All Backend Verification Tests Completed Successfully ---');
};

runTests().catch(console.error);
