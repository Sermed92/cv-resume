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
