/**
 * Biodiversity Hotspots & Native-Planting Advisor
 * Computes ecological diversity indices and native species recommendations.
 */

import { CAMPUS_TREE_CATALOG, type TreeSpeciesProfile } from "./tree-id";

export interface ZoneBiodiversity {
  zone: string;
  totalTrees: number;
  speciesCount: number;
  shannonIndex: number; // H' (typically 1.5 - 3.5 in healthy ecosystems)
  simpsonIndex: number; // 1 - D (0 to 1, higher = more diverse)
  nativeCount: number;
  exoticCount: number;
  nativePercentage: number;
  dominantSpecies: string;
}

export interface NativeRecommendation {
  species: TreeSpeciesProfile;
  suitabilityScore: number; // 0-100%
  primaryReason: string;
  recommendedSpacingM: number;
  canopySpreadPotentialM: number;
  ecologicalNiche: string;
  waterNeed: "Low" | "Moderate" | "Regular";
  growthRate: "Slow" | "Moderate" | "Fast";
}

/**
 * Calculates Shannon-Wiener and Simpson diversity metrics.
 */
export function calculateZoneBiodiversity(
  trees: { species: string; zone: string }[],
): ZoneBiodiversity[] {
  const zoneMap: Record<string, string[]> = {};

  for (const t of trees) {
    if (!zoneMap[t.zone]) zoneMap[t.zone] = [];
    zoneMap[t.zone]!.push(t.species);
  }

  const results: ZoneBiodiversity[] = [];

  for (const [zone, spList] of Object.entries(zoneMap)) {
    const total = spList.length;
    if (total === 0) continue;

    const counts: Record<string, number> = {};
    for (const s of spList) counts[s] = (counts[s] || 0) + 1;

    let shannon = 0;
    let simpsonSum = 0;
    let nativeCount = 0;
    let maxCount = 0;
    let dominant = spList[0]!;

    for (const [sp, c] of Object.entries(counts)) {
      const p = c / total;
      shannon -= p * Math.log(p);
      simpsonSum += c * (c - 1);

      if (c > maxCount) {
        maxCount = c;
        dominant = sp;
      }

      const match = CAMPUS_TREE_CATALOG.find((cat) => cat.name === sp);
      if (match?.native) nativeCount += c;
    }

    const simpson = total > 1 ? 1 - simpsonSum / (total * (total - 1)) : 0;
    const exoticCount = total - nativeCount;

    results.push({
      zone,
      totalTrees: total,
      speciesCount: Object.keys(counts).length,
      shannonIndex: Number(shannon.toFixed(2)),
      simpsonIndex: Number(simpson.toFixed(2)),
      nativeCount,
      exoticCount,
      nativePercentage: Math.round((nativeCount / total) * 100),
      dominantSpecies: dominant,
    });
  }

  return results.sort((a, b) => b.shannonIndex - a.shannonIndex);
}

/**
 * Native-Planting Advisor: Recommends native species based on site constraints and goals.
 */
export function getNativePlantingRecommendations(
  goal: "carbon" | "cooling" | "pollinator" | "hardy" | "medicinal",
  space: "compact" | "medium" | "large",
): NativeRecommendation[] {
  const nativeSpecies = CAMPUS_TREE_CATALOG.filter((s) => s.native);

  const recommendations: NativeRecommendation[] = nativeSpecies.map((sp) => {
    let score = 70;
    let reason = "";
    let spacing = 8;
    let spread = 10;
    let water: "Low" | "Moderate" | "Regular" = "Moderate";
    let growth: "Slow" | "Moderate" | "Fast" = "Moderate";

    if (sp.name === "Neem") {
      spacing = 7;
      spread = 12;
      water = "Low";
      growth = "Fast";
      if (goal === "medicinal" || goal === "hardy") {
        score = 96;
        reason =
          "Extremely drought hardy with high antimicrobial and natural pest repellent leaves.";
      } else if (goal === "carbon") {
        score = 88;
        reason = "High wood density (0.69 g/cm³) ensures rapid biomass carbon accumulation.";
      } else {
        score = 82;
        reason = "Dense evergreen canopy provides sustained year-round shade.";
      }
    } else if (sp.name === "Indian Banyan") {
      spacing = 15;
      spread = 22;
      water = "Moderate";
      growth = "Slow";
      if (space === "compact") {
        score = 30;
        reason = "Requires extensive horizontal space (>15m) due to spreading prop roots.";
      } else if (goal === "pollinator" || goal === "cooling") {
        score = 98;
        reason = "Keystone campus species supporting 30+ native bird and pollinator species.";
      } else if (goal === "carbon") {
        score = 94;
        reason = "Vast biomass volume sequestering over 4 tonnes CO₂e per mature tree.";
      } else {
        score = 85;
        reason = "Heritage campus landmark providing unparalleled microclimate thermal reduction.";
      }
    } else if (sp.name === "Peepal") {
      spacing = 12;
      spread = 16;
      water = "Low";
      growth = "Moderate";
      if (space === "compact") {
        score = 45;
        reason = "Aggressive root system requires minimum 10m buffer from building foundations.";
      } else if (goal === "cooling" || goal === "carbon") {
        score = 92;
        reason = "High diurnal foliar transpiration and prolonged oxygen generation.";
      } else {
        score = 88;
        reason = "Deep sacred cultural significance and vital nesting habitat for urban birds.";
      }
    } else if (sp.name === "Honge (Indian Beech)") {
      spacing = 6;
      spread = 9;
      water = "Low";
      growth = "Moderate";
      if (goal === "hardy" || goal === "cooling") {
        score = 95;
        reason = "Fixes atmospheric nitrogen into campus soil; glossy thick shade canopy.";
      } else {
        score = 86;
        reason = "Exceptional avenue and walkway tree resilient to vehicular emissions.";
      }
    } else if (sp.name === "Jamun") {
      spacing = 8;
      spread = 11;
      water = "Moderate";
      growth = "Moderate";
      if (goal === "carbon" || goal === "pollinator") {
        score = 93;
        reason =
          "Highest wood density (0.72 g/cm³) among campus species; edible fruit for wildlife.";
      } else {
        score = 85;
        reason = "Dense evergreen shade with aromatic foliar volatile organic compounds.";
      }
    } else if (sp.name === "Teak") {
      spacing = 5;
      spread = 7;
      water = "Low";
      growth = "Moderate";
      if (goal === "carbon") {
        score = 94;
        reason = "Premium structural timber with exceptional high-density carbon locking.";
      } else {
        score = 78;
        reason = "Upright columnar habit suited for campus boundary planting belts.";
      }
    }

    // Space penalties
    if (space === "compact" && (sp.name === "Indian Banyan" || sp.name === "Peepal")) {
      score = Math.min(score, 45);
    } else if (space === "compact" && (sp.name === "Honge" || sp.name === "Neem")) {
      score += 5;
    }

    return {
      species: sp,
      suitabilityScore: Math.min(99, Math.max(30, score)),
      primaryReason: reason,
      recommendedSpacingM: spacing,
      canopySpreadPotentialM: spread,
      ecologicalNiche: sp.ecologicalRole,
      waterNeed: water,
      growthRate: growth,
    };
  });

  return recommendations.sort((a, b) => b.suitabilityScore - a.suitabilityScore);
}
