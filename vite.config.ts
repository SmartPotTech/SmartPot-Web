import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/postcss';
import autoprefixer from 'autoprefixer';

export default defineConfig({
  plugins: [react()],

  css: {
    postcss: {
      plugins: [
        tailwindcss(),
        autoprefixer(),
      ],
    },
  },
  resolve: {
    alias: {
      buffer: 'buffer/',
      stream: 'stream-browserify',
      assert: 'assert',
    },
  },
  define: {
    'process.env': {},
    'global': 'window',
  }
});