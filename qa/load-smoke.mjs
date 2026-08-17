import { readFile } from 'node:fs/promises';
import { performance } from 'node:perf_hooks';

const REQUESTS = Number(process.env.MELA_QA_REQUESTS || 20);
const CONCURRENCY = Number(process.env.MELA_QA_CONCURRENCY || 5);
const MAX_P95_MS = Number(process.env.MELA_QA_MAX_P95_MS || 5000);
const html = await readFile('index.html', 'utf8');
const cfg = html.match(/const U='([^']+)',K='([^']+)'/);
if (!cfg) throw new Error('Could not locate public Supabase URL/key in synchronized frontend');
const [, supabaseUrl, publishableKey] = cfg;
const endpoint = `${supabaseUrl}/functions/v1/mela-web/api/health`;

let next = 0;
const results = [];

async function worker() {
  while (true) {
    const i = next++;
    if (i >= REQUESTS) return;
    const started = performance.now();
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 10000);
      const response = await fetch(endpoint, {
        headers: { apikey: publishableKey, accept: 'application/json' },
        cache: 'no-store',
        signal: controller.signal
      });
      clearTimeout(timer);
      const body = await response.json();
      results.push({
        i,
        ok: response.ok && body?.ok === true && body?.dependencies?.auth === true && body?.dependencies?.build === true && body?.dependencies?.database_integrity === true && body?.dependencies?.frontend_js_syntax === true,
        status: response.status,
        build: body?.build,
        ms: performance.now() - started
      });
    } catch (error) {
      results.push({ i, ok: false, status: 0, build: null, ms: performance.now() - started, error: String(error) });
    }
  }
}

await Promise.all(Array.from({ length: Math.min(CONCURRENCY, REQUESTS) }, () => worker()));
results.sort((a, b) => a.ms - b.ms);
const failures = results.filter(r => !r.ok);
const percentile = p => results[Math.min(results.length - 1, Math.ceil(results.length * p) - 1)]?.ms || 0;
const p50 = percentile(0.50);
const p95 = percentile(0.95);
const max = results.at(-1)?.ms || 0;
const builds = [...new Set(results.map(r => r.build).filter(Boolean))];

console.log(JSON.stringify({
  requests: REQUESTS,
  concurrency: CONCURRENCY,
  failures: failures.length,
  p50_ms: Math.round(p50),
  p95_ms: Math.round(p95),
  max_ms: Math.round(max),
  builds
}, null, 2));

if (failures.length) throw new Error(`Backend concurrency smoke had ${failures.length} failed request(s)`);
if (builds.length !== 1) throw new Error(`Expected one active build, saw: ${builds.join(', ')}`);
if (p95 > MAX_P95_MS) throw new Error(`Backend health p95 ${Math.round(p95)}ms exceeded smoke threshold ${MAX_P95_MS}ms`);
