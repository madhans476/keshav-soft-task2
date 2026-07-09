// vite.config.js
import { defineConfig } from 'vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import nunjucksPages from './scripts/vite-plugin-nunjucks-pages.js';
import { siteContext } from './scripts/site-context.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    nunjucksPages({
      pagesDir: path.resolve(__dirname, 'src/templates/pages'),
      templatesDir: path.resolve(__dirname, 'src/templates'),
      // Rendered .html files land at the project root so Vite's default
      // multi-page-app discovery (and the rollupOptions.input below) can
      // find them like any hand-written .html entry point.
      outDir: __dirname,
      context: siteContext,
    }),
  ],

  build: {
    outDir: 'dist',
    rollupOptions: {
      // Multi-page app: one entry per rendered page. Vite parses each
      // HTML file, follows its <link>/<script> tags, and bundles +
      // hashes the referenced CSS/JS into dist/assets/.
      input: {
        index: path.resolve(__dirname, 'index.html'),
        about: path.resolve(__dirname, 'about.html'),
        contact: path.resolve(__dirname, 'contact.html'),
      },
    },
  },
});
