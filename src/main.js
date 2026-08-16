const BUILD_ENDPOINT = 'https://duizgtmbptmlbyipreqg.supabase.co/functions/v1/mela-web';

const app = document.getElementById('app');

app.innerHTML = `
  <section style="min-height:100vh;display:grid;place-items:center;background:#f7f6fc;color:#201a31;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;padding:24px">
    <div style="width:min(560px,100%);background:#fff;border:1px solid #e5e0ed;border-radius:18px;padding:24px;box-shadow:0 12px 40px rgba(50,36,90,.08)">
      <div style="width:44px;height:44px;border-radius:13px;display:grid;place-items:center;background:#6848dc;color:#fff;font-weight:900;margin-bottom:14px">M</div>
      <h1 style="margin:0 0 8px">Opening Mela…</h1>
      <p style="margin:0;color:#726b81">Loading the active Mela v35 frontend.</p>
    </div>
  </section>`;

async function loadMela() {
  const response = await fetch(BUILD_ENDPOINT, {
    cache: 'no-store',
    headers: { Accept: 'text/plain' },
  });

  if (!response.ok) {
    throw new Error(`Mela build service returned HTTP ${response.status}`);
  }

  const html = await response.text();
  const version = response.headers.get('x-mela-build') || 'unknown';

  if (!/^\s*<!doctype html>/i.test(html) || !/<title>\s*Mela/i.test(html)) {
    throw new Error(`Unexpected Mela build payload (${version})`);
  }

  // Replace the Vite shell with the authoritative active Mela frontend.
  // This preserves the existing Mela visual design instead of recreating it in AI Studio.
  document.open();
  document.write(html);
  document.close();
}

loadMela().catch((error) => {
  console.error('Mela bootstrap failed', error);
  app.innerHTML = `
    <section style="min-height:100vh;display:grid;place-items:center;background:#f7f6fc;color:#201a31;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;padding:24px">
      <div style="width:min(560px,100%);background:#fff;border:1px solid #e5e0ed;border-radius:18px;padding:24px">
        <div style="width:44px;height:44px;border-radius:13px;display:grid;place-items:center;background:#6848dc;color:#fff;font-weight:900;margin-bottom:14px">M</div>
        <h1 style="margin:0 0 8px">Mela preview unavailable</h1>
        <p style="color:#726b81">${String(error?.message || error).replace(/[<>&]/g, '')}</p>
      </div>
    </section>`;
});
