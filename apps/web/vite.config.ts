import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import inlineSvgPlugin from './vite-inline-svg-plugin';

export default defineConfig({
  plugins: [react(), inlineSvgPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@lib': path.resolve(__dirname, './src/lib'),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/styles/variables.scss" as *; @use "@/styles/mixins.scss" as *;`,
      },
    },
  },
});
