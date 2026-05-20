# contributing

Most contributions belong in the product repo:
**[tracelane/tracelane](https://github.com/tracelane/tracelane)**.

This repo is for the marketing site only.

## bug fixes + copy fixes

1. Open an issue first to confirm scope.
2. Fork, branch from `main`, keep the change small.
3. Run `pnpm build` locally to catch type errors.
4. Open a PR. Include before/after screenshots if visual.

## design principles (non-negotiable)

- Lowercase everywhere except acronyms, license names, third-party brands.
- No accent color. Monochrome only.
- Self-hosted fonts. No external CDN font fetches.
- No JavaScript frameworks. Inline `<script>` only.
- No third-party trackers. Cloudflare Web Analytics only.
- No testimonials, customer logos, or founder photos.

## what we won't merge

- New color tokens.
- Title-case headings.
- Analytics SDKs (Plausible JS, Google Analytics, Segment, HubSpot, etc.).
- Cookie banners (we don't set cookies, so there's nothing to consent to).
- Carousel components, exit-intent modals, live chat widgets.
- Marketing automation integrations.

## code of conduct

Be a professional. Disagree on substance. Don't make it personal.

## license

By contributing, you agree your contribution will be licensed under MIT (code)
or CC-BY-4.0 (content) — see [LICENSE](./LICENSE).
