/*! Rafeeq i18n: AR (default) + EN + UR. Preserves routes; switches copy + dir. */
(function () {
  const KEY = "rafeeq-locale";
  const META = {
    ar: { lang: "ar", dir: "rtl", label: "العربية", font: null },
    en: { lang: "en", dir: "ltr", label: "English", font: null },
    ur: { lang: "ur", dir: "rtl", label: "اردو", font: "ur" },
  };
  const TITLES = {
    ar: {
      home: "رفيق — منصة رعاية مرضى السرطان ومرافقيهم",
      herbs: "باب الأعشاب والمكملات — رفيق",
    },
    en: {
      home: "Rafeeq — Care platform for people with cancer and caregivers",
      herbs: "Herbs & supplements — Rafeeq",
    },
    ur: {
      home: "رفیق — کینسر کے مریضوں اور نگہداشت کرنے والوں کے لیے پلیٹ فارم",
      herbs: "جڑی بوٹیاں اور سپلیمنٹس — رفیق",
    },
  };
  const DESCS = {
    ar: "منصة تساعد مريض السرطان ومرافقيه على تنظيم الطعام والحركة والمتابعة والدعم النفسي في مكان واحد.",
    en: "A platform that helps people with cancer and their caregivers organize food, movement, follow-up, and emotional support in one place.",
    ur: "ایک پلیٹ فارم جو کینسر کے مریض اور نگہداشت کرنے والوں کو کھانا، حرکت، فالو اپ اور جذباتی سہارا ایک جگہ منظم کرنے میں مدد دیتا ہے۔",
  };

  let locale = localStorage.getItem(KEY) || "ar";
  if (!META[locale]) locale = "ar";
  let maps = { en: {}, ur: {}, ar: {} }; // ar = improved replacements from original keys
  let ready = false;
  let applying = false;

  function loadJSON(url) {
    return fetch(url, { cache: "force-cache" }).then((r) => (r.ok ? r.json() : {}));
  }

  function setDocumentLocale(loc) {
    const m = META[loc] || META.ar;
    const html = document.documentElement;
    html.lang = m.lang;
    html.dir = m.dir;
    html.dataset.locale = loc;
    // Title / description for home & herbs shells
    const path = location.pathname.replace(/\/+$/, "") || "/";
    const isHerbs = path === "/herbs" || path.startsWith("/herbs/");
    const pack = TITLES[loc] || TITLES.ar;
    document.title = isHerbs ? pack.herbs : pack.home;
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", DESCS[loc] || DESCS.ar);
    // Urdu-friendly font
    let link = document.getElementById("rafeeq-ur-font");
    if (m.font === "ur") {
      if (!link) {
        link = document.createElement("link");
        link.id = "rafeeq-ur-font";
        link.rel = "stylesheet";
        link.href =
          "https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;600;700&display=swap";
        document.head.appendChild(link);
      }
      html.style.setProperty("--rafeeq-font", '"Noto Nastaliq Urdu", "IBM Plex Sans Arabic", sans-serif');
      document.body && (document.body.style.fontFamily = "var(--rafeeq-font)");
    } else {
      html.style.removeProperty("--rafeeq-font");
      if (document.body) document.body.style.fontFamily = "";
    }
  }

  function lookup(text) {
    if (!text) return null;
    if (locale === "ar") {
      return maps.ar[text] || null; // improved Arabic only
    }
    const dict = maps[locale] || {};
    if (dict[text]) return dict[text];
    // if Arabic was improved in source, also try reverse via ar map values as keys
    const improved = maps.ar[text];
    if (improved && dict[improved]) return dict[improved];
    return null;
  }

  function translateString(s) {
    if (!s || typeof s !== "string") return s;
    // Keep brand logo mark ر untranslated.
    if (s.trim() === "ر") return s;
    const exact = lookup(s);
    if (exact != null) return exact;
    const trimmed = s.trim();
    if (trimmed !== s) {
      const t = lookup(trimmed);
      if (t != null) return s.replace(trimmed, t);
    }
    // Numbered pattern: المرحلة 3 من 10
    const m = trimmed.match(/^(.+?)\s+(\d+)\s+(.+?)\s+(\d+)\s*$/);
    if (m) {
      const a = lookup(m[1] + " {n} " + m[3] + " {n}");
      if (a) return s.replace(trimmed, a.replace("{n}", m[2]).replace("{n}", m[4]));
    }
    return s;
  }

  const ATTRS = ["alt", "title", "aria-label", "placeholder", "aria-description"];

  function translateNode(root) {
    if (!root || applying) return;
    applying = true;
    try {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
          const p = node.parentElement;
          if (!p) return NodeFilter.FILTER_REJECT;
          const tag = p.tagName;
          if (tag === "SCRIPT" || tag === "STYLE" || tag === "NOSCRIPT" || tag === "CODE")
            return NodeFilter.FILTER_REJECT;
          if (p.closest && p.closest("#rafeeq-lang")) return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        },
      });
      const nodes = [];
      while (walker.nextNode()) nodes.push(walker.currentNode);
      for (const node of nodes) {
        const next = translateString(node.nodeValue);
        if (next !== node.nodeValue) node.nodeValue = next;
      }
      const els = root.querySelectorAll
        ? root.querySelectorAll(ATTRS.map((a) => "[" + a + "]").join(","))
        : [];
      for (const el of els) {
        if (el.id === "rafeeq-lang" || (el.closest && el.closest("#rafeeq-lang"))) continue;
        for (const a of ATTRS) {
          if (!el.hasAttribute(a)) continue;
          const v = el.getAttribute(a);
          const n = translateString(v);
          if (n !== v) el.setAttribute(a, n);
        }
      }
    } finally {
      applying = false;
    }
  }

  function applyAll() {
    setDocumentLocale(locale);
    mountSwitcher();
    const root = document.getElementById("root") || document.body;
    if (root) translateNode(root);
    // herbs static page
    const hz = document.querySelector(".hz");
    if (hz) translateNode(hz);
    syncSwitcher();
  }

  let obs;
  function watch() {
    if (obs) obs.disconnect();
    const target = document.getElementById("root") || document.body;
    if (!target) return;
    obs = new MutationObserver((muts) => {
      if (applying) return;
      // debounce
      clearTimeout(watch._t);
      watch._t = setTimeout(() => {
        mountSwitcher();
        translateNode(document.getElementById("root") || document.body || target);
      }, 30);
    });
    obs.observe(target, { childList: true, subtree: true, characterData: true });
  }

  function syncSwitcher() {
    const box = document.getElementById("rafeeq-lang");
    if (!box) return;
    box.querySelectorAll("button[data-loc]").forEach((btn) => {
      const on = btn.getAttribute("data-loc") === locale;
      btn.setAttribute("aria-pressed", on ? "true" : "false");
      btn.classList.toggle("is-on", on);
    });
  }

  function mountSwitcher() {
    const existing = document.getElementById("rafeeq-lang");
    if (existing) {
      if (!existing.isConnected) {
        (document.documentElement || document.body).appendChild(existing);
      }
      syncSwitcher();
      return;
    }
    if (!document.getElementById("rafeeq-lang-style")) {
    const style = document.createElement("style");
    style.id = "rafeeq-lang-style";
    style.textContent = `
#rafeeq-lang{position:fixed;z-index:9999;inset-inline-end:12px;inset-block-start:56px;display:flex;gap:4px;padding:4px;border-radius:999px;background:rgba(251,247,240,.94);border:1px solid #ddd4c4;box-shadow:0 6px 20px rgba(36,48,44,.12);backdrop-filter:blur(8px);font-family:"IBM Plex Sans Arabic",system-ui,sans-serif}
#rafeeq-lang button{appearance:none;border:0;background:transparent;color:#2f5651;font:600 12px/1.2 inherit;padding:8px 10px;border-radius:999px;cursor:pointer;min-width:2.5rem}
#rafeeq-lang button.is-on{background:#3f6f68;color:#fbf7f0}
#rafeeq-lang button:focus-visible{outline:2px solid #3f6f68;outline-offset:2px}
@media print{#rafeeq-lang{display:none!important}}
html[data-locale="en"] body{font-family:system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif}
`;
    document.head.appendChild(style);
    }
    const box = document.createElement("div");
    box.id = "rafeeq-lang";
    box.setAttribute("role", "group");
    box.setAttribute("aria-label", "لغة الواجهة / Language / زبان");
    for (const loc of ["ar", "en", "ur"]) {
      const b = document.createElement("button");
      b.type = "button";
      b.setAttribute("data-loc", loc);
      b.textContent = loc === "ar" ? "ع" : loc === "en" ? "EN" : "اردو";
      b.title = META[loc].label;
      b.addEventListener("click", () => setLocale(loc));
      box.appendChild(b);
    }
    // Prefer <html> so SPA body swaps do not remove the switcher.
    (document.documentElement || document.body).appendChild(box);
    syncSwitcher();
  }

  function setLocale(loc) {
    if (!META[loc]) return;
    locale = loc;
    localStorage.setItem(KEY, loc);
    // Reload maps already in memory; re-apply. For AR we need original DOM —
    // safest: soft reload so React remounts Arabic source, then improve/translate.
    location.reload();
  }

  async function boot() {
    setDocumentLocale(locale); // early lang/dir before paint of late content
    const base = "/assets/i18n/";
    try {
      const [en, ur, arImp] = await Promise.all([
        loadJSON(base + "en.json"),
        loadJSON(base + "ur.json"),
        loadJSON(base + "ar-improve.json"),
      ]);
      maps.en = en || {};
      maps.ur = ur || {};
      maps.ar = arImp || {};
      ready = true;
    } catch (e) {
      console.warn("[rafeeq-i18n] dict load failed", e);
      ready = true;
    }
    const go = () => {
      mountSwitcher();
      applyAll();
      watch();
    };
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", go);
    } else {
      go();
    }
    // React may hydrate late
    setTimeout(applyAll, 400);
    setTimeout(applyAll, 1200);
    setTimeout(applyAll, 3000);
  }

  // expose for debugging
  window.__rafeeqI18n = {
    get locale() {
      return locale;
    },
    setLocale,
    applyAll,
  };

  boot();
})();
