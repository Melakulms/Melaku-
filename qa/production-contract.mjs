// Mela production contract: validate the actual frontend host, not a Supabase Edge Function.
// Supabase-hosted Edge Functions do not provide the required production HTML MIME contract on the default domain.
const endpoint = process.env.MELA_QA_BUILD_ENDPOINT || '';

if (!endpoint) {
  throw new Error('MELA_QA_BUILD_ENDPOINT is required and must be the real production frontend URL. Do not point this contract at a Supabase Edge Function.');
}
if (/supabase\.co\/functions\/v1\//i.test(endpoint)) {
  throw new Error(`Invalid production frontend endpoint: ${endpoint}. Supabase Edge Functions are backend endpoints; use the actual HTML frontend host.`);
}

const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 15000);
let response;
try {
  response = await fetch(endpoint, {
    cache: 'no-store',
    headers: { Accept: 'text/html' },
    signal: controller.signal,
  });
} finally {
  clearTimeout(timeout);
}

if (!response.ok) throw new Error(`Active Mela frontend returned HTTP ${response.status}`);
const html = await response.text();
const contentType = response.headers.get('content-type') || '';
const headerBuild = response.headers.get('x-mela-build') || '';
const titleMatch = html.match(/<title>\s*Mela\s+v([0-9]+(?:\.[0-9]+)*)\b/i);
const titleBuild = titleMatch ? `v${titleMatch[1]}` : '';
const build = headerBuild || titleBuild;

const required = [
  ['doctype', /^\s*<!doctype html>/i.test(html)],
  ['Mela title', /<title>\s*Mela/i.test(html)],
  ['build provenance', Boolean(build)],
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
  header_build: headerBuild,
  title_build: titleBuild,
  build,
  checks: required.length,
  failures,
}, null, 2));

if (!/text\/html|application\/xhtml\+xml/i.test(contentType)) {
  throw new Error(`Unexpected production frontend content-type: ${contentType}`);
}
if (failures.length) throw new Error(`Production contract failed: ${failures.join(', ')}`);
