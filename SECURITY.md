# Security Policy

## Reporting a vulnerability

Please report security issues privately via GitHub Security Advisories
("Report a vulnerability" tab) rather than opening a public issue.

We aim to acknowledge reports within 72 hours.

## Scope

BELENT CAD is a client-side architectural drafting tool. The optional Node
server (`server.ts`) proxies Google Gemini for AI features and is **not**
required to run the app: the static build ships with a deterministic,
offline parametric engine.

## Hardening notes

- No API keys are ever shipped to the browser. `GEMINI_API_KEY` is read
  server-side only, from `.env.local` / `.env`.
- All SVG/document export values are XML-escaped; file identifiers are
  sanitized before being written to DXF/IFC/OBJ.
- API payloads are size-bounded (10 MB) and `imageBase64` is length-checked.
- Error responses never echo internal error details to clients.
