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

  test('authenticated student can execute a real practice session end-to-end', async ({ page }) => {
    await login(page);

    const session = await getSession(page);
    expect(session?.access_token).toBeTruthy();
    expect(session?.user?.id).toBeTruthy();
    const headers = authHeaders(session.access_token);

    // Confirm the student profile is available through the same authenticated
    // RLS path used by the application.
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

    // Use a published topic that actually has a usable question. This avoids
    // hard-coding a mutable production UUID while still exercising real data.
    const topicsResponse = await page.request.get(
      `${supabaseUrl}/rest/v1/practice_topics?is_published=eq.true&select=id&order=created_at.desc&limit=25`,
      { headers }
    );
    expect(topicsResponse.ok()).toBeTruthy();
    const topics = await topicsResponse.json();
    expect(Array.isArray(topics)).toBeTruthy();
    expect(topics.length).toBeGreaterThan(0);

    let practiceSessionId = '';
    let selectedTopicId = '';
    let selectedQuestionId = '';
    let lastStartError = '';

    for (const topic of topics) {
      const startResponse = await page.request.post(`${supabaseUrl}/rest/v1/rpc/start_practice_session`, {
        headers,
        data: {
          p_topic_id: topic.id,
          p_mode: 'untimed',
          p_question_count: 1,
          p_difficulty: null,
        },
      });
      if (!startResponse.ok()) {
        lastStartError = await startResponse.text();
        continue;
      }
      practiceSessionId = await startResponse.json();
      selectedTopicId = topic.id;
      break;
    }

    expect(practiceSessionId, `No published topic could start a practice session: ${lastStartError}`).toBeTruthy();
    expect(selectedTopicId).toBeTruthy();

    // The session/question rows are private to the authenticated student.
    const questionsResponse = await page.request.get(
      `${supabaseUrl}/rest/v1/practice_session_questions?session_id=eq.${encodeURIComponent(practiceSessionId)}&select=session_id,question_id,question_order,max_points&order=question_order.asc`,
      { headers }
    );
    expect(questionsResponse.ok()).toBeTruthy();
    const sessionQuestions = await questionsResponse.json();
    expect(sessionQuestions).toHaveLength(1);
    selectedQuestionId = sessionQuestions[0].question_id;
    expect(sessionQuestions[0].session_id).toBe(practiceSessionId);

    // Submit a real response through the protected SECURITY DEFINER RPC. The
    // RPC, not direct table writes, owns attempt creation and grading fields.
    const submitResponse = await page.request.post(`${supabaseUrl}/rest/v1/rpc/submit_practice_response`, {
      headers,
      data: {
        p_session_id: practiceSessionId,
        p_question_id: selectedQuestionId,
        p_response: { answer: '' },
        p_time_spent_seconds: 1,
        p_attachment_path: null,
      },
    });
    expect(submitResponse.ok()).toBeTruthy();
    const submission = await submitResponse.json();
    expect(submission).toHaveProperty('auto_graded');

    // With one question, completion is now valid and updates mastery/statistics.
    const completeResponse = await page.request.post(`${supabaseUrl}/rest/v1/rpc/complete_practice_session`, {
      headers,
      data: { p_session_id: practiceSessionId },
    });
    expect(completeResponse.ok()).toBeTruthy();
    const completion = await completeResponse.json();
    expect(completion.session_id).toBe(practiceSessionId);
    expect(completion.answered).toBe(1);

    const sessionRead = await page.request.get(
      `${supabaseUrl}/rest/v1/practice_sessions?id=eq.${encodeURIComponent(practiceSessionId)}&select=id,user_id,status,answered_count,completed_at&limit=1`,
      { headers }
    );
    expect(sessionRead.ok()).toBeTruthy();
    const sessions = await sessionRead.json();
    expect(sessions).toHaveLength(1);
    expect(sessions[0].user_id).toBe(session.user.id);
    expect(sessions[0].status).toBe('completed');
    expect(sessions[0].answered_count).toBe(1);
    expect(sessions[0].completed_at).toBeTruthy();

    // Finally prove the attempt created by the protected RPC is readable only
    // through the authenticated student's own RLS scope.
    const attemptRead = await page.request.get(
      `${supabaseUrl}/rest/v1/practice_attempts?session_id=eq.${encodeURIComponent(practiceSessionId)}&question_id=eq.${encodeURIComponent(selectedQuestionId)}&select=id,user_id,session_id,question_id,time_spent_seconds&limit=1`,
      { headers }
    );
    expect(attemptRead.ok()).toBeTruthy();
    const attempts = await attemptRead.json();
    expect(attempts).toHaveLength(1);
    expect(attempts[0].user_id).toBe(session.user.id);
    expect(attempts[0].session_id).toBe(practiceSessionId);
    expect(attempts[0].question_id).toBe(selectedQuestionId);
    expect(attempts[0].time_spent_seconds).toBe(1);
  });
});
