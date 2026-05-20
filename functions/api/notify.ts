/**
 * POST /api/notify — capture email into D1.
 *
 * Binding (set in Cloudflare Pages dashboard → Functions → D1 bindings):
 *   variable name: DB
 *   D1 database:   tracelane-notify
 *
 * Rate limit: configured at WAF level (10 req/min/IP for /api/notify).
 * See README-DEPLOY.md.
 */

interface Env {
  DB: D1Database;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface NotifyBody {
  email?: unknown;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const body = (await context.request.json().catch(() => ({}))) as NotifyBody;
    const rawEmail = typeof body.email === "string" ? body.email : "";
    const email = rawEmail.trim().toLowerCase();

    if (!EMAIL_RE.test(email) || email.length > 254) {
      return new Response(
        JSON.stringify({ error: "invalid email" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const country = context.request.headers.get("cf-ipcountry") ?? null;
    const userAgentHeader = context.request.headers.get("user-agent");
    const userAgent = userAgentHeader ? userAgentHeader.slice(0, 255) : null;

    await context.env.DB.prepare(
      "INSERT INTO notifications (email, source, ip_country, user_agent) VALUES (?, ?, ?, ?) ON CONFLICT(email) DO NOTHING"
    )
      .bind(email, "landing", country, userAgent)
      .run();

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

// Reject non-POST methods.
export const onRequest: PagesFunction<Env> = async ({ request }) => {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "method not allowed" }), {
      status: 405,
      headers: {
        "Content-Type": "application/json",
        Allow: "POST",
      },
    });
  }
  return new Response(JSON.stringify({ error: "method not allowed" }), {
    status: 405,
    headers: { "Content-Type": "application/json" },
  });
};
