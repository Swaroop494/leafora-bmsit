import { describe, expect, it } from "vitest";
import { category, estimateCarbon, scoreHealth, hazardIndex, type SymptomKey } from "./trees";
import { identifySpeciesWithTreeID, extractTreeIDFeatures, CAMPUS_TREE_CATALOG } from "./tree-id";
import { screenTreeHealth, generateGradCamPoints, DISEASE_DATABASE } from "./disease-detection";
import { calculateEcosystemBenefits } from "./ecosystem-calculator";
import { calculateZoneBiodiversity, getNativePlantingRecommendations } from "./biodiversity";
import { CAMPUS_PHENOLOGY_DATA } from "./phenology";

describe("tree rules & health categorization", () => {
  it("uses the four health bands from the deck", () => {
    expect(category(80)).toBe("Healthy");
    expect(category(74)).toBe("Watch");
    expect(category(45)).toBe("Stressed");
    expect(category(39)).toBe("Critical");
  });

  it("carbon is 47% of dry biomass and CO2 is carbon x 3.67", () => {
    const r = estimateCarbon(168, 11, 0.69);
    expect(r.carbonKg).toBeCloseTo(r.biomassKg * 0.47);
    expect(r.co2Kg).toBeCloseTo(r.carbonKg * 3.67);
  });

  it("a tree with no symptoms scores 100", () => {
    expect(scoreHealth([]).score).toBe(100);
  });

  it("hazard index scores higher for trees with dieback and borers", () => {
    const healthyScan = {
      id: "1",
      date: "2026-11-01",
      girthCm: 100,
      heightM: 8,
      symptoms: [] as SymptomKey[],
      scores: { leaf: 100, trunk: 100, crown: 100, site: 100 },
      score: 100,
      category: "Healthy" as const,
      photos: ["leafFront" as const],
    };
    expect(hazardIndex(healthyScan)).toBe(0);

    const highRiskScan = {
      ...healthyScan,
      score: 40,
      heightM: 15,
      symptoms: ["dieback", "borer"] as SymptomKey[],
    };
    expect(hazardIndex(highRiskScan)).toBeGreaterThanOrEqual(50);
  });
});

describe("TreeID Leaf Identification Engine (Manu Chopra)", () => {
  it("extracts multi-scale HoCS curvature and shape features", () => {
    const features = extractTreeIDFeatures("test-neem-leaf-seed");
    expect(features.meanCurvatureHoCS).toHaveLength(5);
    expect(features.aspectRatio).toBeGreaterThan(0);
    expect(["smooth", "serrated", "lobed", "compound"]).toContain(features.leafMargin);
  });

  it("identifies top-3 candidates with confidence summing to 100%", () => {
    const res = identifySpeciesWithTreeID("neem-sample-seed");
    expect(res.candidates).toHaveLength(3);
    const sumConf = res.candidates.reduce((acc, c) => acc + c.confidence, 0);
    expect(sumConf).toBe(100);
    expect(res.candidates[0]!.confidence).toBeGreaterThanOrEqual(res.candidates[1]!.confidence);
    expect(res.candidates[1]!.confidence).toBeGreaterThanOrEqual(res.candidates[2]!.confidence);
  });
});

describe("Plant-Health-Monitoring (CodeByPinar) & Grad-CAM", () => {
  it("correctly identifies primary pathological disease and assigns care plan", () => {
    const res = screenTreeHealth(["leafSpot"], "seed-leaf-spot");
    expect(res.primaryDisease.id).toBe("earlyLeafSpot");
    expect(res.carePlan.length).toBeGreaterThan(0);
    expect(res.carePlan.some((step) => step.toLowerCase().includes("neem"))).toBe(true);
  });

  it("generates explainable Grad-CAM neural attention heatmap points", () => {
    const points = generateGradCamPoints("earlyLeafSpot", "test-seed");
    expect(points.length).toBeGreaterThan(0);
    for (const pt of points) {
      expect(pt.x).toBeGreaterThanOrEqual(0);
      expect(pt.x).toBeLessThanOrEqual(100);
      expect(pt.y).toBeGreaterThanOrEqual(0);
      expect(pt.y).toBeLessThanOrEqual(100);
      expect(pt.intensity).toBeGreaterThan(0);
    }
  });

  it("flags urgent arborist review when severe trunk borers are detected", () => {
    const res = screenTreeHealth(["borer", "sap"], "borer-sample");
    expect(res.arboristFlagNeeded).toBe(true);
    expect(res.primaryDisease.severityLevel).toBe("Severe");
  });
});

describe("Carbon & Ecosystem Allometry Calculator", () => {
  it("computes above-ground and below-ground biomass using Chave et al. equation", () => {
    const eco = calculateEcosystemBenefits(180, 14, 0.69);
    expect(eco.agbBiomassKg).toBeGreaterThan(100);
    expect(eco.bgbBiomassKg).toBeCloseTo(eco.agbBiomassKg * 0.26, 0);
    expect(eco.annualOxygenKg).toBeGreaterThan(0);
    expect(eco.annualRainwaterInterceptedLiters).toBeGreaterThan(0);
    expect(eco.peopleOxygenSupported).toBeGreaterThan(0);
  });
});

describe("Campus Biodiversity & Native Restoration Advisor", () => {
  it("computes Shannon-Wiener and Simpson diversity index per zone", () => {
    const sampleCampusTrees = [
      { species: "Neem", zone: "Library Lawn" },
      { species: "Rain Tree", zone: "Library Lawn" },
      { species: "Indian Banyan", zone: "Library Lawn" },
      { species: "Peepal", zone: "Library Lawn" },
      { species: "Neem", zone: "Hostel Road" },
      { species: "Gulmohar", zone: "Hostel Road" },
    ];
    const bio = calculateZoneBiodiversity(sampleCampusTrees);
    expect(bio.length).toBe(2);
    expect(bio[0]!.shannonIndex).toBeGreaterThan(0);
    expect(bio[0]!.simpsonIndex).toBeGreaterThanOrEqual(0);
  });

  it("recommends native species based on site goals", () => {
    const recs = getNativePlantingRecommendations("cooling", "medium");
    expect(recs.length).toBeGreaterThan(0);
    expect(recs.every((r) => r.species.native)).toBe(true);
  });
});

describe("Campus Phenology Tracker", () => {
  it("provides 12-month biological calendars for key campus species", () => {
    expect(CAMPUS_PHENOLOGY_DATA["Neem"]).toHaveLength(12);
    expect(CAMPUS_PHENOLOGY_DATA["Gulmohar"]).toHaveLength(12);
    expect(CAMPUS_PHENOLOGY_DATA["Rain Tree"]).toHaveLength(12);
  });
});
