# tracelane-site

Marketing site for Tracelane — **predictive reliability for AI agents**.

Live at <https://tracelane.dev>. V1 ships Tuesday, June 16, 2026.

## stack

- [Astro 5](https://astro.build) static site generator
- [Tailwind 4](https://tailwindcss.com) (via `@tailwindcss/vite`)
- [Cloudflare Pages](https://pages.cloudflare.com) hosting
- [Cloudflare D1](https://developers.cloudflare.com/d1/) (notify email capture)
- Self-hosted Inter + JetBrains Mono (WOFF2 subset)
- Zero JavaScript frameworks. Inline `<script>` only for the notify form.

## design

Pure monochrome. Lowercase. No accent color. Hierarchy through type size, weight, and grey stops. Reference: Linear, Vercel, Resend, Cursor, Jenova.

## develop

```bash
pnpm install
pnpm dev          # http://localhost:4321
pnpm build        # outputs to dist/
pnpm preview      # preview the production build
```

Requires Node 20+ and pnpm 9+.

## deploy

See [`README-DEPLOY.md`](./README-DEPLOY.md) for the Cloudflare Pages + D1 setup.

## license

- Site code: [MIT](./LICENSE)
- Site content (copy, design): [CC-BY-4.0](./LICENSE)
- The Tracelane product itself is Apache 2.0 — see [tracelane/tracelane](https://github.com/tracelane/tracelane).

## contribute

This is the marketing site. For most contributions, the product repo at
[tracelane/tracelane](https://github.com/tracelane/tracelane) is the right
place. For site bugs or copy fixes, see [`CONTRIBUTING.md`](./CONTRIBUTING.md).
