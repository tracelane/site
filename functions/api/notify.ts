/**
 * Worker entrypoint for tracelane-site.
 *
 * Routes:
 *   POST /api/notify  → capture email into D1
 *   *    everything else → served from static assets (handled by [assets] config)
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

export default {
  async fetch(request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/notify") {
      return handleNotify(request, env);
    }

    // Everything else: static assets via [assets] binding (auto-injected as env.ASSETS)
    return env.ASSETS.fetch(request);
  },
};