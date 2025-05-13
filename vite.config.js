// vite.config.js
import { defineConfig } from 'vite';
import { version } from './package.json';

export default defineConfig({
  root: 'src',
  build: {
    outDir: '../webdist',  // where built web assets go
    emptyOutDir: true,
  },
  server: {
    port: 3000,
  },
  define: {
    __APP_VERSION__: JSON.stringify(version)
  }
});
