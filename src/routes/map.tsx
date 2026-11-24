import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageHead } from "@/components/SiteNav";
import { HealthBadge } from "@/components/HealthBadge";
import { EcosystemCalculatorModal } from "@/components/EcosystemCalculatorModal";
import { NativePlantingAdvisorModal } from "@/components/NativePlantingAdvisorModal";
import { PhenologyModal } from "@/components/PhenologyModal";
import { useTrees } from "@/lib/use-trees";
import {
  BOUNDS,
  estimateCarbon,
  hazardIndex,
  latest,
  speciesInfo,
  type HealthCategory,
  type Tree,
} from "@/lib/trees";
import { calculateZoneBiodiversity } from "@/lib/biodiversity";
import { calculateEcosystemBenefits } from "@/lib/ecosystem-calculator";
import {
  Trees,
  AlertTriangle,
  Flame,
  CloudRain,
  Sprout,
  Download,
  Calendar,
  Layers,
} from "lucide-react";

export const Route = createFileRoute("/map")({
  head: () => ({
    meta: [
      { title: "Campus Map & Carbon Bank — Leafora" },
      {
        name: "description",
        content:
          "Every geo-tagged campus tree with health status, hazard risk flags, cooling microclimate footprints, and the campus carbon bank.",
      },
      { property: "og:title", content: "Campus tree map — Leafora" },
      {
        property: "og:description",
        content: "Geo-tagged trees, health categories, heat-island cooling, and carbon storage.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MapPage,
});

const CATS: HealthCategory[] = ["Healthy", "Watch", "Stressed", "Critical"];
const FILL: Record<HealthCategory, string> = {
  Healthy: "fill-healthy",
  Watch: "fill-watch",
  Stressed: "fill-stressed",
  Critical: "fill-critical",
};

const xy = (t: Tree) => ({
  x: ((t.lng - BOUNDS.minLng) / (BOUNDS.maxLng - BOUNDS.minLng)) * 1000,
  y: (1 - (t.lat - BOUNDS.minLat) / (BOUNDS.maxLat - BOUNDS.minLat)) * 700,
});

function MapPage() {
  const { trees } = useTrees();
  const [filter, setFilter] = useState<HealthCategory[]>(CATS);
  const [layer, setLayer] = useState<"health" | "hazard" | "cooling" | "biodiversity">("health");
  const [sel, setSel] = useState<string | null>(null);

  // Modals state
  const [isEcoModalOpen, setIsEcoModalOpen] = useState(false);
  const [isNativeModalOpen, setIsNativeModalOpen] = useState(false);
  const [isPhenoModalOpen, setIsPhenoModalOpen] = useState(false);

  const activeTrees = trees ?? [];
  const list = activeTrees.filter((t) => filter.includes(latest(t).category));
  const selected = activeTrees.find((t) => t.id === sel);

  // Aggregated Campus Ecosystem Bank
  const totalCo2Kg = activeTrees.reduce((acc, t) => {
    const s = latest(t);
    const sp = speciesInfo(t.species);
    return acc + estimateCarbon(s.girthCm, s.heightM, sp.woodDensity).co2Kg;
  }, 0);

  const totalO2Kg = activeTrees.reduce((acc, t) => {
    const s = latest(t);
    const sp = speciesInfo(t.species);
    return acc + estimateCarbon(s.girthCm, s.heightM, sp.woodDensity).annualO2Kg;
  }, 0);

  const totalRainwaterL = activeTrees.reduce((acc, t) => {
    const s = latest(t);
    const sp = speciesInfo(t.species);
    return acc + estimateCarbon(s.girthCm, s.heightM, sp.woodDensity).rainwaterL;
  }, 0);

  const flaggedCount = activeTrees.filter((t) => hazardIndex(latest(t)) >= 50).length;
  const nativeCount = activeTrees.filter((t) => speciesInfo(t.species).native).length;
  const zoneBiodiversity = calculateZoneBiodiversity(activeTrees);

  function exportCsv() {
    const rows = [
      [
        "id",
        "species",
        "scientific",
        "kannada",
        "zone",
        "lat",
        "lng",
        "score",
        "category",
        "girth_cm",
        "height_m",
        "co2e_kg",
        "hazard_index",
      ],
      ...activeTrees.map((t) => {
        const s = latest(t);
        const sp = speciesInfo(t.species);
        const c = estimateCarbon(s.girthCm, s.heightM, sp.woodDensity);
        return [
          t.id,
          t.species,
          sp.scientific,
          sp.kannadaName || "",
          t.zone,
          t.lat.toFixed(5),
          t.lng.toFixed(5),
          s.score,
          s.category,
          s.girthCm,
          s.heightM,
          c.co2Kg.toFixed(1),
          hazardIndex(s),
        ];
      }),
    ];
    const url = URL.createObjectURL(
      new Blob([rows.map((r) => r.join(",")).join("\n")], { type: "text/csv;charset=utf-8;" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `bmsit-tree-inventory-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportGeoJson() {
    const geojson = {
      type: "FeatureCollection",
      features: activeTrees.map((t) => {
        const s = latest(t);
        const sp = speciesInfo(t.species);
        const c = estimateCarbon(s.girthCm, s.heightM, sp.woodDensity);
        return {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [t.lng, t.lat],
          },
          properties: {
            id: t.id,
            species: t.species,
            zone: t.zone,
            healthScore: s.score,
            category: s.category,
            girthCm: s.girthCm,
            heightM: s.heightM,
            co2eKg: c.co2Kg,
            hazardIndex: hazardIndex(s),
          },
        };
      }),
    };
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(geojson, null, 2)], { type: "application/geo+json" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `bmsit-trees-${new Date().toISOString().slice(0, 10)}.geojson`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <PageHead
        eyebrow="Interactive Spatial Log & Carbon Bank"
        title="The campus, tree by tree."
        intro="Explore geo-tagged canopy assets across BMSIT Yelahanka. Toggle between Health Screening, Hazard Risk Index, Heat-Island Microclimate Cooling, and Zone Biodiversity layers."
      />

      <div className="mx-auto max-w-7xl px-5 md:px-10 pb-24">
        {/* Campus Carbon Bank & Green Infrastructure KPI Strip */}
        <dl className="grid grid-cols-2 gap-px border-y bg-border sm:grid-cols-3 lg:grid-cols-6">
          <div className="bg-background py-6 px-4">
            <dt className="eyebrow text-muted-foreground">Campus Trees</dt>
            <dd className="mt-2 font-display text-4xl font-bold">{activeTrees.length}</dd>
            <p className="text-[11px] text-muted-foreground mt-1">100% Geo-tagged</p>
          </div>
          <div className="bg-background py-6 px-4">
            <dt className="eyebrow text-muted-foreground">Carbon Bank</dt>
            <dd className="mt-2 font-display text-4xl font-bold text-emerald-700 dark:text-emerald-400">
              {(totalCo2Kg / 1000).toFixed(1)} <span className="text-xl font-normal">t</span>
            </dd>
            <p className="text-[11px] text-muted-foreground mt-1">Metric tonnes CO₂e</p>
          </div>
          <div className="bg-background py-6 px-4">
            <dt className="eyebrow text-muted-foreground">Annual Oxygen</dt>
            <dd className="mt-2 font-display text-4xl font-bold text-blue-600">
              {(totalO2Kg / 1000).toFixed(1)} <span className="text-xl font-normal">t</span>
            </dd>
            <p className="text-[11px] text-muted-foreground mt-1">
              Supports {Math.round(totalO2Kg / 260)} people
            </p>
          </div>
          <div className="bg-background py-6 px-4">
            <dt className="eyebrow text-muted-foreground">Rain Runoff Kept</dt>
            <dd className="mt-2 font-display text-4xl font-bold text-sky-600">
              {(totalRainwaterL / 1000).toFixed(0)} <span className="text-xl font-normal">kL</span>
            </dd>
            <p className="text-[11px] text-muted-foreground mt-1">Interception / year</p>
          </div>
          <div className="bg-background py-6 px-4">
            <dt className="eyebrow text-critical">Flagged for Review</dt>
            <dd className="mt-2 font-display text-4xl font-bold text-critical">{flaggedCount}</dd>
            <p className="text-[11px] text-muted-foreground mt-1">Hazard Risk ≥ 50</p>
          </div>
          <div className="bg-background py-6 px-4">
            <dt className="eyebrow text-muted-foreground">Native Ratio</dt>
            <dd className="mt-2 font-display text-4xl font-bold text-primary">
              {activeTrees.length > 0 ? Math.round((nativeCount / activeTrees.length) * 100) : 0}%
            </dd>
            <p className="text-[11px] text-muted-foreground mt-1">
              {nativeCount} of {activeTrees.length} native
            </p>
          </div>
        </dl>

        {/* Layer Filters & Action Controls */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {/* Category filter pills */}
            {CATS.map((c) => {
              const on = filter.includes(c);
              return (
                <button
                  key={c}
                  aria-pressed={on}
                  onClick={() => setFilter(on ? filter.filter((x) => x !== c) : [...filter, c])}
                  className={`rounded-full border px-3.5 py-1 text-xs font-medium transition-colors ${
                    on
                      ? "border-ink bg-ink text-ink-foreground shadow-xs"
                      : "opacity-60 hover:opacity-100"
                  }`}
                >
                  {c}
                </button>
              );
            })}

            <span className="mx-2 hidden h-5 w-px bg-border sm:block" />

            {/* Map thematic layers */}
            {(
              [
                ["health", "Health Status"],
                ["hazard", "Hazard Risk Index"],
                ["cooling", "Heat-Island Cooling"],
                ["biodiversity", "Biodiversity Hotspots"],
              ] as const
            ).map(([l, name]) => (
              <button
                key={l}
                aria-pressed={layer === l}
                onClick={() => setLayer(l)}
                className={`eyebrow rounded-sm px-3 py-1.5 text-xs transition-colors ${
                  layer === l
                    ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                    : "border hover:border-foreground/60"
                }`}
              >
                {name}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsNativeModalOpen(true)}
              className="flex items-center gap-1.5 rounded-sm border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
            >
              <Sprout className="h-3.5 w-3.5 text-emerald-600" />
              Native Advisor
            </button>
            <button
              onClick={() => setIsEcoModalOpen(true)}
              className="flex items-center gap-1.5 rounded-sm border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
            >
              <Trees className="h-3.5 w-3.5 text-primary" />
              Eco Calculator
            </button>
            <button
              onClick={exportCsv}
              className="flex items-center gap-1.5 rounded-sm bg-ink px-3 py-1.5 text-xs font-medium text-ink-foreground hover:bg-primary transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              Export CSV
            </button>
            <button
              onClick={exportGeoJson}
              className="rounded-sm border px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
              title="Export GeoJSON for GIS / QGIS"
            >
              GeoJSON
            </button>
          </div>
        </div>

        {/* Map Container & Sidebar */}
        <div className="mt-6 grid gap-8 lg:grid-cols-12">
          {/* Schematic SVG Campus Map */}
          <div className="grain relative overflow-hidden rounded-md border bg-card lg:col-span-8 shadow-sm">
            <svg
              viewBox="0 0 1000 700"
              className="h-auto w-full select-none"
              role="img"
              aria-label="Schematic campus map"
            >
              {/* Campus Grounds & Paths */}
              <g className="fill-muted/70 stroke-border">
                <rect x="320" y="210" width="280" height="170" rx="4" />
                <rect x="650" y="110" width="190" height="130" rx="4" />
                <rect x="110" y="430" width="220" height="150" rx="4" />
                <rect
                  x="610"
                  y="410"
                  width="310"
                  height="210"
                  rx="100"
                  className="fill-secondary/60"
                />
              </g>

              {/* Main Spine Road */}
              <path
                d="M-20 400 C 300 370, 600 430, 1020 350"
                className="fill-none stroke-stone-300 dark:stroke-stone-700"
                strokeWidth="22"
              />
              <path
                d="M500 0 L 500 700"
                className="fill-none stroke-stone-200 dark:stroke-stone-800"
                strokeWidth="8"
                strokeDasharray="6 6"
              />

              {/* Zone Landmarks */}
              <g className="eyebrow fill-muted-foreground" fontSize="13" letterSpacing="0.1em">
                <text x="335" y="240">
                  MAIN ACADEMIC BLOCK
                </text>
                <text x="665" y="140">
                  LIBRARY & AUDITORIUM
                </text>
                <text x="125" y="460">
                  STUDENT HOSTEL ROAD
                </text>
                <text x="705" y="520">
                  SPORTS ARENA & CRICKET
                </text>
                <text x="80" y="120">
                  WEST GATE
                </text>
                <text x="880" y="160">
                  EAST GATE
                </text>
              </g>

              {/* Biodiversity Hotspots Overlay */}
              {layer === "biodiversity" && (
                <g className="pointer-events-none">
                  <circle
                    cx="450"
                    cy="290"
                    r="140"
                    fill="rgba(16, 185, 129, 0.12)"
                    stroke="#10b981"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                  <circle
                    cx="740"
                    cy="180"
                    r="110"
                    fill="rgba(16, 185, 129, 0.18)"
                    stroke="#10b981"
                    strokeWidth="2"
                  />
                  <text
                    x="700"
                    y="260"
                    className="text-[11px] font-mono fill-emerald-700 font-bold"
                  >
                    H&apos; = 1.94 (Hotspot)
                  </text>
                  <text
                    x="400"
                    y="360"
                    className="text-[11px] font-mono fill-emerald-700 font-bold"
                  >
                    H&apos; = 1.62 (Diverse)
                  </text>
                </g>
              )}

              {/* Tree Markers & Thematic Layers */}
              {list.map((t) => {
                const { x, y } = xy(t);
                const s = latest(t);
                const hz = hazardIndex(s);
                const isSelected = sel === t.id;

                return (
                  <g
                    key={t.id}
                    className="cursor-pointer transition-transform hover:scale-125"
                    onClick={() => setSel(t.id)}
                    tabIndex={0}
                    role="button"
                    aria-label={`${t.species} ${t.id}, ${s.category}`}
                    onKeyDown={(e) => e.key === "Enter" && setSel(t.id)}
                  >
                    {/* Microclimate Cooling Footprint Layer */}
                    {layer === "cooling" && (
                      <g className="pointer-events-none animate-pulse">
                        <circle
                          cx={x}
                          cy={y}
                          r={s.heightM * 5.2}
                          className="fill-cyan-500/20 stroke-cyan-400"
                          strokeWidth="1.5"
                          strokeDasharray="3 3"
                        />
                        <text
                          x={x}
                          y={y - s.heightM * 5.2 - 3}
                          textAnchor="middle"
                          fontSize="9"
                          className="fill-cyan-800 dark:fill-cyan-300 font-mono font-bold"
                        >
                          -{(1.5 + (s.heightM / 40) * 2.7).toFixed(1)}°C
                        </text>
                      </g>
                    )}

                    {/* Hazard Risk Halo */}
                    {layer === "hazard" && hz >= 50 && (
                      <g className="pointer-events-none">
                        <circle
                          cx={x}
                          cy={y}
                          r={32}
                          className="fill-critical/20 stroke-critical animate-ping"
                          strokeWidth="1.5"
                        />
                        <circle
                          cx={x}
                          cy={y}
                          r={30}
                          className="fill-critical/20 stroke-critical"
                          strokeWidth="2"
                        />
                      </g>
                    )}

                    {/* Base Tree Marker */}
                    <circle
                      cx={x}
                      cy={y}
                      r={isSelected ? 16 : 11}
                      className={`${FILL[s.category]} stroke-background transition-all`}
                      strokeWidth={isSelected ? 4 : 2.5}
                    />

                    {/* Tree ID text on hover or selected */}
                    {isSelected && (
                      <g className="pointer-events-none">
                        <rect
                          x={x - 30}
                          y={y - 34}
                          width="60"
                          height="18"
                          rx="3"
                          className="fill-ink"
                        />
                        <text
                          x={x}
                          y={y - 21}
                          textAnchor="middle"
                          className="fill-ink-foreground font-mono font-bold text-[10px]"
                        >
                          {t.id}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Layer Legend in map bottom corner */}
            <div className="absolute bottom-3 left-3 rounded-md bg-background/90 p-2.5 text-[11px] shadow-sm backdrop-blur-xs border space-y-1">
              <span className="font-bold text-foreground block">
                Active Layer: {layer.toUpperCase()}
              </span>
              {layer === "cooling" && (
                <p className="text-cyan-700 dark:text-cyan-400">
                  Dashed circles show canopy thermal shadow (-1.5°C to -4.2°C ambient reduction).
                </p>
              )}
              {layer === "hazard" && (
                <p className="text-critical font-medium">
                  Red pulsing rings indicate trees with Hazard Risk Index ≥ 50 requiring arborist
                  audit.
                </p>
              )}
              {layer === "biodiversity" && (
                <p className="text-emerald-700 dark:text-emerald-400">
                  Green zones show high Shannon-Wiener diversity index (H&apos; &gt; 1.6).
                </p>
              )}
              {layer === "health" && (
                <div className="flex items-center gap-3 pt-0.5">
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-healthy" /> Healthy
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-watch" /> Watch
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-stressed" /> Stressed
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-critical" /> Critical
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar: Tree Details & Inventory List */}
          <aside className="lg:col-span-4 space-y-6">
            {selected ? (
              <div className="rounded-md border bg-card p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <span className="eyebrow text-muted-foreground">
                    {selected.id} · {selected.zone}
                  </span>
                  <HealthBadge cat={latest(selected).category} score={latest(selected).score} />
                </div>

                <div>
                  <h2 className="text-3xl font-display font-bold">{selected.species}</h2>
                  <p className="font-serif italic text-xs text-muted-foreground">
                    {speciesInfo(selected.species).scientific}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 border-y py-3 text-xs font-mono">
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase">
                      Carbon Stored
                    </span>
                    <span className="font-bold text-foreground">
                      {estimateCarbon(
                        latest(selected).girthCm,
                        latest(selected).heightM,
                        speciesInfo(selected.species).woodDensity,
                      ).co2Kg.toFixed(0)}{" "}
                      kg CO₂e
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase">
                      Hazard Index
                    </span>
                    <span
                      className={`font-bold ${hazardIndex(latest(selected)) >= 50 ? "text-critical" : "text-foreground"}`}
                    >
                      {hazardIndex(latest(selected))} / 100
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to="/trees/$id"
                    params={{ id: selected.id }}
                    className="w-full rounded-sm bg-ink px-4 py-2.5 text-center text-xs font-semibold text-ink-foreground hover:bg-primary transition-colors"
                  >
                    Open Full Tree Health Record & Timeline
                  </Link>
                </div>
              </div>
            ) : (
              <div className="rounded-md border border-dashed p-6 text-center text-xs text-muted-foreground">
                Click any tree marker on the campus map to view species details, pathology
                screening, and carbon footprint.
              </div>
            )}

            {/* Zone Biodiversity Breakdown */}
            {layer === "biodiversity" && (
              <div className="rounded-md border bg-card p-5 space-y-3">
                <span className="eyebrow text-muted-foreground">Zone Biodiversity Ratings</span>
                <div className="space-y-2 text-xs">
                  {zoneBiodiversity.map((z) => (
                    <div key={z.zone} className="flex items-center justify-between border-b pb-1.5">
                      <div>
                        <span className="font-semibold">{z.zone}</span>
                        <span className="text-muted-foreground block text-[10px]">
                          {z.speciesCount} species · {z.nativePercentage}% Native
                        </span>
                      </div>
                      <div className="text-right font-mono">
                        <span className="font-bold text-emerald-700 dark:text-emerald-400">
                          H&apos; {z.shannonIndex}
                        </span>
                        <span className="text-[10px] text-muted-foreground block">Shannon</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Filtered Trees List */}
            <div className="space-y-3">
              <span className="eyebrow text-muted-foreground">
                Campus Inventory ({list.length} Trees)
              </span>
              <ul className="divide-y rounded-md border bg-card max-h-80 overflow-y-auto">
                {list.map((t) => (
                  <li key={t.id}>
                    <button
                      onClick={() => setSel(t.id)}
                      className={`flex w-full items-center justify-between p-3 text-left transition-colors hover:bg-muted ${
                        sel === t.id ? "bg-primary/10" : ""
                      }`}
                    >
                      <div>
                        <span className="font-medium text-xs text-foreground">{t.species}</span>
                        <span className="ml-2 font-mono text-[10px] text-muted-foreground">
                          {t.id}
                        </span>
                        <span className="block text-[10px] text-muted-foreground">{t.zone}</span>
                      </div>
                      <HealthBadge cat={latest(t).category} score={latest(t).score} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>

      {/* Reusable Modals */}
      <EcosystemCalculatorModal isOpen={isEcoModalOpen} onClose={() => setIsEcoModalOpen(false)} />
      <NativePlantingAdvisorModal
        isOpen={isNativeModalOpen}
        onClose={() => setIsNativeModalOpen(false)}
      />
      <PhenologyModal isOpen={isPhenoModalOpen} onClose={() => setIsPhenoModalOpen(false)} />
    </div>
  );
}
