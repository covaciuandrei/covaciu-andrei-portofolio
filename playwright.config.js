import { defineConfig } from '@playwright/test';

const baseURL = 'http://127.0.0.1:4176';

export default defineConfig({
    testDir: './tests',
    workers: 2,
    use: { baseURL, serviceWorkers: 'block' },
    webServer: {
        command: 'npm run preview -- --host 127.0.0.1 --port 4176 --strictPort',
        url: baseURL,
    },
});
