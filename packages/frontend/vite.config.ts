import { defineConfig } from 'vite';

import path from 'node:path';

import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import optimizeLocales from '@react-aria/optimize-locales-plugin';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
    tailwindcss(),
    optimizeLocales.rollup({
      locales: ['en-US'],
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
