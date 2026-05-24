# B-023 — tracelane.dev marketing site retrofit

**Repo:** `C:\Users\Sanjeev\tracelane-site` (separate from `tracelane-private`)
**Remote:** `github.com/tracelane/site` (public)
**Stack:** Astro 5.18.1 + Tailwind v4 (Vite plugin) + Cloudflare Pages + Cloudflare Pages Functions
**Branch strategy:** Direct to `main`. Cloudflare Pages auto-deploys on push to `main` (~60s build).
**Working directory for this entire session:** `C:\Users\Sanjeev\tracelane-site`

---

## Context

This repo is the public marketing site at `https://tracelane.dev/`. It is **separate** from `tracelane-private` (the product code, located at `C:\Users\Sanjeev\Tracelane`). Do not touch `tracelane-private` in this session.

Two retrofits were shipped in `tracelane-private` on May 24, 2026:

1. **Pricing v2 retrofit** (commit `93d5787`) — honest seat caps, capped overage, retention tiers, anti-pattern handling
2. **LangSmith Engine response retrofit** (commit `7437a43`) — 5 new ADRs (023-027), banned-phrase enforcement, /vs landing pages on `apps/web/`, ARD spec drafted

The marketing site at `tracelane.dev` was NOT updated as part of either retrofit. It still carries:

- **Banned phrases** that violate ADR-021 + ADR-023 (e.g., "block agent failures before they execute")
- **Stale EU AI Act enforcement date** (Aug 2, 2026) — Digital Omnibus political agreement May 7, 2026 deferred Annex III obligations to **Dec 2, 2027** per ADR-025 research
- **No LangSmith Engine narrative** — Engine launched May 13, 2026 and is now the dominant competitor positioning question; the existing FAQ predates it
- **Verbatim banned product-name** ("Prompt Promotion + Eval Gates + Auto-Rollback") in the pricing tier descriptions per ADR-023

This session brings the marketing site into compliance with the locked ADRs and aligns its narrative with `apps/web/` shipped today.

---

## Mandatory pre-flight (Phase 0) — read-only verification

Before any file edit, run:

```powershell
cd C:\Users\Sanjeev\tracelane-site
git status
git log --oneline -5
git rev-list --left-right --count origin/main...HEAD
```

**Expected:** clean tree, `origin/main` and `HEAD` in sync, `0  0`.

If clean tree is not confirmed, STOP and surface what's outstanding before proceeding.

