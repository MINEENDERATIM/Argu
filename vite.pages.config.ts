import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  base: '/Argu/',
  plugins: [react()],
  build: {
    outDir: 'pages-dist',
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(__dirname, 'demo.html')
    }
  }
});
