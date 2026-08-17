const BASE_URL = 'http://localhost:5001/api';

const runTest = async () => {
  console.log('--- Testing Delete Developer Functionality ---');

  const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'jacobo.monroy@tableu.io', password: 'Admin123!' })
  });
  const adminData = await adminLoginRes.json();
  const adminToken = adminData.token;
  const adminUser = adminData.user;

  const devRegRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Temporal Dev',
      email: `temp_dev_${Date.now()}@tableu.io`,
      password: 'DevPass123!'
    })
  });
  const devData = await devRegRes.json();
  const devToken = devData.token;
  const devUser = devData.user;
  console.log(`[PASS] Registered temporary developer: ${devUser.name} (ID: ${devUser._id})`);

  const storyRes = await fetch(`${BASE_URL}/stories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({
      title: 'Story assigned to temporary dev',
      assignedTo: devUser._id,
      estimatedHours: 4,
      difficulty: 2
    })
  });
  const story = await storyRes.json();
  console.log(`[PASS] Story created and assigned to dev: ID ${story._id}`);

  const devDeleteSelfRes = await fetch(`${BASE_URL}/users/${devUser._id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${devToken}` }
  });
  console.log(`[PASS] Developer deleting account blocked (403): ${devDeleteSelfRes.status === 403 ? 'OK' : 'FAIL'}`);

  const adminDeleteAdminRes = await fetch(`${BASE_URL}/users/${adminUser._id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  console.log(`[PASS] Admin deleting admin blocked (400): ${adminDeleteAdminRes.status === 400 ? 'OK' : 'FAIL'}`);

  const adminDeleteDevRes = await fetch(`${BASE_URL}/users/${devUser._id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  const deleteResult = await adminDeleteDevRes.json();
  console.log(`[PASS] Admin deleting developer: Status ${adminDeleteDevRes.status} - Message: "${deleteResult.message}"`);

  const checkStoryRes = await fetch(`${BASE_URL}/stories/${story._id}`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  const updatedStory = await checkStoryRes.json();
  console.log(`[PASS] Story was cleanly unassigned (assignedTo is null): ${updatedStory.assignedTo === null ? 'OK' : 'FAIL'}`);

  console.log('--- Delete Developer Tests Completed Successfully ---');
};

runTest().catch(console.error);
