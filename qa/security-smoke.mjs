import fs from 'node:fs';

const html = fs.readFileSync('index.html', 'utf8');
const urlMatch = html.match(/\bU\s*=\s*["'](https:\/\/[^"']+)["']/);
const keyMatch = html.match(/\bK\s*=\s*["'](sb_publishable_[^"']+)["']/);
if (!urlMatch || !keyMatch) throw new Error('Unable to locate Supabase URL/publishable key in synchronized frontend');

const base = urlMatch[1].replace(/\/$/, '');
const key = keyMatch[1];
const checks = [
  ['request_my_guardian_consent', { p_guardian_email: 'qa@example.invalid', p_relationship: 'parent', p_guardian_phone: null }],
  ['review_guardian_consent', { p_relationship_id: '00000000-0000-0000-0000-000000000000', p_decision: 'rejected', p_notes: 'qa' }],
  ['refresh_my_school_safety_status', {}],
  ['set_my_education_context', { p_stage_key: 'school_1_4', p_grade_level: 1, p_institution_name: 'QA' }],
  ['get_my_assessment_language_review_assignments', {}],
  ['get_my_partner_dashboard', {}],
  ['review_sector_partner_registration', { p_request_id: '00000000-0000-0000-0000-000000000000', p_decision: 'rejected', p_notes: 'qa' }],
  ['submit_task_milestone', { p_milestone_id: '00000000-0000-0000-0000-000000000000', p_deliverable_url: 'https://example.invalid/qa', p_submission_note: 'qa' }],
];

let failures = 0;
for (const [name, body] of checks) {
  const res = await fetch(`${base}/rest/v1/rpc/${name}`, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  const denied = res.status === 401 || res.status === 403;
  console.log(`${name}: HTTP ${res.status}${denied ? ' denied as expected' : ''}`);
  if (!denied) {
    failures += 1;
    console.error(`Unexpected anonymous response for ${name}: ${text.slice(0, 300)}`);
  }
}

if (failures) throw new Error(`${failures} authenticated workflow RPC(s) were not denied to anon`);
console.log(`Anonymous RPC denial smoke passed for ${checks.length} protected workflows.`);
