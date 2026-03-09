import { defineConfig } from 'vite';
import javascriptObfuscator from 'vite-plugin-javascript-obfuscator';

export default defineConfig({
  build: {
    outDir: 'dist', // Vite default output directory
    assetsDir: 'assets',
    minify: 'terser', // High-quality minification
  },
  plugins: [
    javascriptObfuscator({
      compact: true,
      controlFlowFlattening: true, // This makes the logic very hard to follow
    }),
  ],
});