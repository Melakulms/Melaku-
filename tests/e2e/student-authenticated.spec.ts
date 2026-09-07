import { test, expect } from '@playwright/test';

/**
 * Authenticated student acceptance flow.
 *
 * Required CI/staging secrets:
 *   MELA_TEST_STUDENT_EMAIL
 *   MELA_TEST_STUDENT_PASSWORD
 *   MELA_SUPABASE_ANON_KEY
 *
 * The account must be a real, active, verified student account with a
 * completed role selection. No production credentials belong in source control.
 */
const email = process.env.MELA_TEST_STUDENT_EMAIL;
const password = process.env.MELA_TEST_STUDENT_PASSWORD;
const supabaseUrl = process.env.MELA_SUPABASE_URL || 'https://duizgtmbptmlbyipreqg.supabase.co';
const supabaseAnonKey = process.env.MELA_SUPABASE_ANON_KEY;

test.describe('Student authenticated workflow E2E', () => {
  test.skip(
    !email || !password || !supabaseAnonKey,
    'Set MELA_TEST_STUDENT_EMAIL, MELA_TEST_STUDENT_PASSWORD, and MELA_SUPABASE_ANON_KEY for the authenticated E2E gate.'
  );

  async function login(page: any) {
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.locator('#open').click();
    await expect(page.locator('#login')).toBeVisible();
    await page.locator('#em').fill(email!);
    await page.locator('#pw').fill(password!);
    await page.locator('#signin').click();
    await expect(page.locator('#app')).toBeVisible({ timeout: 20000 });
    await expect(page.locator('#out')).toBeVisible();
  }

  function authHeaders(accessToken: string) {
    return {
      apikey: supabaseAnonKey!,
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
  }

  async function getSession(page: any) {
    return page.evaluate(() => JSON.parse(localStorage.getItem('melaSession') || 'null'));
  }

  test('login → student workspace → session restore → logout', async ({ page }) => {
    await login(page);

    // A valid student must land in the authenticated learner experience rather
    // than remaining on the public/login shell or an unauthorised role workspace.
    await expect(page.locator('#wel')).toBeVisible();
    await expect(page.locator('[data-tab="q"]')).toBeVisible();
    await expect(page.locator('[data-tab="learn"]')).toBeVisible();
    await expect(page.locator('[data-tab="account"]')).toBeVisible();

    const sessionBeforeReload = await getSession(page);
    expect(sessionBeforeReload?.access_token).toBeTruthy();
    expect(sessionBeforeReload?.user?.id).toBeTruthy();

    // Verify that the authenticated identity is accepted by Supabase, not just
    // that the browser happens to have a localStorage token.
    const userResponse = await page.request.get(`${supabaseUrl}/auth/v1/user`, {
      headers: authHeaders(sessionBeforeReload.access_token),
    });
    expect(userResponse.ok()).toBeTruthy();
    const user = await userResponse.json();
    expect(user.id).toBe(sessionBeforeReload.user.id);
    expect(user.email).toBe(email);

    await page.reload({ waitUntil: 'networkidle' });
    await expect(page.locator('#app')).toBeVisible({ timeout: 20000 });
    await expect(page.locator('#out')).toBeVisible();
    await expect(page.locator('#wel')).toBeVisible();

    // Logout must remove the authenticated state and return to login/public shell.
    await page.locator('#out').click();
    await expect(page.locator('#login')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('#app')).toBeHidden();
    const sessionAfterLogout = await page.evaluate(() => localStorage.getItem('melaSession'));
    expect(sessionAfterLogout).toBeNull();
  });

  test('student session cannot be replaced by an unauthenticated browser state', async ({ page }) => {
    await login(page);

    await page.evaluate(() => localStorage.removeItem('melaSession'));
    await page.reload({ waitUntil: 'domcontentloaded' });

    // Removing the persisted token must not leave an authenticated workspace open.
    await expect(page.locator('#login')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('#app')).toBeHidden();
  });

  test('authenticated student can execute the current mastery question workflow end-to-end', async ({ page }) => {
    await login(page);

    const session = await getSession(page);
    expect(session?.access_token).toBeTruthy();
    expect(session?.user?.id).toBeTruthy();
    const headers = authHeaders(session.access_token);

    // Confirm the learner role through the same authenticated RLS path used by the app.
    const profileResponse = await page.request.get(
      `${supabaseUrl}/rest/v1/profiles?id=eq.${encodeURIComponent(session.user.id)}&select=id,role,account_status,role_selected_at&limit=1`,
      { headers }
    );
    expect(profileResponse.ok()).toBeTruthy();
    const profiles = await profileResponse.json();
    expect(profiles).toHaveLength(1);
    expect(profiles[0].id).toBe(session.user.id);
    expect(profiles[0].role).toBe('student');
    expect(profiles[0].role_selected_at).toBeTruthy();

    // The current frontend uses the v15 filtered question-session RPC, which
    // delegates to the v18 implementation and creates mela_question_sessions.
    // Discover active school-subject programs instead of hard-coding a mutable UUID.
    const programsResponse = await page.request.get(
      `${supabaseUrl}/rest/v1/mela_learning_programs?active=eq.true&program_kind=eq.school_subject&select=program_key,subject_title,grade_level&order=grade_level.asc&limit=100`,
      { headers }
    );
    expect(programsResponse.ok()).toBeTruthy();
    const programs = await programsResponse.json();
    expect(Array.isArray(programs)).toBeTruthy();
    expect(programs.length).toBeGreaterThan(0);

    let practice: any = null;
    let lastStartError = '';

    for (const program of programs) {
      const startResponse = await page.request.post(`${supabaseUrl}/rest/v1/rpc/start_mela_filtered_question_session_v15`, {
        headers,
        data: {
          p_program_key: program.program_key,
          p_chapter_id: null,
          p_topic_id: null,
          p_count: 5,
          p_difficulty: null,
        },
      });
      if (!startResponse.ok()) {
        lastStartError = await startResponse.text();
        continue;
      }
      practice = await startResponse.json();
      break;
    }

    expect(practice, `No active school subject could start a mastery session: ${lastStartError}`).toBeTruthy();
    expect(practice.session_id).toBeTruthy();
    expect(practice.program_key).toBeTruthy();
    expect(practice.practice_mode).toBe('mastery');
    expect(practice.quality_state).toBe('mastery_candidate');
    expect(Array.isArray(practice.questions)).toBeTruthy();
    expect(practice.questions.length).toBeGreaterThanOrEqual(5);

    const sessionId = practice.session_id;
    const question = practice.questions[0];
    expect(question?.id).toBeTruthy();
    expect(question?.id).toMatch(/^[0-9a-f-]{36}$/i);

    // The session row is owner-readable only. This proves the RPC-created
    // session is tied to the authenticated student rather than merely returning
    // an in-memory payload.
    const sessionRead = await page.request.get(
      `${supabaseUrl}/rest/v1/mela_question_sessions?id=eq.${encodeURIComponent(sessionId)}&select=id,user_id,program_key,status,requested_count,answered_count,correct_count,score_percent,expires_at&limit=1`,
      { headers }
    );
    expect(sessionRead.ok()).toBeTruthy();
    const sessions = await sessionRead.json();
    expect(sessions).toHaveLength(1);
    expect(sessions[0].id).toBe(sessionId);
    expect(sessions[0].user_id).toBe(session.user.id);
    expect(sessions[0].program_key).toBe(practice.program_key);
    expect(sessions[0].status).toBe('started');
    expect(sessions[0].requested_count).toBeGreaterThanOrEqual(5);
    expect(sessions[0].answered_count).toBe(0);

    // Submit the current session format. An empty response intentionally tests
    // the safe unanswered/incorrect path without reading any answer key.
    const submitResponse = await page.request.post(`${supabaseUrl}/rest/v1/rpc/submit_mela_question_session_v12`, {
      headers,
      data: {
        p_session_id: sessionId,
        p_answers: [{ question_id: question.id, response: '' }],
      },
    });
    expect(submitResponse.ok()).toBeTruthy();
    const completion = await submitResponse.json();
    expect(completion.session_id).toBe(sessionId);
    expect(completion.question_count).toBe(practice.questions.length);
    expect(completion.answered_count).toBe(1);
    expect(completion.correct_count).toBeGreaterThanOrEqual(0);
    expect(completion.correct_count).toBeLessThanOrEqual(completion.answered_count);
    expect(completion.score_percent).toBeGreaterThanOrEqual(0);
    expect(completion.score_percent).toBeLessThanOrEqual(100);
    expect(Array.isArray(completion.details)).toBeTruthy();
    expect(completion.details).toHaveLength(practice.questions.length);

    // Verify the persisted state transitioned atomically to submitted and is
    // still owned by the authenticated student.
    const submittedRead = await page.request.get(
      `${supabaseUrl}/rest/v1/mela_question_sessions?id=eq.${encodeURIComponent(sessionId)}&select=id,user_id,status,answered_count,correct_count,score_percent,submitted_at&limit=1`,
      { headers }
    );
    expect(submittedRead.ok()).toBeTruthy();
    const submitted = await submittedRead.json();
    expect(submitted).toHaveLength(1);
    expect(submitted[0].user_id).toBe(session.user.id);
    expect(submitted[0].status).toBe('submitted');
    expect(submitted[0].answered_count).toBe(1);
    expect(submitted[0].correct_count).toBe(completion.correct_count);
    expect(Number(submitted[0].score_percent)).toBe(Number(completion.score_percent));
    expect(submitted[0].submitted_at).toBeTruthy();
  });
});
