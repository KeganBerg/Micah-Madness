import { defineConfig } from 'vite';

// Relative base so the build works from GitHub Pages or any sub-folder.
export default defineConfig({
  base: './',
  // Inline small images (like Micah) so the game is one self-contained bundle.
  build: { assetsInlineLimit: 64 * 1024 },
});
