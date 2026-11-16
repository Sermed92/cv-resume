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

const header = document.querySelector(".site-header");
const sectionPosition = document.querySelector(".section-position");
const sectionLabel = sectionPosition.querySelector("span");
const sections = Array.from(document.querySelectorAll("[data-section-label]"));
const readingProgress = document.querySelector(".reading-progress");
let activeSection;

sectionPosition.hidden = false;
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
  if (section === activeSection) return;
  activeSection = section;
  sectionLabel.textContent = section.dataset.sectionLabel;

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
