import { expect, test } from '@playwright/test';

test.beforeEach(async ({ context, baseURL }) => {
    await context.route('**/*', route =>
        new URL(route.request().url()).origin === baseURL ? route.continue() : route.abort(),
    );
});

test('built site serves both PDFs, all local images, and real missing-file responses', async ({ page, request }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('/');
    await expect(page.locator('#app-version')).toHaveText(/^\d+\.\d+\.\d+$/);
    await expect(page.locator('#proj-famflix a')).toHaveAttribute('href', 'https://github.com/covaciuandrei/famflix');
    await expect(page.locator('#proj-famflix img')).toHaveAttribute('src', /proj-famflix-titles-.*\.webp$/);
    await expect(page.locator('#proj-famflix img')).toHaveCSS('object-fit', 'cover');
    await expect(page.locator('#proj-calator')).toHaveCount(0);

    await expect(page.locator('a[href$="famflix-artwork.txt"]')).toHaveCount(0);
    expect((await request.get('/licenses/famflix-artwork.txt')).status()).toBe(404);

    for (const link of ['#nav-cv', 'a[href$="andrei_covaciu_ic3_certificate.pdf"]']) {
        const href = await page.locator(link).getAttribute('href');
        const response = await request.get(`/${href}`);
        expect(response.status()).toBe(200);
        expect(response.headers()['content-type']).toContain('application/pdf');
        expect((await response.body()).subarray(0, 5).toString()).toBe('%PDF-');
    }

    const images = await page.locator('img').evaluateAll(elements => elements
        .filter(img => img.src.startsWith(location.origin))
        .map(img => img.src));
    for (const src of images) {
        const response = await request.get(src);
        expect(response.ok(), src).toBe(true);
        expect(response.headers()['content-type'], src).toMatch(/^image\//);
    }
    expect((await request.get('/assets/missing.pdf')).status()).toBe(404);
    expect(errors).toEqual([]);
});

test('production CSP loads local assets without eager third-party scripts', async ({ page }) => {
    await page.addInitScript(() => {
        window.policyViolations = [];
        document.addEventListener('securitypolicyviolation', event => {
            window.policyViolations.push(`${event.violatedDirective}: ${event.blockedURI}`);
        });
    });
    const requests = [];
    page.on('request', request => requests.push(request.url()));
    const res = await page.goto('/');
    const policy = res.headers()['content-security-policy'];
    expect(policy).toContain("frame-ancestors 'none'");
    expect(policy).not.toContain("'unsafe-inline'");
    expect(res.headers()['x-content-type-options']).toBe('nosniff');
    expect(res.headers()['referrer-policy']).toBe('no-referrer');
    await page.evaluate(() => document.fonts.ready);
    expect(await page.evaluate(() => document.fonts.check('16px Inter'))).toBe(true);
    const image = page.locator('#proj-famflix img');
    await image.scrollIntoViewIfNeeded();
    expect(await image.evaluate(async img => { await img.decode(); return img.naturalWidth; })).toBeGreaterThan(0);
    expect(requests.some(url => /hcaptcha\.com|web3forms\.com|fonts\.googleapis\.com/.test(url))).toBe(false);
    expect(await page.evaluate(() => window.policyViolations)).toEqual([]);
});

test('mobile menu is accessible, closes on Escape or resize, and keeps fragment links', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 420 });
    await page.goto('/');
    const button = page.getByRole('button', { name: 'Toggle mobile menu' });
    const menu = page.getByRole('navigation', { name: 'Mobile' });
    await expect(button).toHaveAttribute('aria-expanded', 'false');
    await button.focus();
    await page.keyboard.press('Tab');
    await expect(page.locator('#mobile-menu a:focus')).toHaveCount(0);

    await button.click();
    await expect(button).toHaveAttribute('aria-expanded', 'true');
    await page.keyboard.press('Tab');
    await expect(menu.getByRole('link', { name: 'About' })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(menu).toBeHidden();
    await expect(button).toBeFocused();

    await button.click();
    await menu.getByRole('link', { name: 'Projects' }).click();
    await expect(page).toHaveURL(/#projects$/);
    await expect(page.locator('#projects')).toBeFocused();
    await expect(menu).toBeHidden();

    await button.click();
    await page.setViewportSize({ width: 1024, height: 768 });
    await expect(page.locator('#hamburger')).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('body')).not.toHaveCSS('overflow-y', 'hidden');
});

