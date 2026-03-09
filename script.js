/* ==========================================
   script.js – Portfolio Interactions
   ========================================== */
import { version } from './package.json';


// ─── Utility ───────────────────────────────────
const $ = (s, p = document) => p.querySelector(s);
const $$ = (s, p = document) => [...p.querySelectorAll(s)];

// ─── Navbar Scroll Effect ──────────────────────
const navbar = $('#navbar');
window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

// ─── Hamburger / Mobile Menu ───────────────────
const hamburger = $('#hamburger');
const mobileMenu = $('#mobile-menu');

function openMobileMenu() {
    hamburger.classList.add('open');
    mobileMenu.classList.add('open');
    document.body.style.overflow = 'hidden';
}
function closeMobileMenu() {
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
}

hamburger?.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.contains('open');
    isOpen ? closeMobileMenu() : openMobileMenu();
});

$$('.mobile-link').forEach(link => {
    link.addEventListener('click', closeMobileMenu);
});

// Close mobile menu on outside click
document.addEventListener('click', (e) => {
    if (mobileMenu.classList.contains('open') &&
        !mobileMenu.contains(e.target) &&
        !hamburger.contains(e.target)) {
        closeMobileMenu();
    }
});

// ─── Scroll Spy ───────────────────────────────
const sections = $$('section[id]');
const navLinks = $$('.nav-link[data-section]');

function updateActiveNav() {
    const scrollY = window.scrollY;
    sections.forEach(section => {
        const top = section.offsetTop - 100;
        const bottom = top + section.offsetHeight;
        const id = section.getAttribute('id');
        const link = $(`[data-section="${id}"]`);
        if (link) {
            link.classList.toggle('active', scrollY >= top && scrollY < bottom);
        }
    });
}
window.addEventListener('scroll', updateActiveNav, { passive: true });

// ─── Reveal on Scroll ─────────────────────────
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

$$('.reveal-up, .reveal-left, .reveal-right').forEach(el => {
    revealObserver.observe(el);
});

// ─── Skill Bars Animation ─────────────────────
const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            $$('.skill-fill', entry.target).forEach(bar => {
                bar.classList.add('animated');
            });
            skillObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.3 });

const skillsSection = $('#skills');
if (skillsSection) skillObserver.observe(skillsSection);

// ─── Role Typewriter ──────────────────────────
const roles = ['mobile apps', 'web apps', 'Flutter apps', 'clean code', 'awesome UIs'];
let roleIdx = 0;
let charIdx = 0;
let deleting = false;
const roleEl = $('#role-animated');

function typeRole() {
    if (!roleEl) return;
    const current = roles[roleIdx];
    if (!deleting) {
        roleEl.textContent = current.slice(0, ++charIdx);
        if (charIdx === current.length) {
            deleting = true;
            return setTimeout(typeRole, 2000);
        }
    } else {
        roleEl.textContent = current.slice(0, --charIdx);
        if (charIdx === 0) {
            deleting = false;
            roleIdx = (roleIdx + 1) % roles.length;
        }
    }
    setTimeout(typeRole, deleting ? 60 : 100);
}
setTimeout(typeRole, 1500);

// ─── Smooth Scroll for Nav Links ──────────────
$$('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
        const target = $(link.getAttribute('href'));
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// ─── Particle Layer Mouse Parallax ────────────
let mouseX = 0, mouseY = 0;
document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
}, { passive: true });

function parallaxParticles() {
    $$('.particle').forEach((p, i) => {
        const speed = (i % 3 + 1) * 4;
        p.style.transform = `translate(${mouseX * speed}px, ${mouseY * speed}px)`;
    });
    requestAnimationFrame(parallaxParticles);
}
parallaxParticles();

// ─── Avatar Image Fallback ─────────────────────
// Already handled via onerror in HTML – ensure initials display
const profileImg = $('#profile-img');
const avatarInitials = $('#avatar-initials');
if (profileImg && avatarInitials) {
    profileImg.addEventListener('error', () => {
        profileImg.style.display = 'none';
        avatarInitials.style.display = 'flex';
    });
}

// ─── Footer Year & Version ─────────────────────────────
const footerYear = document.querySelector('.footer-bottom p');
if (footerYear) {
    footerYear.innerHTML = footerYear.innerHTML.replace('2026', new Date().getFullYear());
}

const appVersionEl = document.getElementById('app-version');
if (appVersionEl) {
    appVersionEl.textContent = version;
}

// ─── Active section on page load ──────────────
updateActiveNav();

// ─── Contact Form Web3Forms ──────────────────
const contactForm = $('#contact-form');
const formResult = $('#form-result');

if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const formData = new FormData(contactForm);
        const submitBtn = contactForm.querySelector('.btn-submit');
        const captchaWrap = document.getElementById('captcha-wrap');
        const originalBtnText = submitBtn.innerHTML;

        // --- CAPTCHA REVEAL LOGIC ---
        // 1. If captcha hasn't been solved and is hidden, reveal it
        if (!formData.get('h-captcha-response') && captchaWrap.style.display === 'none') {
            captchaWrap.style.display = 'flex';

            // Give a visual hint on the button
            submitBtn.innerHTML = 'Verify Captcha & Send';
            return; // Stop submission
        }

        // 2. If it's already revealed but still unsolved
        if (!formData.get('h-captcha-response')) {
            formResult.innerHTML = "Please complete the captcha above.";
            formResult.className = "form-result error";
            formResult.style.display = "block";
            return; // Stop submission
        }

        // If we reach here, we have a captcha response -> Send it!
        submitBtn.innerHTML = 'Sending...';
        submitBtn.disabled = true;

        fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            body: formData
        })
            .then(async (response) => {
                let json = await response.json();
                if (response.status == 200) {
                    formResult.innerHTML = "Message sent successfully! I'll get back to you soon.";
                    formResult.className = "form-result success";
                    formResult.style.display = "block";
                    contactForm.reset();

                    // Reset captcha and button UI
                    captchaWrap.style.display = 'none';
                    if (window.hcaptcha) {
                        window.hcaptcha.reset();
                    }
                } else {
                    console.log(response);
                    formResult.innerHTML = json.message || "Something went wrong!";
                    formResult.className = "form-result error";
                    formResult.style.display = "block";
                }
            })
            .catch(error => {
                console.log(error);
                formResult.innerHTML = "Something went wrong!";
                formResult.className = "form-result error";
                formResult.style.display = "block";
            })
            .finally(() => {
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
                setTimeout(() => {
                    formResult.style.display = "none";
                    formResult.className = "form-result";
                    formResult.innerHTML = "";
                }, 5000);
            });
    });
}

console.log('%cAndrei Covaciu – Portfolio 🚀', 'color:#4f8ef7;font-size:1.2em;font-weight:bold;');
