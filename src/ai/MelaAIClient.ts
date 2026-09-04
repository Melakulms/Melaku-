export type MelaAIRequest = {
  message: string;
  session_id?: string;
  agent?: string;
  metadata?: Record<string, unknown>;
};

export type MelaAIResponse = {
  request_id?: string;
  session_id?: string;
  agent?: { key: string; name: string; domain: string };
  response?: string;
  requires_approval?: boolean;
  task_id?: string;
  error?: string;
  status?: string;
  mode?: string;
  attempts?: number;
  result?: {
    ok?: boolean;
    status?: string;
    task_id?: string | null;
    run_id?: string;
    agent?: { key: string; name: string; domain: string };
    tool?: string | null;
    response?: string;
    retries?: number;
  };
};

/** Thin client for the durable MELA AI Coordinator. It deliberately accepts only the user's JWT. */
export async function callMelaAICore(
  request: MelaAIRequest,
  options: { supabaseUrl: string; accessToken: string; signal?: AbortSignal }
): Promise<MelaAIResponse> {
  if (!request.message?.trim()) throw new Error('Message is required');
  if (!options.supabaseUrl || !options.accessToken) throw new Error('Authenticated MELA session required');

  const response = await fetch(`${options.supabaseUrl.replace(/\/$/, '')}/functions/v1/mela-ai-coordinator-v2`, {
    method: 'POST',
    signal: options.signal,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${options.accessToken}`,
    },
    body: JSON.stringify(request),
  });

  const data = (await response.json().catch(() => ({}))) as MelaAIResponse;
  if (!response.ok) throw new Error(data.error || `MELA AI request failed (${response.status})`);

  // Keep the existing UI contract stable while consuming the durable execution response.
  if (data.result?.response && !data.response) data.response = data.result.response;
  if (data.result?.task_id && !data.task_id) data.task_id = data.result.task_id;
  if (data.mode === 'approval' || data.mode === 'approval_required') data.requires_approval = true;
  if (data.result?.agent && !data.agent) data.agent = data.result.agent;

  return data;
}

export function createAbortController(timeoutMs = 45_000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return { controller, clear: () => clearTimeout(timer) };
}
