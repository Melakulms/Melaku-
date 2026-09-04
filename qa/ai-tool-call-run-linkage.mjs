// Regression guard: every tool-call insert must be linked to a real AI run.
import fs from 'node:fs';

const files = [
  'src/ai/MelaAIClient.ts',
  'src/ai/MelaAIOrchestrator.ts',
  'supabase/functions/mela-ai-core/index.ts',
  'supabase/functions/mela-ai-coordinator-v2/index.ts',
  'supabase/functions/mela-ai-execution-v2/index.ts',
];

let failed = false;
for (const file of files.filter(fs.existsSync)) {
  const text = fs.readFileSync(file, 'utf8');
  const inserts = [...text.matchAll(/mela_ai_tool_calls[\s\S]{0,1200}/g)].map(m => m[0]);
  for (const block of inserts) {
    if (/run_id\s*:\s*null/.test(block)) {
      console.error(`FAIL: ${file} inserts mela_ai_tool_calls with run_id=null`);
      failed = true;
    }
  }
}
if (failed) process.exit(1);
console.log('PASS: no repository AI tool-call path explicitly inserts run_id=null.');
