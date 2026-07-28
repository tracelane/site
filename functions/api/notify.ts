/**
 * Worker entrypoint for tracelane-site.
 *
 * Host routing:
 *   docs.tracelane.dev      → docs stub HTML (compile-time embedded)
 *   tracelane.dev (+ www)   → static assets from /dist (via env.ASSETS)
 *
 * Path routing on apex:
 *   POST /api/notify        → capture email into D1
 *   *                       → static assets
 */

interface Env {
  DB: D1Database;
  ASSETS: Fetcher;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface NotifyBody {
  email?: unknown;
}

const json = (data: unknown, status = 200): Response =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });

async function handleNotify(request: Request, env: Env): Promise<Response> {
  if (request.method !== "POST") {
    return json({ error: "method not allowed" }, 405);
  }

  try {
    const body = (await request.json().catch(() => ({}))) as NotifyBody;
    const rawEmail = typeof body.email === "string" ? body.email : "";
    const email = rawEmail.trim().toLowerCase();

    if (!EMAIL_RE.test(email) || email.length > 254) {
      return json({ error: "invalid email" }, 400);
    }

    const country = request.headers.get("cf-ipcountry") ?? null;
    const userAgentHeader = request.headers.get("user-agent");
    const userAgent = userAgentHeader ? userAgentHeader.slice(0, 255) : null;

    await env.DB.prepare(
      "INSERT INTO notifications (email, source, ip_country, user_agent) VALUES (?, ?, ?, ?) ON CONFLICT(email) DO NOTHING"
    )
      .bind(email, "landing", country, userAgent)
      .run();

    return json({ ok: true });
  } catch {
    return json({ error: "server error" }, 500);
  }
}

const DOCS_STUB_HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#0a0a0a" media="(prefers-color-scheme: dark)">
<meta name="theme-color" content="#fafafa" media="(prefers-color-scheme: light)">
<title>Docs · Tracelane</title>
<meta name="description" content="Tracelane documentation ships at V1 launch — Tuesday, June 16, 2026.">
<link rel="canonical" href="https://docs.tracelane.dev">
<style>
  :root {
    --bg: #0a0a0a; --bg-elev: #1a1a1a; --fg: #fafafa;
    --fg-muted: #b3b3b3; --fg-subtle: #808080; --fg-dim: #595959;
    --border: #2d2d2d;
  }
  @media (prefers-color-scheme: light) {
    :root {
      --bg: #fafafa; --bg-elev: #f5f5f5; --fg: #1a1a1a;
      --fg-muted: #595959; --fg-subtle: #808080; --fg-dim: #b3b3b3;
      --border: #d9d9d9;
    }
  }
  html { background: var(--bg); color: var(--fg); }
  body { margin: 0; font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif; min-height: 100vh; display: flex; flex-direction: column; -webkit-font-smoothing: antialiased; }
  .container { max-width: 720px; margin: 0 auto; padding: 1.5rem; flex: 1; display: flex; flex-direction: column; width: 100%; box-sizing: border-box; }
  header { padding: 1rem 0; border-bottom: 1px solid var(--border); }
  .wordmark { font-weight: 600; font-size: 1rem; text-decoration: none; color: var(--fg); }
  main { flex: 1; display: flex; align-items: center; justify-content: center; padding: 4rem 0; }
  .content { max-width: 480px; }
  .eyebrow { font-family: ui-monospace, "SF Mono", monospace; font-size: 0.75rem; color: var(--fg-dim); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 1rem; }
  h1 { font-size: 2.5rem; font-weight: 600; line-height: 1.1; margin: 0 0 1.5rem 0; letter-spacing: -0.02em; }
  p { color: var(--fg-muted); line-height: 1.6; margin: 0 0 1rem 0; }
  a.inline { color: var(--fg); text-decoration: underline; text-decoration-color: var(--fg-subtle); }
  a.inline:hover { text-decoration-color: var(--fg); }
  .actions { margin-top: 2.5rem; display: flex; gap: 0.75rem; flex-wrap: wrap; }
  .btn { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.25rem; border-radius: 0.375rem; font-weight: 500; font-size: 0.875rem; text-decoration: none; transition: all 0.15s ease; }
  .btn-primary { background: var(--fg); color: var(--bg); }
  .btn-primary:hover { opacity: 0.85; }
  .btn-secondary { background: transparent; color: var(--fg); border: 1px solid var(--border); }
  .btn-secondary:hover { border-color: var(--fg-subtle); }
  footer { padding: 1.5rem 0; border-top: 1px solid var(--border); color: var(--fg-subtle); font-size: 0.75rem; font-family: ui-monospace, monospace; }
  footer a { color: var(--fg-muted); text-decoration: none; }
  footer a:hover { color: var(--fg); }
</style>
</head>
<body>
<div class="container">
  <header><a href="https://tracelane.dev" class="wordmark">tracelane</a></header>
  <main>
    <div class="content">
      <p class="eyebrow">Docs</p>
      <h1>Documentation ships with V1.</h1>
      <p>Full product documentation — gateway setup, SDK references, observability schema, predictive guardrail configuration, audit-ledger verification — publishes Tuesday, June 16, 2026 alongside the V1 launch.</p>
      <p>Until then, the <a class="inline" href="https://github.com/tracelane">tracelane organization on GitHub</a> hosts the open-source repos under Apache 2.0.</p>
      <div class="actions">
        <a href="https://tracelane.dev/#notify" class="btn btn-primary">Get launch notification</a>
        <a href="https://tracelane.dev" class="btn btn-secondary">← tracelane.dev</a>
      </div>
    </div>
  </main>
  <footer>© 2026 tracelane · <a href="https://tracelane.dev/security">security</a> · <a href="https://tracelane.dev/privacy">privacy</a></footer>
</div>
</body>
</html>`;

export default {
  async fetch(request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const host = url.hostname.toLowerCase();

    // Host route: docs.tracelane.dev → serve docs stub
    if (host === "docs.tracelane.dev") {
      return new Response(DOCS_STUB_HTML, {
        status: 200,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "public, max-age=300",
          "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
          "X-Content-Type-Options": "nosniff",
          "X-Frame-Options": "DENY",
          "Referrer-Policy": "strict-origin-when-cross-origin",
        },
      });
    }

    // Apex/www routes
    if (url.pathname === "/api/notify") {
      return handleNotify(request, env);
    }

    // Static assets. Guarded: if the ASSETS binding is ever missing, an
    // unguarded call turns every asset-miss path into a Worker exception
    // (CF 1101) rather than a 404.
    if (!env.ASSETS) {
      return new Response("Not found", { status: 404 });
    }
    return env.ASSETS.fetch(request);
  },
};
