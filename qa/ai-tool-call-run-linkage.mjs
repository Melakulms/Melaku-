// Regression guard: tool-call records must always be attached to a real AI run.
// This is a source-level invariant because direct DB mutation tests require authenticated test credentials.
import fs from 'node:fs';

const files = [
  'src/ai/MelaAIClient.ts',
  'src/ai/MelaAIOrchestrator.ts',
  'supabase/functions/mela-ai-core/index.ts',
  'supabase/functions/mela-ai-coordinator-v2/index.ts',
  'supabase/functions/mela-ai-execution-v2/index.ts',
];

const existing = files.filter(fs.existsSync);
if (!existing.length) {
  console.log('AI execution source files are not present in this checkout; skipping source guard.');
  process.exit(0);
}

let failed = false;
for (const file of existing) {
  const text = fs.readFileSync(file, 'utf8');
  if (/mela_ai_tool_calls/.test(text) && /run_id\s*:\s*null/.test(text)) {
    console.error(`FAIL: ${file} attempts to create mela_ai_tool_calls with run_id=null`);
    failed = true;
  }
}

if (failed) process.exit(1);
console.log('PASS: no AI tool-call source path explicitly inserts run_id=null.');
