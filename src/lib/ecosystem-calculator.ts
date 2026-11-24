/**
 * Carbon & Ecosystem Services Calculator
 * Based on Chave et al. (2014) Pantropical Tree Allometry & i-Tree Eco urban forestry models.
 */

export interface EcosystemBenefits {
  // Biomass & Carbon
  diameterCm: number;
  agbBiomassKg: number; // Above-ground dry biomass
  bgbBiomassKg: number; // Below-ground root biomass (~26% of AGB)
  totalBiomassKg: number;
  totalCarbonKg: number; // 47% of total dry biomass
  co2StoredKg: number; // Lifetime CO2 equivalent (C * 3.6663)

  // Annual Flows
  annualCo2SeqKg: number; // Annual CO2 sequestration rate (kg/yr)
  annualOxygenKg: number; // Oxygen output (kg/yr)
  peopleOxygenSupported: number; // Average human consumes ~260 kg O2/yr

  // Hydrology & Microclimate
  canopyAreaSqM: number; // Crown projection footprint
  annualRainwaterInterceptedLiters: number; // Stormwater runoff mitigated
  coolingEnergySavedKWh: number; // Evapotranspirative & shade cooling benefit

  // Air Quality Filtration (grams/yr)
  pm25FilteredGrams: number;
  pm10FilteredGrams: number;
  no2FilteredGrams: number;
  so2FilteredGrams: number;

  // Valuation
  carbonCreditValueINR: number; // Estimated social/carbon credit asset value (₹)
}

/**
 * Calculates comprehensive ecosystem benefits for a campus tree.
 * @param girthCm Girth at breast height (GBH) in cm
 * @param heightM Total tree height in meters
 * @param woodDensity Wood density in g/cm³ (default 0.60)
 * @param canopyRadiusM Estimated canopy radius in meters (default derived from height)
 */
export function calculateEcosystemBenefits(
  girthCm: number,
  heightM: number,
  woodDensity = 0.6,
  canopyRadiusM?: number,
): EcosystemBenefits {
  const d = Math.max(1, girthCm / Math.PI); // DBH in cm
  const h = Math.max(1, heightM);
  const rho = Math.max(0.2, woodDensity);

  // Chave et al. (2014) pantropical allometric equation
  const agb = 0.0673 * Math.pow(rho * d * d * h, 0.976);
  const bgb = agb * 0.26; // Cairns et al. (1997) root-to-shoot ratio
  const totalBiomass = agb + bgb;
  const carbon = totalBiomass * 0.47;
  const co2Lifetime = carbon * 3.6663;

  // Annual growth increment (derived based on species size curve)
  const annualGrowthFactor = Math.min(0.065, Math.max(0.02, 1.8 / Math.sqrt(d + 10)));
  const annualCo2 = co2Lifetime * annualGrowthFactor;

  // Oxygen production: Photosynthesis formula 6CO2 + 6H2O -> C6H12O6 + 6O2
  // 1 mole CO2 (44g) releases 1 mole O2 (32g) -> 0.727 kg O2 per kg CO2 sequestered
  const annualO2 = annualCo2 * 0.727;
  const peopleOxygen = Number((annualO2 / 260).toFixed(2));

  // Canopy projection
  const radius = canopyRadiusM ?? Math.max(1.5, h * 0.35);
  const canopyArea = Math.PI * radius * radius;

  // Bangalore annual rainfall: ~970 mm = 970 L/m²
  // Mature tree canopy intercepts 25% to 35% of rain through foliar retention & stemflow
  const annualRainfallLiters = canopyArea * 970;
  const rainwaterIntercepted = Math.round(annualRainfallLiters * 0.28);

  // Urban microclimate cooling & shade energy reduction: ~45 kWh/yr per 10m² canopy
  const coolingKWh = Math.round((canopyArea / 10) * 45);

  // Air filtration metrics (based on USDA Forest Service / i-Tree Bangalore data)
  // Mature campus trees intercept fine particulate matter on leaf cuticular waxes
  const leafAreaIndex = 4.2; // Leaf area to ground area ratio
  const totalLeafArea = canopyArea * leafAreaIndex;
  const pm25 = Math.round(totalLeafArea * 0.45); // grams/yr
  const pm10 = Math.round(totalLeafArea * 0.95); // grams/yr
  const no2 = Math.round(totalLeafArea * 0.75); // grams/yr
  const so2 = Math.round(totalLeafArea * 0.35); // grams/yr

  // Carbon economic value: ₹1,650 per tonne CO2 (approx $20/t)
  const carbonValueINR = Math.round((co2Lifetime / 1000) * 1650);

  return {
    diameterCm: Number(d.toFixed(1)),
    agbBiomassKg: Number(agb.toFixed(1)),
    bgbBiomassKg: Number(bgb.toFixed(1)),
    totalBiomassKg: Number(totalBiomass.toFixed(1)),
    totalCarbonKg: Number(carbon.toFixed(1)),
    co2StoredKg: Number(co2Lifetime.toFixed(1)),
    annualCo2SeqKg: Number(annualCo2.toFixed(1)),
    annualOxygenKg: Number(annualO2.toFixed(1)),
    peopleOxygenSupported: peopleOxygen,
    canopyAreaSqM: Number(canopyArea.toFixed(1)),
    annualRainwaterInterceptedLiters: rainwaterIntercepted,
    coolingEnergySavedKWh: coolingKWh,
    pm25FilteredGrams: pm25,
    pm10FilteredGrams: pm10,
    no2FilteredGrams: no2,
    so2FilteredGrams: so2,
    carbonCreditValueINR: carbonValueINR,
  };
}
