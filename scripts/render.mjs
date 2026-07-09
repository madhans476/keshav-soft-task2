// scripts/render.mjs
//
// Single source of truth for turning our Nunjucks page templates into
// plain .html files. This is imported both by:
//   1. scripts/render-templates.mjs — the standalone CLI used by
//      `npm run render` (and the predev / prebuild npm hooks), and
//   2. scripts/vite-plugin-nunjucks-pages.js — the Vite plugin that
//      re-renders on file changes while `vite` (dev server) is running.
//
// Keeping the logic in one place means the dev server and the
// production build can never render templates differently by accident.

import nunjucks from 'nunjucks';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Render every *.njk file in `pagesDir` to a sibling *.html file in `outDir`.
 *
 * @param {Object} options
 * @param {string} options.pagesDir     Absolute path to the folder containing top-level page templates.
 * @param {string} options.templatesDir Absolute path to the Nunjucks template root (so {% include %} / {% extends %} resolve correctly).
 * @param {string} options.outDir       Absolute path where the rendered .html files should be written.
 * @param {Object} [options.context]    Global template variables available to every page (site name, year, nav config, etc).
 * @returns {string[]} The list of .html filenames that were written.
 */
export function renderPages({ pagesDir, templatesDir, outDir, context = {} }) {
  // `noCache: true` so edits are picked up immediately in dev without
  // restarting the process (the small perf cost doesn't matter for a
  // handful of static marketing pages).
  const env = nunjucks.configure(templatesDir, {
    autoescape: true,
    noCache: true,
    trimBlocks: true,
    lstripBlocks: true,
  });

  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const pageFiles = fs
    .readdirSync(pagesDir)
    .filter((file) => file.endsWith('.njk'));

  const written = [];

  for (const file of pageFiles) {
    // Templates are referenced relative to `templatesDir` (the Nunjucks
    // configure root), so a file at <templatesDir>/pages/index.njk is
    // rendered as "pages/index.njk".
    const relativeTemplatePath = path
      .relative(templatesDir, path.join(pagesDir, file))
      .split(path.sep)
      .join('/');

    const html = env.render(relativeTemplatePath, context);
    const outFile = file.replace(/\.njk$/, '.html');
    fs.writeFileSync(path.join(outDir, outFile), html, 'utf-8');
    written.push(outFile);
  }

  return written;
}
