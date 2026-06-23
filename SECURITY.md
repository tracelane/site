# Security Policy

## Reporting a Vulnerability

Please **do not** open a public issue for security vulnerabilities.

Instead, report privately via one of:

- **GitHub Private Vulnerability Reporting** — use the **"Report a vulnerability"**
  button under the repository's **Security** tab (preferred).
- **Email** — [support@tracelane.dev](mailto:support@tracelane.dev)

Please include:

- A description of the issue and its impact
- Steps to reproduce (proof-of-concept if possible)
- Affected versions / URLs

We aim to acknowledge reports within **3 business days** and to provide a
remediation timeline after triage. Please give us a reasonable window to
release a fix before any public disclosure.

## Scope

This repository contains the source for the public marketing site
(`tracelane.dev`). For vulnerabilities in the Tracelane product itself, see the
security contact published at <https://tracelane.dev/security>.

## Secrets

This repo is public. Never commit credentials. Local secrets belong in
`.env*` / `.dev.vars` (already git-ignored); deployment secrets live in the
Cloudflare and GitHub secret stores, not in the codebase.
