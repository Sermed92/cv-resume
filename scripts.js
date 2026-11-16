// Keep links to sections of the original one-page CV working.
const legacySections = new Set(["#about", "#work-experience", "#skills"]);
const legacySection = window.location.hash;

const careerLink = document.querySelector('[data-career-link]');

if (careerLink && legacySections.has(legacySection)) {
  window.location.replace(careerLink.href + legacySection);
} else if (careerLink && legacySection === "#about-domain-en" && document.documentElement.lang === "es") {
  const englishLink = document.querySelector('.languages a[hreflang="en"]');
  window.location.replace(englishLink.href + "#about-domain");
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

function updateLanguageLinks() {
  const fragment = window.location.hash;
  const section = fragment && document.getElementById(fragment.slice(1));
  languageLinks.forEach((link, index) => {
    const destination = languageDestinations[index];
    destination.hash = section ? fragment : "";
    link.href = destination.href;
  });
}

window.addEventListener("hashchange", updateLanguageLinks);
window.addEventListener("pageshow", updateLanguageLinks);
updateLanguageLinks();

const readingProgress = document.querySelector(".reading-progress");

function updateReadingProgress() {
  const page = document.documentElement;
  const scrollable = page.scrollHeight - page.clientHeight;
  const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
  readingProgress.style.setProperty("--reading-progress", Math.min(1, Math.max(0, progress)));
}

window.addEventListener("scroll", updateReadingProgress, { passive: true });
window.addEventListener("resize", updateReadingProgress);
window.addEventListener("pageshow", updateReadingProgress);
updateReadingProgress();
