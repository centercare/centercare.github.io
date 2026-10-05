# رفيق (Rafeeq) — static mirror for GitHub Pages

Arabic RTL cancer-care companion platform, mirrored from https://cancare.grok.me and
published as a **client-only SPA** at the root of https://centercare.github.io/
(repo `Crecenter.github.io`, no base path).

- No login, no server: the care profile is stored in the browser's `localStorage` (`rafeeq-care-v1`).
- `index.html` / `404.html` / every route folder contain the same SPA shell; `404.html` is the
  deep-link fallback for dynamic routes (`/cancers/:slug`, `/meals/:slug`, `/learn/:stage/:step`, ...).
- Router bundle: `assets/index-CDjhILkx.js` (patched: `createRoot` instead of `hydrateRoot`, no SSR dehydration step).