Then verify file encoding is sound (PowerShell's default code page can display UTF-8 incorrectly; the on-disk file may still be fine):

```powershell
$content = Get-Content src\pages\index.astro -Raw -Encoding UTF8
$mojibake = $content | Select-String -Pattern "Â·|â€™|â†'|â€"|âœ" -SimpleMatch
if ($mojibake) { Write-Host "MOJIBAKE PRESENT — STOP" } else { Write-Host "ENCODING CLEAN" }
```

If `MOJIBAKE PRESENT`, STOP and surface to founder. The repo file is corrupted on disk and needs separate cleanup before substantive edits. Do not proceed with the retrofit.

If `ENCODING CLEAN`, proceed.

---

## Scope (5 commits, no squash — keep separate for diff readability)

### Commit 1 — `fix(copy): remove ADR-021 + ADR-023 banned phrases from index.astro`

Surgical exact-string replacements in `src/pages/index.astro`:

**1a. Hero `<p>` paragraph.**

Find this exact string:

```
      Rust gateway across 35 providers. Full-fidelity OTel observability. Sub-50ms inline guardrails that block agent failures before they execute. Every span signed, Merkle-chained, anchored to Sigstore Rekor.
```

Replace with:

```
      Rust gateway across 35 providers. Full-fidelity OTel observability. Predictive pre-flight guardrails enforce policy at the gateway, p99 sub-50ms. Every span signed, Merkle-chained, anchored to Sigstore Rekor.
```

**1b. "What it is" section §03 guardrails description.**

Find this exact string:

```
          12 predictors run inline before the gateway forwards. Sub-50ms p99 on Hetzner CCX13 CPU. Blocks poisoned MCP tools, infinite loops, cost runaways, PII leaks, jailbreak attempts. Fail-open with configurable timeout.
```

Replace with:

```
          12 predictors run inline before the gateway forwards. Sub-50ms p99 on Hetzner CCX13 CPU. Flags poisoned MCP tools, infinite loops, cost runaways, PII leaks, jailbreak attempts in the predictive pre-flight pass. Fail-open with configurable timeout.
```

**1c. Pricing Builder tier feature line.**

Find this exact string:

```
          <li>Prompt promotion (read-only)</li>
```

Replace with:

```
          <li>Predictive pre-flight history (read-only)</li>
```

**1d. Pricing Team tier feature line.**

Find this exact string:

```
          <li>Eval gates + auto-rollback</li>
```

Replace with:

```
          <li>Predictive pre-flight + tamper-evident promotion record</li>
```

**Commit message:**
```
fix(copy): remove ADR-021 + ADR-023 banned phrases from index.astro

- Hero: "block agent failures before they execute" → "enforce policy at the gateway, p99 sub-50ms"
- §03 guardrails: "Blocks poisoned MCP tools..." → "Flags... in the predictive pre-flight pass"
- Pricing Builder: "Prompt promotion (read-only)" → "Predictive pre-flight history (read-only)"
- Pricing Team: "Eval gates + auto-rollback" → "Predictive pre-flight + tamper-evident promotion record"

Aligns marketing site with apps/web/ shipped commits 93d5787 (pricing v2)
and 7437a43 (LangSmith Engine response) on tracelane-private main.

Refs: ADR-021, ADR-023, B-023
```

---

### Commit 2 — `fix(copy): correct EU AI Act enforcement date (Aug 2, 2026 → Dec 2, 2027 per Digital Omnibus)`

The Digital Omnibus political agreement (May 7, 2026) deferred Annex III high-risk AI Act obligations from Aug 2, 2026 to **Dec 2, 2027**. The marketing site still treats Aug 2, 2026 as the enforcement date, which is factually wrong and creates a false urgency narrative that contradicts ADR-025.

**2a. Audit ledger sub-grid "eu ai act" cell.**

Find this exact string:

```
        <p class="mt-3 text-fg-muted">
          Article 12 export pack — full audit trail for high-risk AI systems. Required Aug 2, 2026.
        </p>
```

Replace with:

```
        <p class="mt-3 text-fg-muted">
          Article 12 export pack — full audit trail for high-risk AI systems. Annex III enforcement deferred to Dec 2, 2027 (Digital Omnibus, May 7, 2026); audit ledger ships at V1.
        </p>
```

**2b. Pricing add-on availability badge.**

Find this exact string:

```
            <span class="font-mono text-xs text-fg-dim lowercase tracking-wider px-2 py-0.5 border border-border-strong rounded-sm">available aug 2, 2026</span>
```

Replace with:

```
            <span class="font-mono text-xs text-fg-dim lowercase tracking-wider px-2 py-0.5 border border-border-strong rounded-sm">ships at v1</span>
```

**2c. Pricing add-on description.**

Find this exact string:

```
          <p class="mt-2 text-sm text-fg-muted">
            $999/mo add-on. EU AI Act Article 12 export pack, India DPDP Phase II compliance pack, HIPAA BAA. Cryptographic audit ledger ships at V1; compliance packs available Aug 2, 2026 (EU AI Act Article 12 enforcement).
          </p>
```

Replace with:

```
          <p class="mt-2 text-sm text-fg-muted">
            $999/mo add-on. Cryptographic audit ledger ships at V1 — Ed25519-signed, Merkle-chained, Sigstore Rekor anchored. EU AI Act Article 12 export pack, India DPDP Phase II compliance pack, and HIPAA BAA available at V1. EU AI Act Annex III enforcement deferred to Dec 2, 2027 (Digital Omnibus, May 7, 2026).
          </p>
```

**2d. FAQ EU AI Act answer.**

Find this exact string:

```
        <p class="mt-4 text-fg-muted leading-relaxed">
          The Tamper-Evident Agent Ledger add-on ($999/mo) ships in two phases. The cryptographic audit ledger (Ed25519-signed, Merkle-chained, Sigstore Rekor anchored) is available at V1 launch June 16, 2026. The compliance packs (EU AI Act Article 12 export pack, India DPDP Phase II compliance pack, HIPAA BAA) ship August 2, 2026 — the Article 12 enforcement date — giving regulated buyers the documents in time for compliance review.
        </p>
```

Replace with:

```
        <p class="mt-4 text-fg-muted leading-relaxed">
          The Tamper-Evident Agent Ledger add-on ($999/mo) ships at V1 launch June 16, 2026. The cryptographic audit ledger (Ed25519-signed, Merkle-chained, Sigstore Rekor anchored), EU AI Act Article 12 export pack, India DPDP Phase II compliance pack, and HIPAA BAA are all available at V1. EU AI Act Annex III high-risk obligations were originally scheduled for Aug 2, 2026; the Digital Omnibus political agreement (May 7, 2026) deferred enforcement to Dec 2, 2027. The ledger ships now so regulated buyers can run on it under voluntary commitments and have years of audit history in place before binding enforcement.
        </p>
```

**Commit message:**
```
fix(copy): correct EU AI Act enforcement date per Digital Omnibus

Digital Omnibus political agreement (May 7, 2026) deferred Annex III
high-risk AI Act obligations from Aug 2, 2026 to Dec 2, 2027.
Marketing site still presented Aug 2, 2026 as the enforcement date,
creating a false-urgency narrative that contradicts ADR-025.

- Audit ledger eu-ai-act sub-grid cell
- Pricing add-on availability badge: "available aug 2, 2026" → "ships at v1"
- Pricing add-on description
- FAQ EU AI Act Q&A

Refs: ADR-025, B-023
```

---

### Commit 3 — `feat(copy): LangSmith Engine competitor narrative in FAQ`

The existing FAQ predates Engine (launched May 13, 2026). Update the Helicone/LangSmith comparison Q and add a dedicated Engine Q.

**3a. Update existing competitor Q.**

Find this exact string:

```
      <details class="border-b border-border pb-6 group">
        <summary class="cursor-pointer font-semibold text-lg flex items-center justify-between text-fg">
          How is Tracelane different from Helicone or LangSmith?
          <span class="text-fg-dim group-open:rotate-45 transition-transform">+</span>
        </summary>
        <p class="mt-4 text-fg-muted leading-relaxed">
          Tracelane unifies the gateway, observability, and predictive guardrail layers in one Rust binary. Helicone, Langfuse, and LangSmith are observability-first — you bring your own gateway and your own guardrails. Tracelane is also Apache 2.0 with a published self-host path; Helicone's gateway is GPL-3.0 (corporate-procurement-hostile), Arize Phoenix is ELv2 (no SaaS resale), and LangSmith is closed-source.
        </p>
      </details>
```

Replace with:

```
      <details class="border-b border-border pb-6 group">
        <summary class="cursor-pointer font-semibold text-lg flex items-center justify-between text-fg">
          How is Tracelane different from Helicone, LangSmith, or Langfuse?
          <span class="text-fg-dim group-open:rotate-45 transition-transform">+</span>
        </summary>
        <p class="mt-4 text-fg-muted leading-relaxed">
          Tracelane unifies the gateway, observability, predictive guardrail, and tamper-evident audit ledger in one Rust binary. Helicone, Langfuse, and LangSmith are observability-first — you bring your own gateway and your own guardrails. Tracelane is Apache 2.0 core with a published self-host path; Helicone's gateway is GPL-3.0 (corporate-procurement-hostile), Arize Phoenix is ELv2 (no SaaS resale), and LangSmith is closed-source. Tracelane's audit ledger anchors to Sigstore Rekor — no competitor in this category offers cryptographic audit log integrity at the trace level.
        </p>
      </details>
```

**3b. Insert new FAQ Q immediately AFTER the updated competitor Q above.**

Find this exact string (this is the `<details>` block that currently follows the competitor Q — the "Is Tracelane really open source?" Q):

```
      <details class="border-b border-border pb-6 group">
        <summary class="cursor-pointer font-semibold text-lg flex items-center justify-between text-fg">
          Is Tracelane really open source?
```

Replace with (NEW Q inserted BEFORE the existing `<details>` block):

```
      <details class="border-b border-border pb-6 group">
        <summary class="cursor-pointer font-semibold text-lg flex items-center justify-between text-fg">
          What about LangSmith Engine?
          <span class="text-fg-dim group-open:rotate-45 transition-transform">+</span>
        </summary>
        <p class="mt-4 text-fg-muted leading-relaxed">
          LangSmith Engine (May 13, 2026) clusters production failures after they happen and drafts pull requests to fix them. Tracelane's predictive pre-flight guardrails flag the same failure modes at the gateway before the call reaches the provider — sub-50ms p99 on commodity CPU. Engine is locked to the LangSmith trace surface and LangChain-managed inference keys per LangChain's terms of service; Tracelane is neutral OTel ingest with 0% BYOK markup across 35 providers. Different layer of the agent reliability stack. <a href="/vs/langsmith-engine" class="underline decoration-fg-subtle hover:decoration-fg transition-colors">Detailed comparison →</a>
        </p>
      </details>

      <details class="border-b border-border pb-6 group">
        <summary class="cursor-pointer font-semibold text-lg flex items-center justify-between text-fg">
          Is Tracelane really open source?
```

**Commit message:**
```
feat(copy): LangSmith Engine competitor narrative in FAQ

LangSmith Engine launched May 13, 2026. Existing FAQ predates it.

- Updated "Helicone or LangSmith" Q to include Langfuse and clarify
  Tracelane unifies gateway + observability + guardrail + audit ledger
- Added new Q: "What about LangSmith Engine?" with terse pre-flight vs
  post-failure-clustering positioning, links to /vs/langsmith-engine

Refs: ADR-023, ADR-026, B-023
```

---

### Commit 4 — `feat(pages): /vs/langsmith-engine landing page`

Create `src/pages/vs/langsmith-engine.astro` (requires creating `src/pages/vs/` directory).

Use `Base.astro` layout for consistency. Mirror the structural tokens from `index.astro` (container, py-24, border-t border-border, text-fg, text-fg-muted, font-mono, bg-bg-elevated, rounded-md). Do NOT introduce new Tailwind utility classes or color tokens — reuse the existing global.css design tokens.

File contents:

```astro
---
import Base from "../../layouts/Base.astro";
---

<Base title="Tracelane vs LangSmith Engine — predictive pre-flight vs post-failure clustering">
  {/* ===== Hero ===== */}
  <section class="container py-24 sm:py-32">
    <p class="font-mono text-sm text-fg-subtle mb-8 tracking-wide lowercase">
      tracelane vs langsmith engine
    </p>
    <h1 class="text-[2.5rem] sm:text-5xl md:text-6xl font-semibold tracking-tight leading-[1.05] text-fg max-w-4xl">
      Predict failures pre-flight, or cluster them post-failure.
    </h1>
    <p class="mt-8 text-lg sm:text-xl text-fg-muted max-w-3xl leading-relaxed">
      LangSmith Engine (May 13, 2026) clusters production failures after they happen, files pull requests, and bills against the LangSmith plan. Tracelane flags the same failure classes inline at the gateway, sub-50ms p99, before the call reaches the provider. Different layer. Different commercial posture.
    </p>
  </section>

  {/* ===== TL;DR ===== */}
  <section class="container py-16 border-t border-border">
    <p class="font-mono text-xs text-fg-dim mb-4 tracking-wider lowercase">tl;dr</p>
    <ul class="space-y-3 text-fg-muted max-w-3xl leading-relaxed">
      <li>— LangSmith Engine is reactive: triage after failure has shipped.</li>
      <li>— Tracelane is predictive: flag the failure class inline at the gateway, sub-50ms p99.</li>
      <li>— Engine is locked to the LangSmith trace surface and LangChain-managed inference keys per ToS. Tracelane is neutral OTel ingest with BYOK 0% markup across 35 providers.</li>
      <li>— Engine adds value on top of an existing LangSmith deployment. Tracelane replaces LiteLLM + Helicone/Langfuse + a custom guardrail layer with one Rust binary.</li>
      <li>— Both are useful. They sit at different layers of the agent reliability stack.</li>
    </ul>
  </section>

  {/* ===== Capability matrix ===== */}
  <section class="container py-24 border-t border-border">
    <h2 class="text-3xl sm:text-4xl font-semibold tracking-tight text-fg">Capability comparison.</h2>
    <p class="mt-4 text-lg text-fg-muted max-w-2xl">Based on LangSmith Engine launch announcement (May 13, 2026) and LangChain documentation as of May 24, 2026.</p>

    <div class="mt-12 overflow-x-auto">
      <table class="w-full text-left border-collapse text-sm">
        <thead>
          <tr class="border-b border-border-strong">
            <th class="py-4 pr-6 font-mono text-xs text-fg-dim lowercase tracking-wider">capability</th>
            <th class="py-4 pr-6 font-mono text-xs text-fg-dim lowercase tracking-wider">tracelane v1</th>
            <th class="py-4 font-mono text-xs text-fg-dim lowercase tracking-wider">langsmith engine</th>
          </tr>
        </thead>
        <tbody class="text-fg-muted">
          <tr class="border-b border-border">
            <td class="py-4 pr-6 text-fg">Failure handling timing</td>
            <td class="py-4 pr-6">Pre-flight inline at gateway, p99 sub-50ms</td>
            <td class="py-4">Post-failure clustering, async triage</td>
          </tr>
          <tr class="border-b border-border">
            <td class="py-4 pr-6 text-fg">LLM provider lock-in</td>
            <td class="py-4 pr-6">None — 35 providers, BYOK 0% markup</td>
            <td class="py-4">LangChain-managed inference keys per ToS</td>
          </tr>
          <tr class="border-b border-border">
            <td class="py-4 pr-6 text-fg">Trace surface</td>
            <td class="py-4 pr-6">OTel GenAI semconv, neutral ingest</td>
            <td class="py-4">LangSmith proprietary trace format</td>
          </tr>
          <tr class="border-b border-border">
            <td class="py-4 pr-6 text-fg">License</td>
            <td class="py-4 pr-6">Apache 2.0 core / Tracelane Enterprise / CC0 spec</td>
            <td class="py-4">Closed-source SaaS</td>
          </tr>
          <tr class="border-b border-border">
            <td class="py-4 pr-6 text-fg">Self-host path</td>
            <td class="py-4 pr-6">Docker Compose, Helm, $5–15/mo VPS</td>
            <td class="py-4">Hosted only (LangSmith Cloud / Enterprise)</td>
          </tr>
          <tr class="border-b border-border">
            <td class="py-4 pr-6 text-fg">Audit log integrity</td>
            <td class="py-4 pr-6">Ed25519-signed, Merkle-chained, Sigstore Rekor anchored</td>
            <td class="py-4">Application-layer trace storage; no cryptographic anchor</td>
          </tr>
          <tr class="border-b border-border">
            <td class="py-4 pr-6 text-fg">EU AI Act Article 12 export pack</td>
            <td class="py-4 pr-6">$999/mo add-on, available at V1 (Jun 16, 2026)</td>
            <td class="py-4">Not in launch announcement</td>
          </tr>
          <tr class="border-b border-border">
            <td class="py-4 pr-6 text-fg">Gateway included</td>
            <td class="py-4 pr-6">Yes — Rust gateway, 35 providers, p99 25ms overhead</td>
            <td class="py-4">No — assumes you bring your own (or LangChain's)</td>
          </tr>
          <tr>
            <td class="py-4 pr-6 text-fg">Commercial model</td>
            <td class="py-4 pr-6">Open-core + usage-based hosted, MoR via Polar.sh</td>
            <td class="py-4">LangSmith plan add-on (Developer/Plus/Enterprise)</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>

  {/* ===== When to choose which ===== */}
  <section class="container py-24 border-t border-border">
    <h2 class="text-3xl sm:text-4xl font-semibold tracking-tight text-fg">When to choose which.</h2>

    <div class="mt-12 grid gap-6 md:grid-cols-2">
      <article class="rounded-md border border-border bg-bg-elevated p-8">
        <p class="font-mono text-xs text-fg-dim mb-3 lowercase tracking-wider">choose tracelane if</p>
        <ul class="space-y-3 text-fg-muted text-sm leading-relaxed">
          <li>— You want predictive prevention, not post-failure triage</li>
          <li>— You need BYOK 0% markup across multiple providers</li>
          <li>— You need neutral OTel ingest, not a proprietary trace surface</li>
          <li>— You need a cryptographic audit ledger for EU AI Act / DPDP / HIPAA</li>
          <li>— You want Apache 2.0 core with a self-host path</li>
          <li>— You don't already run LangSmith and don't want to adopt it just to get Engine</li>
        </ul>
      </article>

      <article class="rounded-md border border-border bg-bg-elevated p-8">
        <p class="font-mono text-xs text-fg-dim mb-3 lowercase tracking-wider">choose langsmith engine if</p>
        <ul class="space-y-3 text-fg-muted text-sm leading-relaxed">
          <li>— You already run LangSmith and your traces are there</li>
          <li>— You're committed to LangChain-managed inference keys</li>
          <li>— Post-failure clustering and PR drafting is your priority workflow</li>
          <li>— You don't need a tamper-evident audit ledger</li>
          <li>— You're not regulated under EU AI Act Annex III</li>
          <li>— A closed-source hosted SaaS is acceptable in your procurement review</li>
        </ul>
      </article>
    </div>

    <p class="mt-12 text-fg-muted max-w-3xl leading-relaxed">
      These tools are not mutually exclusive at the architectural layer. Tracelane sits at the gateway and trace ingest layer. Engine sits on top of an existing trace store. Some teams will run both — Tracelane to flag failures pre-flight and to produce the cryptographic audit ledger, LangSmith Engine to cluster the failures that escape and draft fixes.
    </p>
  </section>

  {/* ===== CTA ===== */}
  <section class="container py-24 border-t border-border">
    <h2 class="text-3xl sm:text-4xl font-semibold tracking-tight text-fg">
      Tracelane V1 ships Tue Jun 16, 2026.
    </h2>
    <p class="mt-4 text-lg text-fg-muted max-w-2xl">
      Open core. Apache 2.0. Self-host or use the free hosted tier.
    </p>
    <div class="mt-8 flex flex-col sm:flex-row gap-4">
      <a href="/#notify" class="btn-primary lowercase">get notified at launch</a>
      <a href="/" class="btn-secondary lowercase">back to home →</a>
    </div>
  </section>
</Base>
```

**Verify after creation:**

```powershell
# Astro check passes
pnpm exec astro check
# OR: pnpm build
```

If `astro check` fails on this new page, STOP and surface the exact errors. Most likely cause: `Base.astro` does not accept a `title` prop. If so, fix by either:
(a) checking what props `Base.astro` actually accepts (`Get-Content src\layouts\Base.astro`)
(b) removing the `title` prop from the new page and using a default

Do NOT proceed to Commit 5 until Commit 4 builds clean.

**Commit message:**
```
feat(pages): /vs/langsmith-engine landing page

LangSmith Engine launched May 13, 2026. Public marketing site needed a
detailed comparison page beyond the FAQ entry.

- Hero: predictive pre-flight vs post-failure clustering positioning
- TL;DR (5 bullets) for fast scan
- Capability matrix (9 rows) comparing V1 features
- "When to choose which" both/and framing (not adversarial)
- CTA back to home/notify form

Reuses existing global.css design tokens. No new Tailwind utilities
introduced. Astro check passes. Sitemap auto-includes the new route.

Refs: ADR-023, ADR-026, B-023
```

---

### Commit 5 — `chore(seo): sitemap + robots verification, build green`

This is a sanity-check commit that runs the production build and verifies the new page is discoverable.

**5a. Run production build locally.**

```powershell
pnpm install --frozen-lockfile
pnpm build
```

Expected output:
- `astro check` passes (0 errors, 0 warnings)
- `astro build` completes
- `dist/vs/langsmith-engine/index.html` exists
- `dist/sitemap-0.xml` includes `https://tracelane.dev/vs/langsmith-engine/`

Verify:

```powershell
Test-Path dist\vs\langsmith-engine\index.html
Get-Content dist\sitemap-0.xml | Select-String -Pattern "langsmith-engine"
```

Both should return positive results. If sitemap doesn't pick up the new page, check `astro.config.ts` — `@astrojs/sitemap` should auto-discover by default. If it doesn't, surface and STOP.

**5b. Banned phrase grep across entire src/.**

```powershell
Get-ChildItem -Recurse src -Filter *.astro | Select-String -Pattern "block.+failures|before they execute|before they happen|Prompt Promotion.+Eval Gates.+Auto-Rollback|stop failures|prevent failures|tamper-proof|100% reliable|100% accurate|100% safe|100% prevention" -SimpleMatch
```

Expected: empty result (0 matches).

If any matches surface, STOP — there are leftover banned phrases. Do not push.

**5c. Stale date grep.**

```powershell
Get-ChildItem -Recurse src -Filter *.astro | Select-String -Pattern "aug 2, 2026|august 2, 2026|August 2, 2026" -SimpleMatch
```

Expected: empty result. The Aug 2, 2026 references were all retrofitted in Commit 2.

If any matches surface, STOP and add them to Commit 2 with an amend.

**5d. No changes to commit if all checks green — Commit 5 is just verification.**

Skip if `git status` shows nothing to commit. Document the verification results in the session report instead.

If `dist/` is tracked in git (check `.gitignore`), do NOT commit `dist/` changes. The build is local-only; Cloudflare Pages rebuilds from `main` on push.

**Commit message (only if there's something to commit, otherwise skip Commit 5 entirely):**
```
chore(seo): verify sitemap includes /vs/langsmith-engine

Production build green. Sitemap auto-discovered the new route.
Banned phrase grep returns 0 matches across all src/*.astro.
Stale Aug 2, 2026 date references all retrofitted in Commit 2.

Refs: B-023
```

---

## Pre-push verifications (all must pass)

Run these BEFORE pushing to origin:

```powershell
# 1. Working tree clean
git status

# 2. Commits ahead of origin
git log --oneline origin/main..HEAD
git rev-list --left-right --count origin/main...HEAD

# 3. Production build green
pnpm build

# 4. Banned phrase grep zero matches
Get-ChildItem -Recurse src -Filter *.astro | Select-String -Pattern "block.+failures|before they execute|before they happen|Prompt Promotion.+Eval Gates.+Auto-Rollback|stop failures|prevent failures|tamper-proof|100% reliable|100% accurate|100% safe|100% prevention" -SimpleMatch

# 5. Stale Aug 2 date grep zero matches
Get-ChildItem -Recurse src -Filter *.astro | Select-String -Pattern "aug 2, 2026|august 2, 2026|August 2, 2026" -SimpleMatch

# 6. New page exists in dist
Test-Path dist\vs\langsmith-engine\index.html

# 7. Sitemap includes new page
Get-Content dist\sitemap-0.xml | Select-String -Pattern "langsmith-engine"
```

Report all 7 results in a table. PAUSE for explicit "push" from founder before `git push origin main`.

DO NOT auto-push. DO NOT push on green.

---

## After push (founder will handle, not Claude Code)

1. Cloudflare Pages auto-deploys ~60s after push to `main`
2. Founder verifies live at:
   - `https://tracelane.dev/` (hero phrase, §03 guardrails copy, pricing tiers, audit ledger, FAQ)
   - `https://tracelane.dev/vs/langsmith-engine/` (new page renders, internal links work)
3. Spot-check OG image, mobile responsive, dark/light mode if applicable
4. Verify Cloudflare Pages build log shows no errors

If anything live looks broken, founder will report back for a hotfix commit.

---

## Risk register

| Risk | Mitigation |
|---|---|
| `Base.astro` doesn't accept `title` prop, Commit 4 fails astro check | Inspect `Base.astro` first; either pass nothing or fix Base to accept optional title |
| Mojibake on disk (Phase 0 check fails) | STOP entirely. Founder needs to re-clone or fix encoding separately before this retrofit. |
| pnpm install pulls newer transitive deps that break build | Use `--frozen-lockfile`. If still fails, surface lockfile drift. |
| Cloudflare Pages build cache stale, build green locally but breaks on Cloudflare | Cloudflare Pages does fresh installs; lockfile-pinned versions identical. Low risk. |
| /vs/ subdirectory doesn't get sitemapped | `@astrojs/sitemap` auto-discovers; Commit 5 grep verifies. If missing, surface. |
| Tailwind v4 utility classes used in new page that don't exist in global.css | Reused existing tokens from index.astro only; no new utilities introduced. |
| Encoding correction needed if Phase 0 surfaces mojibake | Out of scope this session — founder handles separately |

---

## What this session does NOT do

- Does NOT touch `tracelane-private` repo at all (different repo, different remote)
- Does NOT regenerate OG image (graphic design work, deferred to post-launch)
- Does NOT add /vs/litellm, /vs/helicone, /vs/portkey landing pages (only Engine is launch-critical per ADR-026)
- Does NOT modify notify-list.json, wrangler.toml, _headers, or functions/api/notify.ts
- Does NOT modify Cloudflare Pages settings, custom domains, DNS, or deploy hooks
- Does NOT change pricing structure — only relabels feature names per ADR-023 banned-phrase compliance
- Does NOT add new dependencies to package.json (zero new deps)
- Does NOT auto-push — paused for explicit founder "push" confirmation
- Does NOT create a PR — direct to main since marketing site is solo-author and Cloudflare Pages auto-deploys on main

---

## End state on success

- 4 or 5 commits on `main` (5 only if there's something to commit at Commit 5; usually skipped)
- `origin/main` and `HEAD` ahead by 4 commits before push, `0  0` after push
- `src/pages/index.astro` retrofitted: hero, §03 guardrails, pricing tiers, audit ledger sub-grid, pricing add-on, FAQ all aligned with ADR-021/023/025/026
- New file `src/pages/vs/langsmith-engine.astro` with full competitor comparison
- Sitemap auto-includes the new page
- Banned phrase grep returns 0 matches
- Stale Aug 2, 2026 date grep returns 0 matches
- `pnpm build` green
- Cloudflare Pages will rebuild and live-deploy ~60s after push (post-session)

---

## Session report format

At the end, provide:

1. Verification matrix (all 7 pre-push checks with green/red)
2. `git log --oneline origin/main..HEAD`
3. `git diff --stat origin/main..HEAD`
4. List of files touched
5. Any anomalies surfaced (Base.astro prop issues, mojibake, lockfile drift, etc.)
6. Confirmation that no push happened — paused for founder "push" command

Then STOP. Wait for founder.
