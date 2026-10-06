# رفيق (Rafeeq) — GitHub Pages

Arabic-first cancer-care companion, published at https://centercare.github.io/
(org `centercare`, repo `centercare.github.io`).

## Languages

- **Arabic (default)** — primary UI; copy polished for clearer MSA.
- **English** and **Urdu** — via the language switcher (top corner). Preference is stored in `localStorage` (`rafeeq-locale`).
- Routes and URLs are unchanged; only visible copy and `lang`/`dir` switch.

Dictionaries and runtime live under `assets/i18n/` (`boot.js`, `runtime.js`, `en.json`, `ur.json`, `ar-improve.json`).

## Notes

- No login/server: care profile in `localStorage` (`rafeeq-care-v1`).
- SPA shell is duplicated into route folders; `404.html` is the deep-link fallback.
- `/herbs/` is a separate static page and also includes the language switcher.
