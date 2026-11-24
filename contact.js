const captchaSiteKey = '50b2fe65-b00b-4b9e-ad62-3ba471098be2';
const requestTimeout = 12_000;

function loadCaptcha() {
    if (window.hcaptcha?.render) return Promise.resolve(window.hcaptcha);

    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        const ready = 'onPortfolioCaptchaReady';
        const timeout = setTimeout(fail, requestTimeout);

        function finish() {
            clearTimeout(timeout);
            delete window[ready];
        }

        function fail() {
            finish();
            script.remove();
            reject(new Error('Verification unavailable'));
        }

        window[ready] = () => {
            if (!window.hcaptcha?.render) {
                fail();
                return;
            }
            finish();
            resolve(window.hcaptcha);
        };
        script.src = `https://js.hcaptcha.com/1/api.js?render=explicit&recaptchacompat=off&onload=${ready}`;
        script.async = true;
        script.addEventListener('error', fail, { once: true });
        document.head.append(script);
    });
}

export function initContactForm() {
    const form = document.getElementById('contact-form');
    const feedback = document.getElementById('form-result');
    const captcha = document.getElementById('captcha-wrap');
    const submit = form.querySelector('button[type="submit"]');
    const label = submit.querySelector('span');
    const fields = form.querySelectorAll('.form-input');
    const defaultLabel = label.textContent;
    let widgetId = null;
    let busy = false;

    function showStatus(message, state = '') {
        feedback.textContent = message;
        feedback.className = state ? `form-result ${state}` : 'form-result';
    }

    function showVerificationError() {
        showStatus('Verification is unavailable. Try again or use the direct email link.', 'error');
    }

    function setBusy(value, text = defaultLabel) {
        busy = value;
        submit.disabled = value;
        label.textContent = text;
    }

    function resetVerification() {
        if (widgetId !== null) window.hcaptcha.reset(widgetId);
    }

    form.addEventListener('submit', async event => {
        event.preventDefault();
        if (busy) return;

        if (captcha.hidden) {
            captcha.hidden = false;
            showStatus('Complete the verification, then send your message.');
            if (widgetId !== null) {
                captcha.focus();
                return;
            }
            setBusy(true, 'Loading verification...');
            try {
                const api = await loadCaptcha();
                widgetId = api.render(captcha.querySelector('.captcha-widget'), {
                    sitekey: captchaSiteKey,
                    size: 'compact',
                    theme: 'dark',
                    'error-callback': showVerificationError,
                    'expired-callback': () => {
                        if (!busy) showStatus('Verification expired. Please complete it again.', 'error');
                    },
                });
                if (document.activeElement === document.body || document.activeElement === submit) captcha.focus();
            } catch {
                captcha.hidden = true;
                showVerificationError();
            } finally {
                setBusy(false);
            }
            return;
        }

        const data = new FormData(form);
        if (!data.get('h-captcha-response')) {
            showStatus('Complete the verification before sending your message.', 'error');
            captcha.focus();
            return;
        }

        setBusy(true, 'Sending...');
        fields.forEach(field => { field.readOnly = true; });
        showStatus('Sending your message...');
        try {
            const response = await fetch(form.action, {
                method: 'POST',
                headers: { Accept: 'application/json' },
                body: data,
                signal: AbortSignal.timeout(requestTimeout),
            });
            if (!response.ok || (await response.json())?.success !== true) {
                showStatus('Your message was not confirmed. Your draft is still here. Verify again to retry, or email me directly.', 'error');
                return;
            }
            form.reset();
            captcha.hidden = true;
            showStatus('Message sent. Thanks for getting in touch!', 'success');
        } catch {
            showStatus('Could not confirm delivery. Your draft is still here. Verify again to retry, or email me directly.', 'error');
        } finally {
            try {
                resetVerification();
            } catch {
                widgetId = null;
                captcha.querySelector('.captcha-widget').replaceChildren();
                captcha.hidden = true;
                showStatus(`${feedback.textContent} Verification needs to reload before your next attempt.`, feedback.classList.contains('success') ? 'success' : 'error');
            } finally {
                fields.forEach(field => { field.readOnly = false; });
                setBusy(false);
            }
        }
    });

    document.getElementById('contact-fallback').hidden = true;
    form.hidden = false;
}
