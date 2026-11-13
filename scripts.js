// Keep links to sections of the original one-page CV working.
const legacySections = new Set(["#about", "#work-experience", "#skills"]);
const legacySection = window.location.hash;

const careerLink = document.querySelector('[data-career-link]');

if (careerLink && legacySections.has(legacySection)) {
  window.location.replace(careerLink.href + legacySection);
} else if (careerLink && legacySection === "#about-domain-en" && document.documentElement.lang === "es") {
  const englishLink = document.querySelector('a[hreflang="en"]');
  window.location.replace(englishLink.href + "#about-domain");
}

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
