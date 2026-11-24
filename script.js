import { version } from './package.json';
import { initContactForm } from './contact.js';

const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');
const mobileViewport = window.matchMedia('(max-width: 860px)');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const sections = [...document.querySelectorAll('main section[id]')];
const navLinks = [...navbar.querySelectorAll('.nav-link')];

function setMenuOpen(open) {
    mobileMenu.hidden = !open;
    hamburger.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('menu-open', open);
}

hamburger.addEventListener('click', () => setMenuOpen(mobileMenu.hidden));
mobileMenu.addEventListener('click', event => {
    const link = event.target.closest('a');
    if (!link) return;
    setMenuOpen(false);
    if (link.hash) document.getElementById(link.hash.slice(1))?.focus({ preventScroll: true });
    else hamburger.focus();
});
document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !mobileMenu.hidden) {
        setMenuOpen(false);
        hamburger.focus();
    }
});
document.addEventListener('click', event => {
    if (!mobileMenu.hidden && !mobileMenu.contains(event.target) && !hamburger.contains(event.target)) {
        const focusWasInMenu = mobileMenu.contains(document.activeElement);
        setMenuOpen(false);
        if (focusWasInMenu) hamburger.focus();
    }
});
document.addEventListener('focusin', event => {
    if (!mobileMenu.hidden && !mobileMenu.contains(event.target) && event.target !== hamburger) {
        setMenuOpen(false);
    }
});
mobileViewport.addEventListener('change', event => {
    if (event.matches || mobileMenu.hidden) return;
    const focusWasInMenu = mobileMenu.contains(document.activeElement) || document.activeElement === hamburger;
    setMenuOpen(false);
    if (focusWasInMenu) (navbar.querySelector('.nav-link.active') || navbar.querySelector('.nav-logo')).focus();
});
document.documentElement.classList.add('menu-ready');

sections.forEach(section => { section.tabIndex = -1; });

let activeSection;
function updateNav() {
    const readingLine = navbar.getBoundingClientRect().bottom + 24;
    const current = sections.findLast(section => section.getBoundingClientRect().top <= readingLine)?.id;
    navbar.classList.toggle('scrolled', window.scrollY > 40);
    if (current === activeSection) return;
    activeSection = current;
    navLinks.forEach(link => {
        const active = link.dataset.section === current;
        link.classList.toggle('active', active);
        if (active) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
    });
}
window.addEventListener('scroll', updateNav, { passive: true });
window.addEventListener('resize', updateNav, { passive: true });
updateNav();

if ('IntersectionObserver' in window && !reducedMotion.matches) {
    const revealObserver = new IntersectionObserver(entries => {
        for (const { target, isIntersecting } of entries) {
            if (isIntersecting) {
                target.classList.add('in-view');
                revealObserver.unobserve(target);
            }
        }
    }, { threshold: 0.12 });
    document.querySelectorAll('.section :is(.reveal-up, .reveal-left, .reveal-right)')
        .forEach(element => revealObserver.observe(element));
}

const profileImg = document.getElementById('profile-img');
function showAvatarInitials() {
    profileImg.hidden = true;
    document.getElementById('avatar-initials').hidden = false;
}
profileImg.addEventListener('error', showAvatarInitials);
if (profileImg.complete && !profileImg.naturalWidth) showAvatarInitials();

document.getElementById('copyright-year').textContent = new Date().getFullYear();
document.getElementById('app-version').textContent = version;
initContactForm();
