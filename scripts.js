// Keep links to sections of the original one-page CV working.
const legacySections = new Set(["#about", "#work-experience", "#skills"]);
const legacySection = window.location.hash;

if (legacySections.has(legacySection)) {
  const careerLink = document.querySelector("[data-career-link]");
  window.location.replace(careerLink.href + legacySection);
} else if (legacySection === "#about-domain-en" && document.documentElement.lang === "es") {
  const englishLink = document.querySelector('a[hreflang="en"]');
  window.location.replace(englishLink.href + "#about-domain");
}
