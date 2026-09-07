const required = [
  'MELA_QA_BUILD_ENDPOINT',
  'MELA_SUPABASE_URL',
  'MELA_SUPABASE_ANON_KEY',
  'MELA_TEST_STUDENT_EMAIL',
  'MELA_TEST_STUDENT_PASSWORD',
];

const missing = required.filter((name) => !process.env[name]?.trim());
if (missing.length) {
  throw new Error(
    `Authenticated/pre-launch QA configuration is incomplete. Missing: ${missing.join(', ')}. ` +
      'Configure the GitHub repository variable/secrets before treating the production gate as runnable.'
  );
}

const endpoint = process.env.MELA_QA_BUILD_ENDPOINT.trim();
if (!/^https:\/\//i.test(endpoint)) {
  throw new Error('MELA_QA_BUILD_ENDPOINT must be an HTTPS production frontend URL.');
}

if (/supabase\.co\/functions\/v1\//i.test(endpoint)) {
  throw new Error('MELA_QA_BUILD_ENDPOINT must be the real HTML-serving MELA frontend, not a Supabase Edge Function.');
}

console.log('Authenticated/pre-launch QA configuration is present and structurally valid.');
