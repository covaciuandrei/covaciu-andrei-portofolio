# Andrei Covaciu's portfolio

A static portfolio built with vanilla HTML, CSS, JavaScript, and Vite. The production site needs only the `dist/` files, not a Node server.

## Run and test locally

```bash
nvm use
npm ci
npm run dev
```

Visit `http://localhost:5173`. To check the actual production build:

```bash
npm run build
npx playwright install chromium
npm test
```

The browser tests serve `dist/` on loopback with the production security policy. CAPTCHA and form requests are mocked; tests never send email.

## Azure hosting and release

The deployment target is **Azure Static Web Apps Free**, resource `portofolio` in `rg-portofolio` (West Europe). There is no API, VM, or database. Keep DNS at Name.com.

1. Provision the resource group and Static Web App with the [Bicep template](infra/main.bicep) and [deployment parameters](infra/main.parameters.json). Supply `sessionId`, `createdAt`, and `deployedBy` as resource tags when provisioning. The template does not connect GitHub or change DNS. Put the **new app's** Azure deployment token in the GitHub `production` environment secret `AZURE_STATIC_WEB_APPS_API_TOKEN_PORTOFOLIO`. Restrict the environment to `main`. Don't paste the token into source, logs, or messages.
2. The [portfolio workflow](.github/workflows/portfolio.yml) runs a locked install, dependency audit, build, and browser checks on PRs and pushes to `main`. Only `main` pushes deploy, and they upload the exact tested `dist/` artifact. The [Static Web Apps configuration](public/staticwebapp.config.json) is copied into that artifact.
3. Before moving DNS, verify the generated Azure hostname: homepage, FamFlix card, both PDF links, a missing asset returning 404, HTTPS, and security headers. Verify server-side hCaptcha enforcement and the allowed domains in the Web3Forms dashboard before relying on live submissions.
4. Back up the current DNS records and Azure custom-domain bindings. Confirm FamFlix works on `famflix.andreicovaciu.dev`, including sign-in and shared links, before moving the apex. Validate ownership on the new app using Azure's prescribed TXT records without replacing unrelated records.
5. At the approved cutover, change only the apex and `www`: use a Name.com `ANAME` at the apex and a `www` CNAME, both targeting the new Azure hostname. If an alias isn't available, use Azure's `stableInboundIP` for the apex record. If Azure reports a conflicting binding, detach only the conflicting apex or `www` hostname from the old resource during the cutover. Leave `famflix`, `tracker`, nameservers, and mail records unchanged.
6. With valid TLS on both portfolio names, set `andreicovaciu.dev` as the app's default domain and verify `https://www.andreicovaciu.dev` redirects there. Recheck both unrelated subdomains.

**Rollback:** Revert the faulty change on `main` and let CI redeploy, or use the retained last known-good `portfolio-<commit>` artifact for a manual Azure Static Web Apps deployment. For a routing rollback, restore the previous DNS targets and custom-domain bindings together, then verify HTTPS again.

## Contact and assets

- The contact form uses a [Web3Forms public submission identifier](https://docs.web3forms.com/getting-started/faq). Its documented hCaptcha integration loads only on demand; the direct email link is available even when scripts or CAPTCHA are blocked.
- The CV and IC3 certificate live in `public/` so Vite ships the original PDFs. Project thumbnails are local and lazy-loaded. Inter and Space Grotesk are self-hosted under the [SIL Open Font License](public/licenses/).

### FamFlix artwork

The FamFlix cover combines the app mark with cropped, color-graded stills. The credits are also embedded in the image metadata. The films do not endorse or have any affiliation with FamFlix.

- [Tears of Steel](https://studio.blender.org/projects/tears-of-steel/) (2012) — (CC) Blender Foundation | [mango.blender.org](https://mango.blender.org/sharing/), [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/).
- [Spring](https://studio.blender.org/projects/spring/) (2019) — Copyright Blender Foundation | [cloud.blender.org/spring](https://studio.blender.org/projects/spring/pages/about/), [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
- [Caminandes 3: Llamigos](https://studio.blender.org/projects/caminandes-3/) (2016) — Blender Institute; directed by Pablo Vazquez, [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/) ([licensed release](https://commons.wikimedia.org/wiki/File:Caminandes_3_-_Llamigos_-_Blender_Animated_Short.webm)).
