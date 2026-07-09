// scripts/render-templates.mjs
//
// Standalone entry point: `npm run render`.
// Also wired up as the `predev` and `prebuild` npm lifecycle hooks, so
// `npm run dev` and `npm run build` ALWAYS render fresh HTML from the
// Nunjucks templates before Vite ever starts — regardless of plugin
// hook timing. The Vite plugin (vite-plugin-nunjucks-pages.js) then
// keeps re-rendering on file changes while the dev server is running.

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderPages } from './render.mjs';
import { siteContext } from './site-context.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

const written = renderPages({
  pagesDir: path.join(projectRoot, 'src/templates/pages'),
  templatesDir: path.join(projectRoot, 'src/templates'),
  outDir: projectRoot,
  context: siteContext,
});

console.log(`[nunjucks] rendered ${written.length} page(s): ${written.join(', ')}`);
