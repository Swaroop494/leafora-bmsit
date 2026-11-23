// Frontend-only data layer. Swap storage functions for API calls later.
export type HealthCategory = "Healthy" | "Watch" | "Stressed" | "Critical";

export interface SpeciesInfo {
  name: string;
  scientific: string;
  woodDensity: number; // g/cm3
  native: boolean;
}

export const SPECIES: SpeciesInfo[] = [
  { name: "Neem", scientific: "Azadirachta indica", woodDensity: 0.69, native: true },
  { name: "Rain Tree", scientific: "Samanea saman", woodDensity: 0.52, native: false },
  { name: "Indian Banyan", scientific: "Ficus benghalensis", woodDensity: 0.58, native: true },
  { name: "Gulmohar", scientific: "Delonix regia", woodDensity: 0.6, native: false },
  { name: "Peepal", scientific: "Ficus religiosa", woodDensity: 0.55, native: true },
  { name: "Honge", scientific: "Pongamia pinnata", woodDensity: 0.65, native: true },
  { name: "Jamun", scientific: "Syzygium cumini", woodDensity: 0.72, native: true },
  { name: "African Tulip", scientific: "Spathodea campanulata", woodDensity: 0.38, native: false },
];

export const CAPTURE_INPUTS = [
  { key: "leafFront", label: "Leaf — upper surface", cue: "Species cues, leaf spot, discolouration", required: true },
  { key: "leafBack", label: "Leaf — underside", cue: "Pests, fungal growth, pigmentation", required: false },
  { key: "bark", label: "Bark & trunk", cue: "Borer holes, cracks, oozing sap", required: true },
  { key: "whole", label: "Whole tree / crown", cue: "Crown dieback, canopy density, lean", required: true },
  { key: "flower", label: "Flower or fruit", cue: "Optional — sharpens identification", required: false },
] as const;
export type PhotoKey = (typeof CAPTURE_INPUTS)[number]["key"];

export const SYMPTOMS = [
  { key: "leafSpot", label: "Leaf spots", part: "leaf", impact: 22 },
  { key: "yellowing", label: "Yellowing / leaf pigmentation", part: "leaf", impact: 18 },
  { key: "sap", label: "Excessive oozing sap", part: "trunk", impact: 25 },
  { key: "borer", label: "Borer holes", part: "trunk", impact: 30 },
  { key: "girthLoss", label: "Shrinking girth", part: "trunk", impact: 20 },
  { key: "dieback", label: "Crown dieback", part: "crown", impact: 35 },
  { key: "sparse", label: "Sparse canopy", part: "crown", impact: 20 },
  { key: "compaction", label: "Paved / compacted root zone", part: "site", impact: 30 },
] as const;
export type SymptomKey = (typeof SYMPTOMS)[number]["key"];

// Proposed weights — must be validated in the pilot.
export const HEALTH_WEIGHTS = { leaf: 0.35, trunk: 0.3, crown: 0.25, site: 0.1 } as const;

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
}

export interface Tree {
  id: string;
  species: string;
  candidates: { name: string; confidence: number }[];
  lat: number;
  lng: number;
  zone: string;
  scans: Scan[];
  adoptedBy?: string;
}

export function category(score: number): HealthCategory {
  if (score >= 80) return "Healthy";
  if (score >= 60) return "Watch";
  if (score >= 40) return "Stressed";
  return "Critical";
}

export function scoreHealth(symptoms: SymptomKey[]) {
  const parts = { leaf: 100, trunk: 100, crown: 100, site: 100 };
  for (const s of SYMPTOMS) if (symptoms.includes(s.key)) parts[s.part] = Math.max(0, parts[s.part] - s.impact);
  const score = Math.round(
    parts.leaf * HEALTH_WEIGHTS.leaf + parts.trunk * HEALTH_WEIGHTS.trunk + parts.crown * HEALTH_WEIGHTS.crown + parts.site * HEALTH_WEIGHTS.site,
  );
  return { scores: parts, score, category: category(score) };
}

/** Chave et al. (2014) pantropical AGB, kg. D = girth/π (cm), H in m, ρ in g/cm³. */
export function estimateCarbon(girthCm: number, heightM: number, woodDensity: number) {
  const d = girthCm / Math.PI;
  const biomassKg = d > 0 && heightM > 0 ? 0.0673 * Math.pow(woodDensity * d * d * heightM, 0.976) : 0;
  const carbonKg = biomassKg * 0.47;
  return { biomassKg, carbonKg, co2Kg: carbonKg * 3.67 };
}

