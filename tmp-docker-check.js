(async () => {
  const fetch = globalThis.fetch;
  const base = 'http://localhost:5000/api';
  const email = `test.${Math.random().toString(36).slice(2,8)}@example.com`;
  console.log('email', email);
  const regBody = { name: 'Docker Test', email, password: 'Test1234!', confirmPassword: 'Test1234!' };
  let r = await fetch(`${base}/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(regBody) });
  console.log('register', r.status, await r.json());

  let l = await fetch(`${base}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password: 'Test1234!' }) });
  const login = await l.json();
  console.log('login', l.status, login.success ? 'OK' : login);
  const token = login.token;
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  let p = await fetch(`${base}/projects`, { method: 'POST', headers, body: JSON.stringify({ name: 'Docker Host Test Project' }) });
  const proj = await p.json();
  console.log('createProject', p.status, proj.success ? proj.project?.id || 'OK' : proj);
  const projectId = proj.project?.id;

  // Attempt to connect a Docker host using common TCP ports
  for (const port of [2375, 2376]) {
    try {
      console.log('attempting connect on', port);
      const ch = await fetch(`${base}/docker-hosts/${projectId}`, { method: 'POST', headers, body: JSON.stringify({ name: 'local', host: 'localhost', port }) });
      const chJson = await ch.json();
      console.log('connect', port, ch.status, chJson);
      if (ch.status === 201) break;
    } catch (err) {
      console.log('connect error', port, err.message || err);
    }
  }

  // Check docker-host status
  const statusRes = await fetch(`${base}/docker-hosts/${projectId}`, { method: 'GET', headers });
  let statusJson = null;
  try {
    statusJson = await statusRes.json();
    console.log('status', statusRes.status, statusJson);
  } catch (e) {
    console.log('status err', e.message);
  }

  // If host connected, list containers and services
  if (statusRes.status === 200 && statusJson) {
    const host = statusJson.dockerHost;
    const containers = await fetch(`${base}/containers/${host.id}`, { method: 'GET', headers });
    console.log('containers', containers.status, await containers.json());
    const services = await fetch(`${base}/services/${projectId}`, { method: 'GET', headers });
    console.log('services', services.status, await services.json());
  }
})();
