// Keep links to sections of the original one-page CV working.
const legacySections = new Set(["#about", "#work-experience", "#skills"]);
const legacySection = window.location.hash;

const careerLink = document.querySelector('[data-career-link]');

if (careerLink && legacySections.has(legacySection)) {
  window.location.replace(careerLink.href + window.location.search + legacySection);
} else if (careerLink && legacySection === "#about-domain-en" && document.documentElement.lang === "es") {
  const englishLink = document.querySelector('.languages a[hreflang="en"]');
  window.location.replace(englishLink.href + window.location.search + "#about-domain");
}

const legacyFragments = new Map([
  ["#contenido", "#content"],
  ["#proyectos", "#projects"],
  ["#como-trabajo", "#how-i-work"],
  ["#contacto", "#contact"],
]);
const currentFragment = legacyFragments.get(legacySection);
if (currentFragment && document.getElementById(currentFragment.slice(1))) {
  window.location.replace(currentFragment);
}

const languageLinks = document.querySelectorAll(".languages a");
const languageDestinations = Array.from(languageLinks, (link) => new URL(link.href));

// Keep the native transition for the translated version of the current page.
const alternateLanguage = new URL(document.querySelector(".languages a:not([aria-current])").href);
window.addEventListener("pageswap", (event) => {
  const destination = event.activation?.entry.url;
  if (!event.viewTransition || !destination) return;

  const url = new URL(destination);
  if (url.origin !== alternateLanguage.origin || url.pathname !== alternateLanguage.pathname) {
    event.viewTransition.skipTransition();
  }
});

const motionPreference = window.matchMedia("(prefers-reduced-motion: no-preference)");
let pendingSection;

const careerLinks = Array.from(document.querySelectorAll(".hero.professional a[href^='#']"));
careerLinks.forEach((link, index) => {
  link.addEventListener("click", (event) => {
    if (event.defaultPrevented ||
        event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const target = document.getElementById(link.hash.slice(1));
    if (!target) return;

    if (window.location.hash !== link.hash) {
      history.replaceState({ ...history.state, careerReturnLink: index, careerReturnPosition: window.scrollY }, "");
    }
    if (!motionPreference.matches || !("onscrollend" in document)) return;

    const page = document.documentElement;
    const offset = parseFloat(getComputedStyle(page).scrollPaddingTop) +
      parseFloat(getComputedStyle(target).scrollMarginTop);
    const destination = Math.min(page.scrollHeight - page.clientHeight,
      Math.max(0, window.scrollY + target.getBoundingClientRect().top - offset));
    if (Math.abs(window.scrollY - destination) < 1) return;

    event.preventDefault();
    pendingSection = { target, start: window.scrollY };
    const state = { pendingSection: target.id };
    if (window.location.hash === link.hash) history.replaceState(state, "", link.hash);
    else history.pushState(state, "", link.hash);
    target.focus({ preventScroll: true });
    target.scrollIntoView({ behavior: "smooth" });
    updateReadingPosition();
  });
});

document.addEventListener("scrollend", () => {
  if (!pendingSection || Math.abs(window.scrollY - pendingSection.start) < 1) return;
  pendingSection = null;
  history.replaceState({ ...history.state, pendingSection: undefined }, "");
  updateReadingPosition();
});

function restoreCareerPosition(interrupted = false) {
  const state = history.state;
  const hash = window.location.hash;
  requestAnimationFrame(() => {
    if (history.state !== state || window.location.hash !== hash) return;
    const target = document.getElementById(hash.slice(1));
    if (target && state?.pendingSection === target.id) {
      // An interrupted jump may have saved a position between two sections.
      target.focus({ preventScroll: true });
      target.scrollIntoView({ behavior: "instant" });
      history.replaceState({ ...state, pendingSection: undefined }, "");
      updateReadingPosition();
      return;
    }

    const returnLink = careerLinks[state?.careerReturnLink];
    if (interrupted && returnLink) {
      window.scrollTo({ top: state.careerReturnPosition, behavior: "instant" });
    }
    const focusTarget = returnLink ?? target;
    const bounds = focusTarget?.getBoundingClientRect();
    if (bounds && bounds.top >= header.getBoundingClientRect().bottom && bounds.top < window.innerHeight) {
      focusTarget.focus({ preventScroll: true });
    }
  });
}

window.addEventListener("popstate", () => {
  if (!careerLinks.length) return;
  const interrupted = Boolean(pendingSection);
  if (interrupted) {
    pendingSection = null;
    window.scrollTo({ top: window.scrollY, behavior: "instant" });
  }
  restoreCareerPosition(interrupted);
});
window.addEventListener("pagehide", () => {
  pendingSection = null;
});
window.addEventListener("pageshow", () => {
  if (history.state?.pendingSection) restoreCareerPosition();
});

const header = document.querySelector(".site-header");
const sections = Array.from(document.querySelectorAll("main > section[id]"));
const readingProgress = document.querySelector(".reading-progress");
let activeSection;

function updateHeaderOffset() {
  const offset = header.getBoundingClientRect().height + 12;
  document.documentElement.style.setProperty("--header-scroll-offset", offset + "px");
  updateReadingPosition();
}

const headerObserver = new ResizeObserver(updateHeaderOffset);
headerObserver.observe(header);

function updateReadingPosition() {
  const page = document.documentElement;
  const scrollable = page.scrollHeight - page.clientHeight;
  const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
  readingProgress.style.setProperty("--reading-progress", Math.min(1, Math.max(0, progress)));

  const scrollPadding = parseFloat(getComputedStyle(page).scrollPaddingTop);
  const readingLine = Math.max(header.getBoundingClientRect().bottom, scrollPadding) + 24;
  const target = sections.find((section) => "#" + section.id === window.location.hash);
  let section = sections[0];
  for (const candidate of sections) {
    if (candidate.getBoundingClientRect().top > readingLine) break;
    section = candidate;
  }
  if (scrollable > 0 && window.scrollY >= scrollable - 1) {
    section = target && target.getBoundingClientRect().top >= readingLine - 24
      ? target
      : sections.at(-1);
  }
  section = pendingSection?.target ?? section;
  if (section === activeSection) return;
  activeSection = section;

  languageLinks.forEach((link, index) => {
    const destination = languageDestinations[index];
    destination.hash = section === sections[0] ? "" : "#" + section.id;
    link.href = destination.href;
  });
}

window.addEventListener("scroll", updateReadingPosition, { passive: true });
window.addEventListener("resize", updateReadingPosition);
window.addEventListener("hashchange", updateReadingPosition);
window.addEventListener("pageshow", updateReadingPosition);
updateHeaderOffset();
