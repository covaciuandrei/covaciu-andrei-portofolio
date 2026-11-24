import { defineConfig } from 'vite';
import config from './public/staticwebapp.config.json' with { type: 'json' };

export default defineConfig({
  appType: 'mpa',
  build: {
    assetsInlineLimit: 0,
  },
  preview: {
    headers: config.globalHeaders,
  },
});