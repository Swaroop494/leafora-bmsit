// Frontend-only data layer. Swap storage functions for API calls later.
import { CAMPUS_TREE_CATALOG } from "./tree-id";
import { DISEASE_DATABASE, screenTreeHealth } from "./disease-detection";
import { calculateEcosystemBenefits } from "./ecosystem-calculator";

export type HealthCategory = "Healthy" | "Watch" | "Stressed" | "Critical";

export interface SpeciesInfo {
  name: string;
  scientific: string;
  kannadaName?: string;
  hindiName?: string;
  woodDensity: number; // g/cm3
  native: boolean;
}

export const SPECIES: SpeciesInfo[] = CAMPUS_TREE_CATALOG.map((c) => ({
  name: c.name,
  scientific: c.scientific,
  kannadaName: c.kannadaName,
  hindiName: c.hindiName,
  woodDensity: c.woodDensity,
  native: c.native,
}));

export const CAPTURE_INPUTS = [
  {
    key: "leafFront",
    label: "Leaf — upper surface",
    cue: "Species cues, leaf spot, discolouration",
    required: true,
  },
  {
    key: "leafBack",
    label: "Leaf — underside",
    cue: "Pests, fungal growth, pigmentation",
    required: false,
  },
  { key: "bark", label: "Bark & trunk", cue: "Borer holes, cracks, oozing sap", required: true },
  {
    key: "whole",
    label: "Whole tree / crown",
    cue: "Crown dieback, canopy density, lean",
    required: true,
  },
  {
    key: "flower",
    label: "Flower or fruit",
    cue: "Optional — sharpens identification",
    required: false,
  },
] as const;
export type PhotoKey = (typeof CAPTURE_INPUTS)[number]["key"];

export const SYMPTOMS = [
  { key: "leafSpot", label: "Leaf spots (Alternaria / Cercospora)", part: "leaf", impact: 22 },
  { key: "yellowing", label: "Yellowing / chlorosis pigmentation", part: "leaf", impact: 18 },
  { key: "sap", label: "Excessive oozing sap / gummosis", part: "trunk", impact: 25 },
  { key: "borer", label: "Borer holes & frass", part: "trunk", impact: 30 },
  { key: "girthLoss", label: "Shrinking girth / cambium collapse", part: "trunk", impact: 20 },
  { key: "dieback", label: "Crown dieback & stagheading", part: "crown", impact: 35 },
  { key: "sparse", label: "Sparse foliage / defoliation", part: "crown", impact: 20 },
  { key: "compaction", label: "Paved / compacted root zone", part: "site", impact: 30 },
] as const;
export type SymptomKey = (typeof SYMPTOMS)[number]["key"];

// Proposed weights — validated for urban tropical campus pilot.
export const HEALTH_WEIGHTS = { leaf: 0.35, trunk: 0.3, crown: 0.25, site: 0.1 } as const;

export interface StewardshipEntry {
  id: string;
  date: string;
  stewardName: string;
  actionType: "watering" | "mulching" | "pruning" | "compost" | "observation";
  notes: string;
}

export interface Scan {
  id: string;
  date: string;
  girthCm: number;
  heightM: number;
  symptoms: SymptomKey[];
  scores: { leaf: number; trunk: number; crown: number; site: number };
  score: number;
  category: HealthCategory;
  photos: PhotoKey[];
  photoUrls?: Partial<Record<PhotoKey, string>> | undefined;
  detectedDiseaseId?: string | undefined;
  diseaseName?: string | undefined;
  voiceNoteUrl?: string | undefined;
  notes?: string | undefined;
}

export interface Tree {
  id: string;
  species: string;
  candidates: { name: string; confidence: number }[];
  lat: number;
  lng: number;
  zone: string;
  scans: Scan[];
  adoptedBy?: string | undefined;
  adoptionDate?: string | undefined;
  stewardshipLog?: StewardshipEntry[] | undefined;
}

export function category(score: number): HealthCategory {
  if (score >= 80) return "Healthy";
  if (score >= 60) return "Watch";
  if (score >= 40) return "Stressed";
  return "Critical";
}

