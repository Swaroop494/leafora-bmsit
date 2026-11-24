/**
 * Campus Phenology Tracker
 * Tracks seasonal biological cycles (flush, flowering, fruiting, leaf-drop) for urban campus trees.
 */

export type Phenophase = "leaf_flush" | "full_foliage" | "flowering" | "fruiting" | "leaf_drop";

export interface SpeciesPhenologySchedule {
  speciesName: string;
  months: {
    month: string; // "Jan", "Feb", ...
    monthIndex: number; // 0 - 11
    activePhases: Phenophase[];
    notes: string;
  }[];
}

export interface PhenologyObservation {
  id: string;
  treeId: string;
  speciesName: string;
  date: string;
  observerName: string;
  observedPhase: Phenophase;
  intensityPercentage: number; // e.g. 70% canopy in bloom
  notes?: string | undefined;
}

export const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

export const PHENOPHASE_LABELS: Record<Phenophase, { label: string; color: string; desc: string }> =
  {
    leaf_flush: {
      label: "Leaf Flush",
      color: "bg-emerald-500 text-white",
      desc: "Tender new copper or lime-green leaves unfolding",
    },
    full_foliage: {
      label: "Full Foliage",
      color: "bg-green-700 text-white",
      desc: "Dense mature canopy with peak chlorophyll coverage",
    },
    flowering: {
      label: "Flowering",
      color: "bg-amber-500 text-black",
      desc: "Buds opening into active floral blossom and pollen release",
    },
    fruiting: {
      label: "Fruiting",
      color: "bg-purple-600 text-white",
      desc: "Seed pods or fleshy drupes developing and maturing",
    },
    leaf_drop: {
      label: "Leaf Fall",
      color: "bg-orange-600 text-white",
      desc: "Deciduous shedding of yellowing or brown leaves",
    },
  };

export const CAMPUS_PHENOLOGY_DATA: Record<string, Phenophase[][]> = {
  // 12 months array for each species:
  Neem: [
    ["leaf_drop"], // Jan
    ["leaf_drop", "leaf_flush"], // Feb
    ["leaf_flush", "flowering"], // Mar (Ugadi fragrant white blossoms)
    ["flowering", "fruiting"], // Apr
    ["fruiting", "full_foliage"], // May (Bitter-sweet yellow drupes)
    ["fruiting", "full_foliage"], // Jun
    ["full_foliage"], // Jul
    ["full_foliage"], // Aug
    ["full_foliage"], // Sep
    ["full_foliage"], // Oct
    ["full_foliage"], // Nov
    ["full_foliage"], // Dec
  ].map((x) => x as Phenophase[]),

  Gulmohar: [
    ["leaf_drop"], // Jan
    ["leaf_drop"], // Feb (Almost bare limbs)
    ["leaf_drop", "leaf_flush"], // Mar
    ["flowering", "leaf_flush"], // Apr (Vibrant scarlet canopy)
    ["flowering", "full_foliage"], // May
    ["fruiting", "full_foliage"], // Jun (Large woody brown pods develop)
    ["fruiting", "full_foliage"], // Jul
    ["fruiting", "full_foliage"], // Aug
    ["full_foliage"], // Sep
    ["full_foliage"], // Oct
    ["full_foliage"], // Nov
    ["leaf_drop"], // Dec
  ].map((x) => x as Phenophase[]),

  "Rain Tree": [
    ["full_foliage"], // Jan
    ["leaf_flush"], // Feb
    ["flowering"], // Mar (Pink powder-puff blossoms)
    ["flowering", "fruiting"], // Apr
    ["fruiting"], // May (Black sweet sticky pods)
    ["full_foliage"], // Jun
    ["full_foliage"], // Jul
    ["full_foliage"], // Aug
    ["full_foliage"], // Sep
    ["flowering"], // Oct (Second lighter bloom)
    ["full_foliage"], // Nov
    ["full_foliage"], // Dec
  ].map((x) => x as Phenophase[]),

  "Indian Banyan": [
    ["full_foliage"], // Jan
    ["full_foliage"], // Feb
    ["leaf_flush", "fruiting"], // Mar (Syconia figs ripening for birds)
    ["fruiting", "full_foliage"], // Apr
    ["full_foliage"], // May
    ["full_foliage"], // Jun
    ["full_foliage"], // Jul
    ["full_foliage"], // Aug
    ["leaf_flush"], // Sep
    ["fruiting"], // Oct
    ["full_foliage"], // Nov
    ["full_foliage"], // Dec
  ].map((x) => x as Phenophase[]),

  Peepal: [
    ["full_foliage"], // Jan
    ["leaf_drop"], // Feb
    ["leaf_flush"], // Mar (Glossy pinkish-coppery new leaves)
    ["full_foliage"], // Apr
    ["fruiting"], // May (Small purple figs)
    ["fruiting", "full_foliage"], // Jun
    ["full_foliage"], // Jul
    ["full_foliage"], // Aug
    ["full_foliage"], // Sep
    ["full_foliage"], // Oct
    ["full_foliage"], // Nov
    ["full_foliage"], // Dec
  ].map((x) => x as Phenophase[]),

  "Honge (Indian Beech)": [
    ["full_foliage"], // Jan
    ["leaf_drop"], // Feb
    ["leaf_flush", "flowering"], // Mar (Fragrant lilac/white clusters)
    ["flowering", "fruiting"], // Apr
    ["fruiting"], // May (Woody pods develop)
    ["full_foliage"], // Jun
    ["full_foliage"], // Jul
    ["full_foliage"], // Aug
    ["full_foliage"], // Sep
    ["full_foliage"], // Oct
    ["full_foliage"], // Nov
    ["full_foliage"], // Dec
  ].map((x) => x as Phenophase[]),
};

const PHENO_STORAGE_KEY = "leafora.phenology.observations.v1";

export function loadPhenologyObservations(): PhenologyObservation[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(PHENO_STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function savePhenologyObservation(
  obs: Omit<PhenologyObservation, "id">,
): PhenologyObservation {
  const full: PhenologyObservation = {
    ...obs,
    id: `PH-${Date.now()}`,
  };
  const list = loadPhenologyObservations();
  const updated = [full, ...list];
  if (typeof window !== "undefined") {
    localStorage.setItem(PHENO_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("leafora:phenology-update"));
  }
  return full;
}
