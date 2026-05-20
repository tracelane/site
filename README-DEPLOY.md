# deploy guide — tracelane.dev

End-to-end deploy of `tracelane-site` to Cloudflare Pages with a D1-backed
notify form. Target: live at <https://tracelane.dev> by Fri May 22, 2026 evening IST.

Estimated time: **30 minutes** for first deploy, **5 minutes** for subsequent deploys.

---

## prerequisites

- [ ] Cloudflare account, logged in
- [ ] `tracelane.dev` DNS already on Cloudflare nameservers (per memory: registered Apr 26, 2026)
- [ ] Node 20+ (`node --version`)
- [ ] pnpm 9+ (`pnpm --version` — install via `npm i -g pnpm` if missing)
- [ ] GitHub CLI (`gh --version`) and logged in (`gh auth status`)
- [ ] `tracelane` GitHub org exists (https://github.com/tracelane)

---

## step 1 — push to github (5 min)

```bash
cd ~/code/tracelane-site   # or wherever you unzipped the bundle
git init
git add -A
git commit -m "feat: initial site scaffold — astro 5, tailwind 4, monochrome lowercase"
git branch -M main

gh repo create tracelane/site \
  --public \
  --description "Marketing site for Tracelane — predictive reliability for AI agents." \
  --homepage "https://tracelane.dev" \
  --source=. \
  --remote=origin \
  --push
```

Verify at <https://github.com/tracelane/site>.

---

## step 2 — install deps + smoke test (5 min)

```bash
pnpm install
pnpm build
pnpm preview
```

Open <http://localhost:4321> — should see the full site, all sections render,
no console errors. Email form will fail (no D1 yet, expected).

`Ctrl+C` to stop the preview.

---

## step 3 — create d1 database (5 min)

```bash
pnpm dlx wrangler login                # opens browser, log in to Cloudflare
pnpm dlx wrangler d1 create tracelane-notify
```

Output will include:

```
✅ Successfully created DB 'tracelane-notify'
[[d1_databases]]
binding = "DB"
database_name = "tracelane-notify"
database_id = "abc123-def456-..."
```

**Copy the `database_id`** into `wrangler.toml` (replace `REPLACE_WITH_DATABASE_ID_FROM_WRANGLER`).

Apply the migration:

```bash
pnpm dlx wrangler d1 migrations apply tracelane-notify --remote
```

Verify:

```bash
pnpm dlx wrangler d1 execute tracelane-notify --remote \
  --command="SELECT name FROM sqlite_master WHERE type='table';"
```

Should show `notifications`.

Commit the wrangler.toml update:

```bash
git add wrangler.toml
git commit -m "chore: pin d1 database_id"
git push
```

---

## step 4 — create cloudflare pages project (10 min)

Via Cloudflare dashboard (faster than CLI for first connect):

1. <https://dash.cloudflare.com> → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
2. Authorize GitHub if prompted. Select the `tracelane/site` repo.
3. Build settings:
   - **Framework preset**: Astro
   - **Build command**: `pnpm build`
   - **Build output directory**: `dist`
   - **Root directory**: (leave blank)
4. **Environment variables** → Add:
   - `NODE_VERSION` = `20`
5. Click **Save and Deploy**.

First build takes ~2 minutes. When done, you'll see a `tracelane-site-XXX.pages.dev` URL.

**Click that URL — verify the site renders.** Email form will still fail (D1 not bound yet).

---

## step 5 — bind d1 to pages project (3 min)

Cloudflare dashboard → **Workers & Pages** → click `tracelane-site` → **Settings** → **Functions** → **D1 database bindings** → **Add binding**:

- **Variable name**: `DB`
- **D1 database**: `tracelane-notify`

Save. **Trigger a redeploy** (Deployments → latest → Retry deployment) so the binding picks up.

Test the form:

```bash
curl -X POST https://tracelane-site-XXX.pages.dev/api/notify \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

Expected: `{"ok":true}`. Verify in D1:

```bash
pnpm dlx wrangler d1 execute tracelane-notify --remote \
  --command="SELECT * FROM notifications;"
```

Should show your test row.

---

## step 6 — custom domain (5 min)

Cloudflare dashboard → `tracelane-site` → **Custom domains** → **Set up a custom domain**:

- Add **`tracelane.dev`** (apex)
- Add **`www.tracelane.dev`** — will follow the `_redirects` 301 to apex

SSL cert provisions within 5–15 minutes. Cloudflare uses CNAME flattening for the apex (Cloudflare-only feature).

Verify:

```bash
curl -I https://tracelane.dev
```

Should return `200 OK` with `strict-transport-security` header.

---

## step 7 — rate limit the notify endpoint (3 min)

Cloudflare dashboard → **tracelane.dev** zone → **Security** → **WAF** → **Rate limiting rules** → **Create rule**:

- **Name**: `notify-form-throttle`
- **Field**: URI Path
- **Operator**: equals
- **Value**: `/api/notify`
- **Requests**: `10`
- **Period**: `1 minute`
- **Counting**: `By IP`
- **Action**: Block
- **Duration**: `1 minute`

Save. This prevents abuse of the form.

---

## step 8 — email forwarding (3 min)

Cloudflare dashboard → **tracelane.dev** zone → **Email** → **Email Routing** → **Get started**:

1. Verify your destination email (your personal inbox).
2. Create custom address:
   - `support@tracelane.dev` → forwards to your inbox
   - `security@tracelane.dev` → forwards to your inbox
3. Save.

Send a test email to `support@tracelane.dev` — should arrive in your inbox in ~30 seconds.

---

## step 9 — verify everything (2 min)

Run through the verification checklist in
`CLAUDE_CODE_LANDING_BUILD_v3_1.md` §15. Key items:

- [ ] <https://tracelane.dev> renders, no console errors
- [ ] All section links work (#what, #audit, #pricing, #notify)
- [ ] `/security`, `/privacy`, `/terms`, `/changelog`, `/404` all render
- [ ] Form submission works: `curl -X POST https://tracelane.dev/api/notify -H "Content-Type: application/json" -d '{"email":"you@you.com"}'` returns `{"ok":true}`
- [ ] Form rejects bad email: `curl ... -d '{"email":"not-an-email"}'` returns `{"error":"invalid email"}`
- [ ] `/og-default.png` loads at <https://tracelane.dev/og-default.png>
- [ ] OG preview renders on Twitter Card Validator and LinkedIn Post Inspector
- [ ] Lighthouse 95+ across all four scores (run via Chrome DevTools)
- [ ] No external font fetches (DevTools Network tab → filter by Font, all should be `/fonts/*`)

---

## exporting emails for the launch

```bash
pnpm dlx wrangler d1 execute tracelane-notify --remote \
  --command="SELECT email, created_at, ip_country FROM notifications ORDER BY created_at" \
  --json > notifications-export.json
```

Run weekly. Don't email anyone until Jun 16 launch — single launch email only,
per the privacy promise in `/privacy`.

---

## subsequent deploys

After step 4, every `git push origin main` auto-deploys. No manual step.

```bash
git add .
git commit -m "feat: <what changed>"
git push
```

Cloudflare picks it up within 30 seconds. Build + deploy completes in ~90 seconds.

---

## troubleshooting

| symptom | fix |
|---|---|
| Pages build fails | Check `pnpm build` works locally. Verify `NODE_VERSION=20` env var is set. |
| Form returns 500 | D1 binding missing or `database_id` wrong in wrangler.toml. Re-check step 5. |
| Form returns 405 | You're sending GET instead of POST. Check the fetch in `/src/pages/index.astro`. |
| SSL not issuing | dashboard → SSL/TLS → set mode to **Full (strict)**. Wait 10 min. |
| OG image missing on socials | Verify <https://tracelane.dev/og-default.png> returns 200 OK. Some platforms cache OG, force refresh via their debug tool. |
| Lighthouse Performance <95 | Check Network tab for render-blocking resources. The CSS should inline; fonts should preload. |

---

## post-deploy checklist (this evening)

- [ ] Site is live at <https://tracelane.dev>
- [ ] Email forwarding works (`support@`, `security@`)
- [ ] Test email captured in D1
- [ ] Twitter Card Validator passes: <https://cards-dev.twitter.com/validator>
- [ ] LinkedIn Post Inspector passes: <https://www.linkedin.com/post-inspector/>
- [ ] Schema.org validator passes: <https://validator.schema.org/>
- [ ] Tell the Day 1 Claude smoke-test chat that landing is live, content engine can stop suppressing tracelane.dev references from Day 3 onward

Site goes live Friday May 22 evening IST. Day 3 of the content engine
(per `TRACELANE_CONTENT_MASTER.xlsx` v2) is the first day that mentions
`tracelane.dev` in published posts.
