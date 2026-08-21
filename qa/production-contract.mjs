const endpoint = process.env.MELA_QA_BUILD_ENDPOINT || 'https://duizgtmbptmlbyipreqg.supabase.co/functions/v1/mela-web';

const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 15000);
let response;
try {
  response = await fetch(endpoint, {
    cache: 'no-store',
    headers: { Accept: 'text/plain' },
    signal: controller.signal,
  });
} finally {
  clearTimeout(timeout);
}

if (!response.ok) throw new Error(`Active Mela frontend returned HTTP ${response.status}`);
const html = await response.text();
const contentType = response.headers.get('content-type') || '';
const build = response.headers.get('x-mela-build') || '';

const required = [
  ['doctype', /^\s*<!doctype html>/i.test(html)],
  ['Mela title', /<title>\s*Mela/i.test(html)],
  ['build header', Boolean(build)],
  ['English locale', /value=["']en["']/i.test(html)],
  ['Amharic locale', /value=["']am["']/i.test(html)],
  ['Afaan Oromo locale', /value=["']om["']/i.test(html)],
  ['Tigrinya locale', /value=["']ti["']/i.test(html)],
  ['Somali locale', /value=["']so["']/i.test(html)],
  ['student role', /student/i.test(html)],
  ['parent role', /parent/i.test(html)],
  ['teacher role', /teacher/i.test(html)],
  ['company role', /company/i.test(html)],
  ['no production launch flag', !/production_launch\s*[:=]\s*true/i.test(html)],
  ['no service-role secret', !/service_role|sb_secret_[A-Za-z0-9_-]{20,}/i.test(html)],
];

const failures = required.filter(([, ok]) => !ok).map(([name]) => name);
console.log(JSON.stringify({
  endpoint,
  status: response.status,
  content_type: contentType,
  build,
  checks: required.length,
  failures,
}, null, 2));

if (!/text\/html|application\/xhtml\+xml/i.test(contentType)) {
  throw new Error(`Unexpected active frontend content-type: ${contentType}`);
}
if (failures.length) throw new Error(`Production contract failed: ${failures.join(', ')}`);
