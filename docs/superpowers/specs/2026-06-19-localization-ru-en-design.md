# Localization (RU / EN) — Design Spec

**Date:** 2026-06-19
**Status:** Approved
**Goal:** Add Russian (`/ru/`) and English (`/en/`) versions of the site, keeping Uzbek in the root (`/`).

## Context

Sapphire Gilam Yuvish is a static HTML site (no framework) for a carpet-cleaning service in Tashkent. Currently it exists only in Uzbek, served from the repo root and deployed on Vercel. All copy lives in `index.html`; a few user-facing strings (toast notification, calculator option labels, price/currency formatting) live in `app.js`. The CSS, JS and images are shared assets.

## Decisions

1. **Approach:** Separate folders per language + Vercel rewrite for clean URLs. Uzbek stays at root; `/ru/` and `/en/` are new.
2. **Default language:** Uzbek at root `/` (existing URL and SEO of the Uzbek version are not touched).
3. **Language switcher:** Textual `UZ · RU · EN` in the header next to the phone (desktop) and inside the mobile menu. Active language is highlighted.

## Architecture

```
/
├── index.html          # uz, root (existing, translated copy only)
├── ru/index.html       # ru (new)
├── en/index.html       # en (new)
├── app.js              # shared; reads language from URL path, has an i18n dictionary for JS strings
├── style.css           # shared; includes styles for the new language switcher
├── images/             # shared; referenced via ../images/ from subfolders
└── vercel.json         # rewrite /ru -> /ru/index.html, /en -> /en/index.html (trailing-slash tolerant)
```

Each localized `index.html` references shared assets via relative paths (`../style.css`, `../app.js`, `../images/...`). Internal in-page anchors (`#services`, `#process`, `#pricing`, `#contact`) remain identical across languages.

### URL handling

- `/` — Uzbek (unchanged).
- `/ru/` and `/ru` — Russian.
- `/en/` and `/en` — English.
- `vercel.json` ensures clean URLs work with and without trailing slash.

## Language switcher

Markup (added to desktop header and mobile menu):

```html
<div class="lang-switcher" aria-label="Tilni tanlash / Язык / Language">
  <a href="/" class="lang-link is-active" hreflang="uz">UZ</a>
  <span class="lang-sep" aria-hidden="true">·</span>
  <a href="/ru/" class="lang-link" hreflang="ru">RU</a>
  <span class="lang-sep" aria-hidden="true">·</span>
  <a href="/en/" class="lang-link" hreflang="en">EN</a>
</div>
```

The `is-active` class is set on the link matching the current page's language. The `aria-label` matches the page language.

CSS: compact inline block next to `.header-phone` on desktop; appears below the nav links inside the mobile menu panel.

## SEO

Each localized `index.html`:

- `<html lang="…">` set correctly (`uz`, `ru`, `en`).
- Translated `<title>` and `<meta name="description">`.
- `<link rel="canonical">` pointing to the page's own absolute URL.
- `<link rel="alternate" hreflang="uz" href="…/">`,
  `<link rel="alternate" hreflang="ru" href="…/ru/">`,
  `<link rel="alternate" hreflang="en" href="…/en/">`,
  `<link rel="alternate" hreflang="x-default" href="…/">`.

(Domain is rendered as relative-rooted paths to avoid hardcoding the production host; canonical/hreflang use root-relative paths like `/ru/`.)

## Content

Full translation of all copy sections: header nav, hero, features, process, showcase, stats, marquee, services, testimonials, FAQ, pricing, CTA strip, footer, and the booking dialog (calculator labels, carpet-type cards, extra-service checkboxes, price display note, form fields, submit buttons, toast message).

### Translation notes

- **Testimonials:** keep the original Uzbek names (Dilnoza, Sardor, Nodira) and Tashkent districts (Yunusobod, Chilonzor, Mirobod); translate only the review text.
- **Currency:** keep prices in soʻm. Locale suffix: `soʻm` (uz), `сум` (ru), `sum` (en). Numeric formatting via `Intl.NumberFormat` keeps group separators appropriate per locale.
- **Phone, Telegram, Instagram, address:** identical across versions.
- **Calculator option labels in `app.js`** ("Dogʻlarni ketkazish", "Antibakterial ishlov", "Dezodoratsiya") are translated per language.
- **Toast message** ("Buyurtma qabul qilindi…") is translated per language.
- **Date / counter formatting locale** in `app.js`: `uz-UZ` (uz), `ru-RU` (ru), `en-US` (en).

## app.js i18n

`app.js` stays a single shared file. At the top it detects the current language from `window.location.pathname`:

- contains `/ru` segment → `ru`
- contains `/en` segment → `en`
- otherwise → `uz`

A small `i18n` dictionary provides: option labels, currency suffix, toast message, and the locale string used by `Intl.NumberFormat`. Existing logic (counter animation, calculator math, slider, phone formatter) is unchanged.

## Out of scope

- No server-side rendering, no build step, no framework introduced.
- No analytics or automatic browser-language redirect (the default stays Uzbek).
- No translation of the brand name "Sapphire Gilam Yuvish" (kept as-is).

## Testing / verification

- Open `/`, `/ru/`, `/en/` locally and confirm: correct `<html lang>`, correct `<title>`/description, all visible copy translated, switcher highlights the active language, switcher links point to the right paths.
- Calculator still computes correctly on all three versions; option labels and toast message localized.
- Mobile menu shows the switcher and closes on link click.
- `hreflang` / canonical link tags present and consistent.
- No broken asset paths (CSS, JS, images) from subfolders.