export function carePlan(symptoms: SymptomKey[], cat: HealthCategory): string[] {
  const plan: string[] = [];
  if (symptoms.includes("leafSpot")) plan.push("Prune affected twigs; apply neem-oil spray after review.");
  if (symptoms.includes("yellowing")) plan.push("Check soil moisture and nutrients; mulch the root zone.");
  if (symptoms.includes("sap") || symptoms.includes("borer")) plan.push("Inspect trunk for borers; seal wounds and request arborist visit.");
  if (symptoms.includes("girthLoss")) plan.push("Re-measure girth in 30 days to confirm decline.");
  if (symptoms.includes("dieback") || symptoms.includes("sparse")) plan.push("Remove dead wood; assess crown for structural risk.");
  if (symptoms.includes("compaction")) plan.push("De-pave or aerate a 1 m ring around the trunk.");
  if (plan.length === 0) plan.push("No action needed — rescan in 90 days to keep the timeline current.");
  if (cat === "Critical") plan.unshift("Flag for qualified arborist review before any treatment.");
  return plan;
}

/** Hazard Risk Index 0–100: higher = needs qualified review sooner. */
export function hazardIndex(scan: Scan) {
  let r = 100 - scan.score;
  if (scan.symptoms.includes("dieback")) r += 15;
  if (scan.symptoms.includes("borer")) r += 10;
  if (scan.heightM > 12) r += 10;
  return Math.min(100, Math.round(r));
}

export function identify(seed: string) {
  let h = 0;
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const first = h % SPECIES.length;
  const a = 70 + (h % 25);
  const b = Math.round((100 - a) * 0.65);
  return [
    { name: SPECIES[first]!.name, confidence: a },
    { name: SPECIES[(first + 3) % SPECIES.length]!.name, confidence: b },
    { name: SPECIES[(first + 5) % SPECIES.length]!.name, confidence: 100 - a - b },
  ];
}

export function speciesInfo(name: string) {
  return SPECIES.find((s) => s.name === name) ?? SPECIES[0]!;
}

// Campus bounds (BMSIT, Yelahanka) for the schematic map.
export const BOUNDS = { minLat: 13.1325, maxLat: 13.1375, minLng: 77.5655, maxLng: 77.5715 };
export const ZONES = ["Main Block", "Library Lawn", "Hostel Road", "Sports Field", "East Gate"];

export function makeScan(girthCm: number, heightM: number, symptoms: SymptomKey[], photos: PhotoKey[], date = new Date().toISOString()): Scan {
  const h = scoreHealth(symptoms);
  return { id: crypto.randomUUID(), date, girthCm, heightM, symptoms, photos, ...h };
}

function seed(): Tree[] {
  const mk = (id: string, species: string, lat: number, lng: number, zone: string, hist: [string, number, number, SymptomKey[]][]): Tree => ({
    id, species, lat, lng, zone,
    candidates: [{ name: species, confidence: 92 }, { name: "Honge", confidence: 5 }, { name: "Jamun", confidence: 3 }],
    scans: hist.map(([d, g, ht, s]) => makeScan(g, ht, s, ["leafFront", "bark", "whole"], d)),
  });
  return [
    mk("LF-0001", "Neem", 13.1352, 77.5683, "Main Block", [["2026-06-02", 168, 11, []], ["2026-10-14", 167, 11, ["leafSpot"]]]),
    mk("LF-0002", "Rain Tree", 13.1361, 77.5701, "Library Lawn", [["2026-09-01", 290, 16, []]]),
    mk("LF-0003", "Gulmohar", 13.1338, 77.5672, "Hostel Road", [["2026-05-10", 140, 9, ["sparse"]], ["2026-10-20", 138, 9, ["sparse", "dieback", "compaction"]]]),
    mk("LF-0004", "Peepal", 13.1369, 77.5668, "East Gate", [["2026-08-11", 220, 14, ["yellowing"]]]),
    mk("LF-0005", "Honge", 13.1332, 77.5698, "Sports Field", [["2026-10-01", 120, 8, []]]),
    mk("LF-0006", "African Tulip", 13.1345, 77.5707, "Sports Field", [["2026-07-07", 150, 13, ["borer", "sap"]], ["2026-11-02", 146, 13, ["borer", "sap", "girthLoss", "dieback"]]]),
    mk("LF-0007", "Jamun", 13.1358, 77.5662, "Main Block", [["2026-09-19", 132, 10, ["leafSpot"]]]),
  ];
}

const KEY = "leafora.trees.v1";
export function loadTrees(): Tree[] {
  if (typeof window === "undefined") return seed();
  const raw = localStorage.getItem(KEY);
  if (!raw) { const s = seed(); localStorage.setItem(KEY, JSON.stringify(s)); return s; }
  try { return JSON.parse(raw) as Tree[]; } catch { return seed(); }
}
export function saveTrees(trees: Tree[]) {
  localStorage.setItem(KEY, JSON.stringify(trees));
  window.dispatchEvent(new Event("leafora:update"));
}
export function latest(t: Tree): Scan { return t.scans[t.scans.length - 1]!; }
export function nextId(trees: Tree[]) { return `LF-${String(trees.length + 1).padStart(4, "0")}`; }

export const CATEGORY_CLASS: Record<HealthCategory, string> = {
  Healthy: "bg-healthy text-primary-foreground",
  Watch: "bg-watch text-ink",
  Stressed: "bg-stressed text-primary-foreground",
  Critical: "bg-critical text-primary-foreground",
};
