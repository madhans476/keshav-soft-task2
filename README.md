# Orbiq — Nunjucks + Vite Edition (Task 2)

Same Orbiq site — same UI, layout, styling, and responsiveness — rebuilt with **Nunjucks templates** and a **Vite** build pipeline instead of three hand-duplicated HTML files.

Live link: [Orbiq](https://keshav-soft-task2.vercel.app)

Nothing about the design was changed. This task was purely about project *structure*.

## Templating engine and bundler chosen

- **Templating engine: [Nunjucks](https://mozilla.github.io/nunjucks/)**
  Used throughout the project for layout inheritance (`{% extends %}`), shared includes (`{% include %}`), and parameterized macros (`{% macro %}`) for repeated components like cards, stats, timeline steps, and FAQ items. Chosen over Handlebars because its Jinja2-style inheritance (a single `base.njk` layout with `{% block %}` regions) maps naturally onto "one shared layout, per-page content blocks," and its macros give reusable components real parameters (icon, heading, text) rather than Handlebars' more limited partial-with-context model.

- **Bundler / task runner: [Vite](https://vitejs.dev/)**
  Runs the dev server (with live-reloading on template edits) and the production build (bundling and hashing local CSS/JS while leaving CDN links untouched). Chosen over Gulp because Vite's multi-page-app support and native dev server meant no manual watch/reload plumbing was needed beyond the small custom plugin that teaches Vite about `.njk` files (`scripts/vite-plugin-nunjucks-pages.js`).

- **Styling:** the exact same Bootstrap 5 (CDN) + custom `style.css` from Task 1, unchanged.

## Why this architecture

Vite doesn't understand `.njk` files natively, so there's a small, custom, dependency-light plugin (`scripts/vite-plugin-nunjucks-pages.js`) that renders every template in `src/templates/pages/*.njk` into a plain `.html` file at the project root — which Vite then treats as a normal entry point, following its `<link>`/`<script>` tags and bundling/hashing the CSS and JS referenced inside.

Two independent triggers make sure that rendering always happens before Vite needs the files:
1. **npm hooks** — `predev` and `prebuild` run `npm run render` automatically before `vite`/`vite build` start.
2. **The Vite plugin itself** — renders once on server boot (`configureServer`) and once per build (`buildStart`), and in dev mode watches the whole `src/templates/` tree with `chokidar`, re-rendering **all** pages and forcing a full browser reload whenever a layout, partial, macro, or page template changes.

Both were tested independently (deleting the generated root `.html` files and booting `vite` directly still works, proving the plugin alone is sufficient) — so the "auto-compiles and serves" requirement doesn't depend on any single mechanism.

## Folder structure

```
orbiq-vite-nunjucks/
├── package.json
├── vite.config.js              Multi-page build config + plugin wiring
├── .gitignore                  Ignores node_modules, dist, and generated root *.html
├── scripts/
│   ├── render.mjs              Core render function (single source of truth)
│   ├── render-templates.mjs    CLI entry — `npm run render`
│   ├── site-context.mjs        Global template variables (site name, year, socials)
│   └── vite-plugin-nunjucks-pages.js   Vite plugin: render on build/serve + watch
├── src/
│   ├── templates/
│   │   ├── layouts/
│   │   │   └── base.njk        The one layout every page extends
│   │   ├── partials/
│   │   │   ├── head.njk        Meta tags + Bootstrap/Fonts CDN + CSS import
│   │   │   ├── navbar.njk      Shared navbar (active link driven by `page` var)
│   │   │   ├── footer.njk      Shared footer
│   │   │   ├── scripts.njk     Shared end-of-body scripts (Bootstrap bundle)
│   │   │   └── macros.njk      Reusable components: cards, stats, timeline
│   │   │                       steps, FAQ items, CTA band
│   │   └── pages/
│   │       ├── index.njk       Home page content
│   │       ├── about.njk       About page content
│   │       └── contact.njk     Contact page content
│   └── assets/
│       ├── css/
│       │   └── style.css       Same custom stylesheet as Task 1, unchanged
│       └── js/
│           └── contact-form.js Contact page's Bootstrap validation script
│
# Generated at dev/build time — not committed:
├── index.html / about.html / contact.html   (rendered from templates)
└── dist/                                     (final production build output)
```

## What's shared vs. what's page-specific

| Written once | Where |
|---|---|
| `<head>` meta tags, CDN links, CSS import | `partials/head.njk` |
| Navbar (all 3 links + active-state logic) | `partials/navbar.njk` |
| Footer (socials, link columns, copyright) | `partials/footer.njk` |
| Bootstrap bundle script | `partials/scripts.njk` |
| Feature/service card markup | `macros.njk` → `icon_card()` |
| Stat figure + label | `macros.njk` → `stat()` |
| Team member card | `macros.njk` → `team_card()` |
| Timeline step | `macros.njk` → `timeline_item()` |
| FAQ accordion item | `macros.njk` → `faq_item()` |
| Dark CTA band (used on Home *and* About) | `macros.njk` → `cta_band()` |

Each page template (`index.njk`, `about.njk`, `contact.njk`) only contains the content that's actually unique to that page, plus calls into the shared macros for anything repeated.

## How to install dependencies and run the project

Requires [Node.js](https://nodejs.org/) 18+ (tested with Node 22) and npm.

```bash
# 1. Install dependencies (vite, nunjucks, chokidar)
npm install

# 2. Start the dev server — renders all Nunjucks templates to HTML,
#    then serves them with live-reload on any template/CSS/JS change
npm run dev
# -> open http://localhost:5173

# 3. Build for production — renders templates, then bundles + hashes
#    CSS/JS into the dist/ folder
npm run build

# 4. Preview the production build locally
npm run preview
```

Other scripts:

```bash
npm run render    # re-renders index.html / about.html / contact.html from the
                   # templates without starting Vite — rarely needed manually,
                   # since `dev` and `build` both trigger it automatically
```

`npm run build` was run and verified during development of this project: it produces `dist/index.html`, `dist/about.html`, `dist/contact.html`, plus hashed, bundled `dist/assets/style-*.css` and `dist/assets/contact-*.js` — CDN links (Bootstrap, fonts) are left untouched, as expected.


## Honest notes

- This project was built with AI assistance (Claude), same as Task 1 — see that project's README for the full disclosure. The same principle applies here: the templating/build architecture was generated from a detailed spec, then actually installed and built (`npm install && npm run build`, plus a dev-server boot test) to confirm it works, rather than just assumed to work.
- The three generated root `.html` files and `dist/` are intentionally gitignored — they're build output, not source. If you `git clone` this project fresh, running `npm install && npm run dev` regenerates everything needed.
