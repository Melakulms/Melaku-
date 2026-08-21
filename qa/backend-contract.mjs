const endpoint = process.env.MELA_QA_BUILD_ENDPOINT || 'https://duizgtmbptmlbyipreqg.supabase.co/functions/v1/mela-web';
const healthUrl = `${endpoint.replace(/\/$/, '')}/api/health`;

const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 15000);
let response;
try {
  response = await fetch(healthUrl, {
    cache: 'no-store',
    headers: { Accept: 'application/json' },
    signal: controller.signal,
  });
} finally {
  clearTimeout(timeout);
}

if (!response.ok && response.status !== 503) {
  throw new Error(`Backend health returned unexpected HTTP ${response.status}`);
}
const contentType = response.headers.get('content-type') || '';
const body = await response.json();

const checks = [
  ['JSON response', /application\/json/i.test(contentType)],
  ['service present', body.service === 'mela-build-api-v34'],
  ['auth dependency reported', typeof body.dependencies?.auth === 'boolean'],
  ['build dependency reported', typeof body.dependencies?.build === 'boolean'],
  ['database integrity reported', typeof body.dependencies?.database_integrity === 'boolean'],
  ['frontend JS syntax reported', typeof body.dependencies?.frontend_js_syntax === 'boolean'],
  ['launch remains disabled', body.launch_ready !== true],
];

const failures = checks.filter(([, ok]) => !ok).map(([name]) => name);
console.log(JSON.stringify({ healthUrl, status: response.status, content_type: contentType, checks: checks.length, failures, health: body }, null, 2));
if (failures.length) throw new Error(`Backend contract failed: ${failures.join(', ')}`);
