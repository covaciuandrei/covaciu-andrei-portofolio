import { defineConfig } from 'vite';
import javascriptObfuscator from 'vite-plugin-javascript-obfuscator';

export default defineConfig({
  build: {
    outDir: 'build', // Changes 'dist' to 'build' like your friend suggested
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