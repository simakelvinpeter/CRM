import { defineConfig } from 'vite';

// Automatic JSX lets component files use JSX without importing React itself.
export default defineConfig({
  // GitHub Pages serves this project below /CRM/. Local development stays at /.
  base: process.env.GITHUB_ACTIONS ? "/CRM/" : "/",
  esbuild: { jsx: 'automatic' },
});
