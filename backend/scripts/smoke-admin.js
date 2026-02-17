const DEFAULT_BASE_URL = 'http://localhost:5000';
const API_BASE_URL = (process.env.API_BASE_URL || DEFAULT_BASE_URL).replace(
  /\/+$/,
  ''
);

const expectStatus = async (path, expectedStatus, method = 'GET') => {
  const url = `${API_BASE_URL}${path}`;
  const res = await fetch(url, { method });
  const text = await res.text();

  if (res.status !== expectedStatus) {
    throw new Error(
      `${path}: expected ${expectedStatus}, got ${res.status}. Body: ${text}`
    );
  }

  return { url, status: res.status, text };
};

const run = async () => {
  const checks = [
    { path: '/api/health', status: 200 },
    { path: '/api/admin/overview', status: 401 },
    { path: '/api/admin/dashboard', status: 401 },
    { path: '/api/admin/comments', status: 401 },
    { path: '/api/admin/newsletter/summary', status: 401 },
    { path: '/api/newsletter/send', status: 410, method: 'POST' },
  ];

  for (const check of checks) {
    const result = await expectStatus(check.path, check.status, check.method);
    console.log(`[ok] ${result.status} ${result.url}`);
  }

  console.log('[done] admin smoke checks passed');
};

run().catch((err) => {
  console.error('[fail] admin smoke checks failed');
  console.error(err.message || err);
  process.exit(1);
});
