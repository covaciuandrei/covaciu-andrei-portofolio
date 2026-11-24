import { expect, test } from '@playwright/test';

const widgetScript = `
    const field = document.createElement('input');
    field.type = 'hidden';
    field.name = 'h-captcha-response';
    window.hcaptcha = {
        render(container) {
            const button = document.createElement('button');
            button.type = 'button';
            button.textContent = 'Complete test verification';
            button.addEventListener('click', () => { field.value = 'local-test-verification'; });
            container.append(field, button);
            return 0;
        },
        reset() { field.value = ''; },
    };
    window.onPortfolioCaptchaReady();
`;

async function setup(page, baseURL, responses = [], { blockWidget = false } = {}) {
    const requests = { captcha: 0, send: 0 };
    await page.route('**/*', async route => {
        const url = new URL(route.request().url());
        if (url.origin === baseURL) return route.continue();
        if (url.hostname === 'js.hcaptcha.com' && url.pathname === '/1/api.js') {
            requests.captcha++;
            if (blockWidget) return route.abort();
            return route.fulfill({ contentType: 'application/javascript', body: widgetScript });
        }
        if (url.href === 'https://api.web3forms.com/submit') {
            const reply = responses[requests.send++];
            if (!reply) return route.abort();
            if (reply.hang) return;
            return route.fulfill({
                ...reply,
                headers: { 'Access-Control-Allow-Origin': baseURL },
            });
        }
        return route.abort();
    });
    await page.goto('/#contact');
    return requests;
}

async function fillDraft(page) {
    await page.getByRole('textbox', { name: 'Email', exact: true }).fill('qa@example.invalid');
    await page.getByLabel('Subject', { exact: true }).fill('Local test');
    await page.getByLabel('Message', { exact: true }).fill('This mocked form test sends no email.');
}

test('loads verification on demand and never posts an invalid or unverified draft', async ({ page, baseURL }) => {
    const requests = await setup(page, baseURL);
    const submit = page.getByRole('button', { name: 'Send Message' });
    await submit.click();
    expect(requests.captcha).toBe(0);
    await fillDraft(page);
    await submit.click();
    await expect(page.getByRole('button', { name: 'Complete test verification' })).toBeVisible();
    await submit.click();
    await expect(page.locator('#form-result')).toContainText('Complete the verification before sending');
    expect(requests).toEqual({ captcha: 1, send: 0 });
});

test('rejected responses preserve the draft and require fresh verification before retry', async ({ page, baseURL }) => {
    const requests = await setup(page, baseURL, [
        { status: 200, json: { success: false } },
        { status: 200, json: { success: true } },
    ]);
    const submit = page.getByRole('button', { name: 'Send Message' });
    const verify = page.getByRole('button', { name: 'Complete test verification' });
    const feedback = page.locator('#form-result');
    await fillDraft(page);
    await submit.click();
    await verify.click();
    await submit.click();
    await expect(feedback).toHaveText(/not confirmed.*draft/);
    await expect(page.getByRole('textbox', { name: 'Email', exact: true })).toHaveValue('qa@example.invalid');
    await expect(submit).toBeEnabled();
    await submit.click();
    await expect(feedback).toContainText('Complete the verification');
    expect(requests.send).toBe(1);

    await verify.click();
    await submit.click();
    await expect(feedback).toContainText('Message sent');
    await expect(page.getByRole('textbox', { name: 'Email', exact: true })).toBeEmpty();
    await expect(page.locator('#captcha-wrap')).toBeHidden();
    await expect(submit).toBeEnabled();
    expect(requests).toEqual({ captcha: 1, send: 2 });
});

test('blocked CAPTCHA preserves the draft and offers direct email', async ({ page, baseURL }) => {
    const requests = await setup(page, baseURL, [], { blockWidget: true });
    await fillDraft(page);
    await page.getByRole('button', { name: 'Send Message' }).click();
    await expect(page.locator('#form-result')).toContainText('Verification is unavailable');
    await expect(page.locator('#contact-privacy a')).toHaveAttribute('href', /^mailto:/);
    await expect(page.getByLabel('Message', { exact: true })).not.toBeEmpty();
    expect(requests.send).toBe(0);
});

test('a stalled request times out without losing the draft or leaving Send locked', async ({ page, baseURL }) => {
    const requests = await setup(page, baseURL, [{ hang: true }]);
    await fillDraft(page);
    const submit = page.getByRole('button', { name: 'Send Message' });
    await submit.click();
    await page.getByRole('button', { name: 'Complete test verification' }).click();
    await submit.click();
    await expect(page.getByRole('button', { name: 'Sending...' })).toBeDisabled();
    await expect(page.locator('#form-result')).toContainText('Could not confirm delivery', { timeout: 16_000 });
    await expect(page.getByLabel('Subject', { exact: true })).toHaveValue('Local test');
    await expect(submit).toBeEnabled();
    expect(requests.send).toBe(1);
});