export function scoreHealth(symptoms: SymptomKey[], diseaseId?: string) {
  const screened = screenTreeHealth(symptoms, "seed", diseaseId);
  return {
    scores: screened.organScores,
    score: screened.overallHealthScore,
    category: screened.category,
    primaryDisease: screened.primaryDisease,
  };
}

/** Chave et al. (2014) pantropical AGB, kg. D = girth/π (cm), H in m, ρ in g/cm³. */
export function estimateCarbon(girthCm: number, heightM: number, woodDensity: number) {
  const d = girthCm / Math.PI;
  const biomassKg =
    d > 0 && heightM > 0 ? 0.0673 * Math.pow(woodDensity * d * d * heightM, 0.976) : 0;
  const carbonKg = biomassKg * 0.47;
  const co2Kg = carbonKg * 3.67;
  const eco = calculateEcosystemBenefits(girthCm, heightM, woodDensity);
  return {
    biomassKg,
    totalBiomassKg: eco.totalBiomassKg,
    carbonKg,
    co2Kg,
    annualCo2Kg: eco.annualCo2SeqKg,
    annualO2Kg: eco.annualOxygenKg,
    peopleO2: eco.peopleOxygenSupported,
    rainwaterL: eco.annualRainwaterInterceptedLiters,
  };
}

export function carePlan(
  symptoms: SymptomKey[],
  cat: HealthCategory,
  diseaseId?: string,
): string[] {
  const screened = screenTreeHealth(symptoms, "seed", diseaseId);
  return screened.carePlan;
}

/** Hazard Risk Index 0–100: higher = needs qualified review sooner. */
export function hazardIndex(scan: Scan) {
  let r = 100 - scan.score;
  if (scan.symptoms.includes("dieback")) r += 15;
  if (scan.symptoms.includes("borer")) r += 15;
  if (scan.symptoms.includes("sap")) r += 10;
  if (scan.heightM > 12) r += 8;
  return Math.min(100, Math.round(r));
}

export function identify(seed: string) {
  let h = 0;
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const first = h % SPECIES.length;
  const a = 72 + (h % 22);
  const b = Math.round((100 - a) * 0.65);
  return [
    { name: SPECIES[first]!.name, confidence: a },
    { name: SPECIES[(first + 3) % SPECIES.length]!.name, confidence: b },
    { name: SPECIES[(first + 5) % SPECIES.length]!.name, confidence: Math.max(1, 100 - a - b) },
  ];
}

export function speciesInfo(name: string): SpeciesInfo {
  return SPECIES.find((s) => s.name.toLowerCase() === name.toLowerCase()) ?? SPECIES[0]!;
}

// Campus bounds (BMSIT, Yelahanka) for the schematic map.
export const BOUNDS = { minLat: 13.1325, maxLat: 13.1375, minLng: 77.5655, maxLng: 77.5715 };
export const ZONES = [
  "Main Block",
  "Library Lawn",
  "Hostel Road",
  "Sports Field",
  "East Gate",
  "Cafeteria Path",
];

export function makeScan(
  girthCm: number,
  heightM: number,
  symptoms: SymptomKey[],
  photos: PhotoKey[],
  date = new Date().toISOString(),
  extra?:
    | {
        photoUrls?: Partial<Record<PhotoKey, string>> | undefined;
        voiceNoteUrl?: string | undefined;
        notes?: string | undefined;
        diseaseId?: string | undefined;
      }
    | undefined,
): Scan {
  const h = scoreHealth(symptoms, extra?.diseaseId);
  return {
    id: crypto.randomUUID(),
    date,
    girthCm,
    heightM,
    symptoms,
    photos,
    photoUrls: extra?.photoUrls,
    voiceNoteUrl: extra?.voiceNoteUrl,
    notes: extra?.notes,
    detectedDiseaseId: h.primaryDisease.id,
    diseaseName: h.primaryDisease.commonName,
    scores: h.scores,
    score: h.score,
    category: h.category,
  };
}