test('layout stays within the viewport from narrow mobile to desktop', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    for (const width of [320, 375, 768, 860, 861, 1024, 1440]) {
        await page.setViewportSize({ width, height: 800 });
        const dimensions = await page.evaluate(() => ({
            document: document.documentElement.scrollWidth,
            viewport: document.documentElement.clientWidth,
            navbar: document.getElementById('nav-cv').getBoundingClientRect().right,
            portraitBottom: document.querySelector('.avatar-container').getBoundingClientRect().bottom,
            locationTop: document.querySelector('.avatar-location').getBoundingClientRect().top,
        }));
        expect(dimensions.document, `${width}px document`).toBeLessThanOrEqual(dimensions.viewport);
        expect(dimensions.navbar, `${width}px navbar`).toBeLessThanOrEqual(dimensions.viewport);
        expect(dimensions.locationTop, `${width}px Bucharest caption`).toBeGreaterThan(dimensions.portraitBottom);
    }
});

test.describe('without JavaScript', () => {
    test.use({ javaScriptEnabled: false, viewport: { width: 320, height: 640 } });
    test('content, navigation and direct contact remain usable', async ({ page }) => {
        await page.goto('/');
        await expect(page.getByRole('heading', { level: 1 })).toHaveCSS('opacity', '1');
        await expect(page.locator('#proj-famflix')).toHaveCSS('opacity', '1');
        await expect(page.getByRole('link', { name: 'Skip to content' })).toBeAttached();
        await page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'Contact' }).click();
        await expect(page).toHaveURL(/#contact$/);
        await expect(page.locator('#contact-form')).toBeHidden();
        await expect(page.locator('#contact-fallback a')).toHaveAttribute('href', /^mailto:/);
    });
});

test('default motion restores the typewriter, spinning rings and pointer parallax', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.clock.install({ time: new Date('2026-01-01T00:00:00Z') });
    await page.clock.pauseAt(new Date('2026-01-01T00:01:00Z'));
    await page.goto('/');
    await expect(page.locator('.ring-2')).toHaveCSS('animation-iteration-count', 'infinite');
    await expect(page.locator('.card-flutter')).toHaveCSS('animation-iteration-count', 'infinite');
    const particle = page.locator('.particle').first();
    const restingPosition = await particle.evaluate(element => getComputedStyle(element).translate);
    await page.mouse.move(1080, 300);
    await page.clock.runFor(32);
    await expect(particle).not.toHaveCSS('translate', restingPosition);

    await page.clock.runFor(3500);
    await expect(page.locator('#role-animated')).toHaveText('web apps');

    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.clock.runFor(32);
    await expect(page.locator('#role-animated')).toHaveText('mobile apps');
    await expect(particle).toHaveCSS('translate', 'none');
    await page.clock.runFor(4000);
    await expect(page.locator('#role-animated')).toHaveText('mobile apps');
});

test('reduced motion disables decorative animation and smooth scrolling on load', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await expect(page.locator('html')).toHaveCSS('scroll-behavior', 'auto');
    expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
});

test('missing hero image shows initials without relying on inline JavaScript', async ({ page }) => {
    await page.route(/\/assets\/profile-.*\.jpg$/, route => route.abort());
    await page.goto('/');
    await expect(page.locator('#profile-img')).toBeHidden();
    await expect(page.locator('#avatar-initials')).toBeVisible();
});
