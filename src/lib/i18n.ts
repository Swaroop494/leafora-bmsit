/**
 * Leafora Multilingual Localization Engine
 * Supports English, Kannada (ಕನ್ನಡ), and Hindi (हिन्दी)
 */

export type LanguageCode = "en" | "kn" | "hi";

export interface TranslationDictionary {
  appName: string;
  campusSubtitle: string;
  tagline: string;
  navCapture: string;
  navMap: string;
  navRoadmap: string;
  navMethod: string;
  navSignIn: string;

  // Capture
  photographsHeading: string;
  fieldObservationsHeading: string;
  girthLabel: string;
  heightLabel: string;
  campusZoneLabel: string;
  analyseButton: string;
  logOnMapButton: string;
  explainableAiTitle: string;
  gradCamToggle: string;
  treeIdFeaturesTitle: string;
  top3CandidatesTitle: string;
  healthScoreTitle: string;
  carePlanTitle: string;
  carbonEstimateTitle: string;
  hazardRiskLabel: string;

  // Health categories
  catHealthy: string;
  catWatch: string;
  catStressed: string;
  catCritical: string;

  // Tools & Modals
  calculatorTitle: string;
  phenologyTitle: string;
  nativeAdvisorTitle: string;
  adoptTreeTitle: string;
  qrPlacardTitle: string;
  voiceNoteTitle: string;
}