function seed(): Tree[] {
  const mk = (
    id: string,
    species: string,
    lat: number,
    lng: number,
    zone: string,
    hist: [string, number, number, SymptomKey[], string?][],
    adoptedBy?: string,
  ): Tree => ({
    id,
    species,
    lat,
    lng,
    zone,
    adoptedBy,
    adoptionDate: adoptedBy ? "2026-08-15" : undefined,
    candidates: [
      { name: species, confidence: 92 },
      { name: "Honge", confidence: 5 },
      { name: "Jamun", confidence: 3 },
    ],
    stewardshipLog: adoptedBy
      ? [
          {
            id: "st-1",
            date: "2026-10-10",
            stewardName: adoptedBy,
            actionType: "watering",
            notes: "Watered 50 liters around the dripline in evening.",
          },
          {
            id: "st-2",
            date: "2026-11-01",
            stewardName: adoptedBy,
            actionType: "mulching",
            notes: "Applied 5 cm leaf mulch around root zone.",
          },
        ]
      : [],
    scans: hist.map(([d, g, ht, s, dis]) =>
      makeScan(g, ht, s, ["leafFront", "bark", "whole"], d, { diseaseId: dis }),
    ),
  });

  return [
    mk(
      "LF-0001",
      "Neem",
      13.1352,
      77.5683,
      "Main Block",
      [
        ["2026-06-02", 168, 11, []],
        ["2026-10-14", 167, 11, ["leafSpot"], "earlyLeafSpot"],
      ],
      "Swaroop Patil",
    ),
    mk(
      "LF-0002",
      "Rain Tree",
      13.1361,
      77.5701,
      "Library Lawn",
      [["2026-09-01", 290, 16, []]],
      "Prof. Chandrashekhar N",
    ),
    mk("LF-0003", "Gulmohar", 13.1338, 77.5672, "Hostel Road", [
      ["2026-05-10", 140, 9, ["sparse"]],
      ["2026-10-20", 138, 9, ["sparse", "dieback", "compaction"], "crownDieback"],
    ]),
    mk(
      "LF-0004",
      "Peepal",
      13.1369,
      77.5668,
      "East Gate",
      [["2026-08-11", 220, 14, ["yellowing"], "chlorosis"]],
      "Gagan KS",
    ),
    mk("LF-0005", "Honge", 13.1332, 77.5698, "Sports Field", [["2026-10-01", 120, 8, []]]),
    mk("LF-0006", "African Tulip", 13.1345, 77.5707, "Sports Field", [
      ["2026-07-07", 150, 13, ["borer", "sap"], "trunkBorer"],
      ["2026-11-02", 146, 13, ["borer", "sap", "girthLoss", "dieback"], "trunkBorer"],
    ]),
    mk(
      "LF-0007",
      "Jamun",
      13.1358,
      77.5662,
      "Main Block",
      [["2026-09-19", 132, 10, ["leafSpot"], "earlyLeafSpot"]],
      "Sneha Tapse",
    ),
    mk(
      "LF-0008",
      "Indian Banyan",
      13.1365,
      77.5688,
      "Library Lawn",
      [["2026-08-01", 380, 18, []]],
      "Madhurya B O",
    ),
    mk("LF-0009", "Tabebuia", 13.1342, 77.5691, "Cafeteria Path", [["2026-09-15", 95, 7, []]]),
  ];
}

const KEY = "leafora.trees.v2";
export function loadTrees(): Tree[] {
  if (typeof window === "undefined") return seed();
  const raw = localStorage.getItem(KEY);
  if (!raw) {
    const s = seed();
    localStorage.setItem(KEY, JSON.stringify(s));
    return s;
  }
  try {
    return JSON.parse(raw) as Tree[];
  } catch {
    return seed();
  }
}

export function saveTrees(trees: Tree[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem(KEY, JSON.stringify(trees));
    window.dispatchEvent(new Event("leafora:update"));
  }
}

export function latest(t: Tree): Scan {
  return t.scans[t.scans.length - 1]!;
}

export function nextId(trees: Tree[]) {
  return `LF-${String(trees.length + 1).padStart(4, "0")}`;
}

export const CATEGORY_CLASS: Record<HealthCategory, string> = {
  Healthy: "bg-healthy text-primary-foreground",
  Watch: "bg-watch text-ink",
  Stressed: "bg-stressed text-primary-foreground",
  Critical: "bg-critical text-primary-foreground",
};
