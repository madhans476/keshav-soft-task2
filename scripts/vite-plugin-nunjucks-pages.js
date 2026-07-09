// scripts/vite-plugin-nunjucks-pages.js
//
// A small, self-contained Vite plugin (no third-party Nunjucks-Vite
// integration required). Responsibilities:
//
//   1. buildStart  — renders all templates once, before Vite serves
//                    or bundles anything. This covers `vite build`.
//   2. configureServer — renders once when the dev server boots, then
//                    watches the whole `src/templates` tree with
//                    chokidar; any change (editing a layout, a partial,
//                    or a page) re-renders ALL pages and triggers a
//                    full browser reload, so template inheritance
//                    changes are reflected everywhere they're used.
//
// Note: `npm run dev` / `npm run build` also run the render step via
// the `predev` / `prebuild` npm hooks (see package.json) as a second,
// independent safety net — so the very first render is guaranteed to
// happen before Vite reads `index.html` for its module graph, even if
// hook ordering ever changes between Vite versions.

import chokidar from 'chokidar';
import { renderPages } from './render.mjs';

export default function nunjucksPages({ pagesDir, templatesDir, outDir, context = {} }) {
  const render = () => renderPages({ pagesDir, templatesDir, outDir, context });

  return {
    name: 'vite-plugin-nunjucks-pages',

    buildStart() {
      const written = render();
      this.info?.(`[nunjucks] rendered ${written.length} page(s)`);
    },

    configureServer(server) {
      render();

      const watcher = chokidar.watch(templatesDir, { ignoreInitial: true });

      const rerender = (event, file) => {
        try {
          render();
          console.log(`[nunjucks] ${event}: ${file} -> re-rendered all pages`);
          // Template changes affect the raw HTML Vite serves, which its
          // own HMR graph doesn't track — so a full reload is correct here.
          server.ws.send({ type: 'full-reload' });
        } catch (err) {
          console.error('[nunjucks] render error:', err.message);
        }
      };

      watcher.on('add', (file) => rerender('add', file));
      watcher.on('change', (file) => rerender('change', file));
      watcher.on('unlink', (file) => rerender('unlink', file));

      server.httpServer?.once('close', () => watcher.close());
    },
  };
}
