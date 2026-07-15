#!/usr/bin/env bash
# pre-public-push.sh — banned-phrase gate for tracelane.dev site copy.
#
# Ported from tracelane-private (it only ever lived there). MUST run and PASS
# before every push to `main`: Cloudflare Pages auto-deploys main, so a bad
# push is LIVE immediately — there is no staging gate.
#
# Scope: shippable site copy only — src/**/*.astro + src/**/*.md(x).
# Internal working docs in the repo root (and README*) are deliberately NOT
# scanned: they legitimately quote the banned phrases they track, and they do
# not ship.
#
# Behaviour: prints file:line for every match and exits 1 on any hit; exits 0
# when clean. This is a syntactic guard only — it does NOT catch
# unbuilt-capability (C1/C2/C3) or stale-claim semantics. Those still require
# manual sign-off for capability/claim changes.

set -uo pipefail
cd "$(dirname "$0")/.." || exit 2

fail=0

# Collect shippable site copy.
mapfile -t FILES < <(find src -type f \( -name '*.astro' -o -name '*.md' -o -name '*.mdx' \) | sort)
if [ "${#FILES[@]}" -eq 0 ]; then
  echo "pre-public-push: no site-copy files found under src/ — aborting." >&2
  exit 2
fi

# report LABEL EXTENDED_REGEX [allowlisted_basename ...]
# Greps the banned regex across all site copy; drops hits in allowlisted files.
report() {
  local label="$1" regex="$2"; shift 2
  local allow=("$@")
  local hits
  hits="$(grep -HniE "$regex" "${FILES[@]}" 2>/dev/null || true)"
  [ -z "$hits" ] && return 0
  if [ "${#allow[@]}" -gt 0 ]; then
    local filtered="" line f a skip
    while IFS= read -r line; do
      [ -z "$line" ] && continue
      f="$(basename "${line%%:*}")"
      skip=0
      for a in "${allow[@]}"; do [ "$f" = "$a" ] && skip=1 && break; done
      [ "$skip" -eq 0 ] && filtered+="$line"$'\n'
    done <<< "$hits"
    hits="$(printf '%s' "$filtered" | sed '/^[[:space:]]*$/d')"
    [ -z "$hits" ] && return 0
  fi
  echo "✗ BANNED [$label]:"
  echo "$hits" | sed 's/^/    /'
  fail=1
}

# 1 — "tamper-proof" is a forbidden honesty-lock violation; copy must say "tamper-evident".
report "tamper-proof"     'tamper-proof'

# 2 — stale provider count. The real registry routes ~34; public claim is "30+".
report "35-providers"     '\b35\+? ?providers?\b'

# 3 — predictor overclaim (only 2 live signatures at V1, not the full predictive set).
report "12-predictors"    'all 12 predict|12 predictors'

# 4 — "unlimited seats" overclaim; Enterprise tier uses "custom seats".
report "unlimited-seats"  'unlimited seats'

# 5 — overclaim verbs. Tracelane FLAGS failures pre-flight; it does not "block"/"prevent"
#     them or claim to act "before they execute".
report "overclaim-verbs"  'blocks failures|prevents failures|before they execute'

# 6 — bare hard launch date (the C4 class: "ships Tue Jun 16, 2026"). No public hard dates.
#     changelog.astro is allowlisted: a changelog legitimately carries historical release dates.
report "hard-launch-date" 'ships (Mon|Tue|Wed|Thu|Fri|Sat|Sun)?[[:space:]]*[A-Za-z]+ [0-9]{1,2}, 2026' changelog.astro

# 8 — billing honesty. The "0.1 trace / failed-requests-unbilled" model is UNBUILT:
#     the code counts 1 trace per gateway call and increments the quota counter BEFORE
#     dispatch (so failures ARE counted). ADR-020 is the real, shipped model — 1 call =
#     1 trace, $1.20/10K overage above quota. Block the false claims so they can't return.
report "billing-0.1-trace" '0\.1 ?trace|counts? as 0\.1|failed requests? (aren.t|are not) billed'

# 7 — Rekor must read as roadmap, never as shipped/live. Allowed ONLY on a line that also
#     says "roadmap" or "planned".
rekor_hits="$(grep -HniE 'rekor' "${FILES[@]}" 2>/dev/null | grep -viE 'roadmap|planned' || true)"
if [ -n "$rekor_hits" ]; then
  echo "✗ BANNED [rekor-as-shipped] (allowed only adjacent to roadmap/planned):"
  echo "$rekor_hits" | sed 's/^/    /'
  fail=1
fi

if [ "$fail" -ne 0 ]; then
  echo ""
  echo "pre-public-push: FAILED — fix the lines above before pushing to main."
  exit 1
fi

echo "pre-public-push: PASS — no banned phrases in site copy (${#FILES[@]} files scanned)."
exit 0