export const TRANSLATIONS: Record<LanguageCode, TranslationDictionary> = {
  en: {
    appName: "Leafora",
    campusSubtitle: "Campus Tree Health Inventory & Geo-Tagging Log",
    tagline: "Mapping, monitoring and protecting our green infrastructure with AI.",
    navCapture: "Capture",
    navMap: "Campus Map",
    navRoadmap: "Feature Hub",
    navMethod: "Method & AI",
    navSignIn: "Sign In",

    photographsHeading: "Guided Field Photographs",
    fieldObservationsHeading: "Physical Field Observations",
    girthLabel: "Girth at breast height (GBH in cm)",
    heightLabel: "Estimated tree height (meters)",
    campusZoneLabel: "Campus zone",
    analyseButton: "Run AI Species & Disease Screening",
    logOnMapButton: "Log on Campus Map & Carbon Bank",
    explainableAiTitle: "Explainable AI Engine (Grad-CAM & TreeID)",
    gradCamToggle: "Show Neural Attention Heatmap",
    treeIdFeaturesTitle: "TreeID Leaf Curvature & Shape Features",
    top3CandidatesTitle: "Top-3 Identified Species Candidates",
    healthScoreTitle: "Tree Health Score (0–100)",
    carePlanTitle: "Targeted Care & Treatment Protocol",
    carbonEstimateTitle: "Carbon & Biomass Storage Record",
    hazardRiskLabel: "Hazard Risk Index",

    catHealthy: "Healthy",
    catWatch: "Watch",
    catStressed: "Stressed",
    catCritical: "Critical",

    calculatorTitle: "Carbon & Ecosystem Calculator",
    phenologyTitle: "Campus Phenology Calendar",
    nativeAdvisorTitle: "Native-Planting Advisor",
    adoptTreeTitle: "Adopt a Tree Stewardship",
    qrPlacardTitle: "Printable QR Tree Identity Placard",
    voiceNoteTitle: "Field Audio Voice Notes",
  },

  kn: {
    appName: "ಲೀಫೋರಾ (Leafora)",
    campusSubtitle: "ಕ್ಯಾಂಪಸ್ ಮರಗಳ ಆರೋಗ್ಯ ತಪಾಸಣೆ ಮತ್ತು ಜಿಯೋ-ಟ್ಯಾಗಿಂಗ್ ದಾಖಲೆ",
    tagline: "ಕೃತಕ ಬುದ್ಧಿಮತ್ತೆಯೊಂದಿಗೆ ನಮ್ಮ ಹಸಿರು ಪರಿಸರವನ್ನು ನಕ್ಷೆ ಮಾಡಿ ರಕ್ಷಿಸುವುದು.",
    navCapture: "ಛಾಯಾಚಿತ್ರ ಸೆರೆಹಿಡಿಯಿರಿ",
    navMap: "ಕ್ಯಾಂಪಸ್ ನಕ್ಷೆ",
    navRoadmap: "ವೈಶಿಷ್ಟ್ಯಗಳು",
    navMethod: "ವಿಧಾನ ಮತ್ತು AI",
    navSignIn: "ಪ್ರವೇಶಿಸಿ",

    photographsHeading: "ಮಾರ್ಗದರ್ಶಿತ ಛಾಯಾಚಿತ್ರಗಳು",
    fieldObservationsHeading: "ಕ್ಷೇತ್ರ ರೋಗಲಕ್ಷಣ ವೀಕ್ಷಣೆಗಳು",
    girthLabel: "ಮರದ ಸುತ್ತಳತೆ (ಸೆಂ.ಮೀ - GBH)",
    heightLabel: "ಮರದ ಅಂದಾಜು ಎತ್ತರ (ಮೀಟರ್)",
    campusZoneLabel: "ಕ್ಯಾಂಪಸ್ ವಲಯ",
    analyseButton: "AI ಪ್ರಭೇದ ಮತ್ತು ರೋಗ ತಪಾಸಣೆ ನಡೆಸಿ",
    logOnMapButton: "ಕ್ಯಾಂಪಸ್ ನಕ್ಷೆಯಲ್ಲಿ ದಾಖಲಿಸಿ",
    explainableAiTitle: "ವಿವರಣಾತ್ಮಕ AI ಎಂಜಿನ್ (Grad-CAM & TreeID)",
    gradCamToggle: "ನ್ಯೂರಲ್ ಹೀಟ್‌ಮ್ಯಾಪ್ ತೋರಿಸಿ",
    treeIdFeaturesTitle: "TreeID ಎಲೆಯ ವಕ್ರತೆ ಮತ್ತು ಆಕಾರ ವಿಶ್ಲೇಷಣೆ",
    top3CandidatesTitle: "ಗುರುತಿಸಲಾದ ಅಗ್ರ-೩ ಮರದ ಪ್ರಭೇದಗಳು",
    healthScoreTitle: "ಮರದ ಆರೋಗ್ಯ ಸ್ಕೋರ್ (೦–೧೦೦)",
    carePlanTitle: "ಸೂಕ್ತ ಆರೈಕೆ ಮತ್ತು ಚಿಕಿತ್ಸಾ ಯೋಜನೆ",
    carbonEstimateTitle: "ಕಾರ್ಬನ್ ಮತ್ತು ಜೈವಿಕ ರಾಶಿ ಅಂದಾಜು",
    hazardRiskLabel: "ಅಪಾಯದ ಸೂಚ್ಯಂಕ (Hazard Index)",

    catHealthy: "ಆರೋಗ್ಯಕರ (Healthy)",
    catWatch: "ಗಮನಿಸಿ (Watch)",
    catStressed: "ಒತ್ತಡದಲ್ಲಿದೆ (Stressed)",
    catCritical: "ತೀವ್ರ ಅಪಾಯ (Critical)",

    calculatorTitle: "ಕಾರ್ಬನ್ & ಪರಿಸರ ಕ್ಯಾಲ್ಕುಲೇಟರ್",
    phenologyTitle: "ಕ್ಯಾಂಪಸ್ ಋತುಮಾನ ಕ್ಯಾಲೆಂಡರ್",
    nativeAdvisorTitle: "ಸ್ಥಳೀಯ ಗಿಡ ನೆಡುವ ಸಲಹೆಗಾರ",
    adoptTreeTitle: "ಮರವನ್ನು ದತ್ತು ಪಡೆಯಿರಿ",
    qrPlacardTitle: "ಮುದ್ರಿಸಬಹುದಾದ QR ಫಲಕ",
    voiceNoteTitle: "ಕ್ಷೇತ್ರ ಧ್ವನಿ ಟಿಪ್ಪಣಿಗಳು",
  },

  hi: {
    appName: "लीफोरा (Leafora)",
    campusSubtitle: "परिसर वृक्ष स्वास्थ्य सूची और भू-टैगिंग लॉग",
    tagline: "एआई के साथ हमारे हरित बुनियादी ढांचे का मानचित्रण और संरक्षण।",
    navCapture: "तस्वीर लें",
    navMap: "परिसर मानचित्र",
    navRoadmap: "सुविधाएं",
    navMethod: "कार्यप्रणाली",
    navSignIn: "साइन इन",

    photographsHeading: "निर्देशित फील्ड तस्वीरें",
    fieldObservationsHeading: "शारीरिक लक्षण अवलोकन",
    girthLabel: "वृक्ष की गोलाई (सेमी में - GBH)",
    heightLabel: "वृक्ष की अनुमानित ऊंचाई (मीटर)",
    campusZoneLabel: "परिसर क्षेत्र",
    analyseButton: "एआई प्रजाति और रोग स्क्रीनिंग चलाएं",
    logOnMapButton: "परिसर मानचित्र पर दर्ज करें",
    explainableAiTitle: "व्याख्यात्मक एआई इंजन (Grad-CAM & TreeID)",
    gradCamToggle: "न्यूरल अटेंशन हीटमैप दिखाएं",
    treeIdFeaturesTitle: "TreeID पत्ती वक्रता एवं आकृति विश्लेषण",
    top3CandidatesTitle: "पहचानी गई शीर्ष-3 संभावित प्रजातियां",
    healthScoreTitle: "वृक्ष स्वास्थ्य स्कोर (0–100)",
    carePlanTitle: "लक्षित देखभाल एवं उपचार योजना",
    carbonEstimateTitle: "कार्बन एवं बायोमास भंडारण रिकॉर्ड",
    hazardRiskLabel: "जोखिम सूचकांक (Hazard Index)",

    catHealthy: "स्वस्थ (Healthy)",
    catWatch: "निगरानी (Watch)",
    catStressed: "तनावग्रस्त (Stressed)",
    catCritical: "गंभीर (Critical)",

    calculatorTitle: "कार्बन एवं पारिस्थितिकी कैलकुलेटर",
    phenologyTitle: "परिसर फेनोलॉजी कैलेंडर",
    nativeAdvisorTitle: "देशी वृक्षारोपण सलाहकार",
    adoptTreeTitle: "पेड़ गोद लें",
    qrPlacardTitle: "मुद्रण योग्य क्यूआर पहचान पट्टिका",
    voiceNoteTitle: "फील्ड वॉयस नोट्स",
  },
};

const LANG_KEY = "leafora.lang.v1";

export function getCurrentLanguage(): LanguageCode {
  if (typeof window === "undefined") return "en";
  return (localStorage.getItem(LANG_KEY) as LanguageCode) || "en";
}

export function setCurrentLanguage(lang: LanguageCode) {
  if (typeof window !== "undefined") {
    localStorage.setItem(LANG_KEY, lang);
    window.dispatchEvent(new Event("leafora:lang-update"));
  }
}
