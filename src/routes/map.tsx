import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageHead } from "@/components/SiteNav";
import { HealthBadge } from "@/components/HealthBadge";
import { useTrees } from "@/lib/use-trees";
import { BOUNDS, estimateCarbon, hazardIndex, latest, speciesInfo, type HealthCategory, type Tree } from "@/lib/trees";

export const Route = createFileRoute("/map")({
  head: () => ({
    meta: [
      { title: "Campus map & carbon bank — Leafora" },
      { name: "description", content: "Every geo-tagged campus tree with health status, hazard flags and the campus carbon bank." },
      { property: "og:title", content: "Campus tree map — Leafora" },
      { property: "og:description", content: "Geo-tagged trees, health categories and estimated carbon storage." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MapPage,
});

const CATS: HealthCategory[] = ["Healthy", "Watch", "Stressed", "Critical"];
const FILL: Record<HealthCategory, string> = { Healthy: "fill-healthy", Watch: "fill-watch", Stressed: "fill-stressed", Critical: "fill-critical" };
const xy = (t: Tree) => ({ x: ((t.lng - BOUNDS.minLng) / (BOUNDS.maxLng - BOUNDS.minLng)) * 1000, y: (1 - (t.lat - BOUNDS.minLat) / (BOUNDS.maxLat - BOUNDS.minLat)) * 700 });

function MapPage() {
  const { trees } = useTrees();
  const [filter, setFilter] = useState<HealthCategory[]>(CATS);
  const [layer, setLayer] = useState<"health" | "hazard" | "cooling">("health");
  const [sel, setSel] = useState<string | null>(null);
  const list = (trees ?? []).filter((t) => filter.includes(latest(t).category));
  const selected = trees?.find((t) => t.id === sel);
  const bank = (trees ?? []).reduce((a, t) => { const s = latest(t); return a + estimateCarbon(s.girthCm, s.heightM, speciesInfo(t.species).woodDensity).co2Kg; }, 0);
  const flagged = (trees ?? []).filter((t) => hazardIndex(latest(t)) >= 50).length;

  function exportCsv() {
    const rows = [["id", "species", "zone", "lat", "lng", "score", "category", "girth_cm", "height_m", "co2e_kg"], ...(trees ?? []).map((t) => { const s = latest(t); return [t.id, t.species, t.zone, t.lat, t.lng, s.score, s.category, s.girthCm, s.heightM, estimateCarbon(s.girthCm, s.heightM, speciesInfo(t.species).woodDensity).co2Kg.toFixed(1)]; })];
    const url = URL.createObjectURL(new Blob([rows.map((r) => r.join(",")).join("\n")], { type: "text/csv" }));
    const a = document.createElement("a"); a.href = url; a.download = "leafora-inventory.csv"; a.click(); URL.revokeObjectURL(url);
  }

  return (
    <div>
      <PageHead eyebrow="Map & monitor" title="The campus, tree by tree." />
      <div className="mx-auto max-w-7xl px-5 md:px-10">
        <dl className="grid grid-cols-2 gap-px border-y md:grid-cols-4">
          {[["Trees logged", trees?.length ?? "—"], ["Campus carbon bank", `${(bank / 1000).toFixed(1)} t CO₂e`], ["Flagged for review", flagged], ["Native species", (trees ?? []).filter((t) => speciesInfo(t.species).native).length]].map(([k, v]) => (
            <div key={k as string} className="py-6"><dt className="eyebrow text-muted-foreground">{k}</dt><dd className="mt-2 font-display text-4xl">{v}</dd></div>
          ))}
        </dl>
        <div className="mt-8 flex flex-wrap items-center gap-2">
          {CATS.map((c) => { const on = filter.includes(c); return <button key={c} aria-pressed={on} onClick={() => setFilter(on ? filter.filter((x) => x !== c) : [...filter, c])} className={`rounded-full border px-4 py-1.5 text-sm ${on ? "border-ink bg-ink text-ink-foreground" : "opacity-60"}`}>{c}</button>; })}
          <span className="mx-2 h-6 w-px bg-border" />
          {(["health", "hazard", "cooling"] as const).map((l) => <button key={l} aria-pressed={layer === l} onClick={() => setLayer(l)} className={`eyebrow rounded-sm px-3 py-2 ${layer === l ? "bg-primary text-primary-foreground" : "border"}`}>{l === "cooling" ? "Heat-island cooling" : l === "hazard" ? "Hazard risk" : "Health"}</button>)}
          <button onClick={exportCsv} className="ml-auto text-sm text-primary underline underline-offset-4">Export CSV</button>
        </div>
        <div className="mt-6 grid gap-8 lg:grid-cols-12">
          <div className="grain overflow-hidden rounded-md border bg-card lg:col-span-8">
            <svg viewBox="0 0 1000 700" className="h-auto w-full" role="img" aria-label="Schematic campus map">
              <g className="fill-muted stroke-border">
                <rect x="320" y="220" width="260" height="160" /><rect x="640" y="120" width="180" height="120" /><rect x="120" y="440" width="200" height="140" />
                <rect x="600" y="420" width="300" height="200" rx="100" className="fill-secondary" />
              </g>
              <path d="M0 400 C 300 380, 600 420, 1000 360" className="fill-none stroke-foreground/20" strokeWidth="18" />
              <g className="eyebrow fill-muted-foreground" fontSize="14"><text x="330" y="245">MAIN BLOCK</text><text x="650" y="145">LIBRARY</text><text x="130" y="465">HOSTELS</text><text x="690" y="525">SPORTS FIELD</text></g>
              {list.map((t) => {
                const { x, y } = xy(t); const s = latest(t); const hz = hazardIndex(s);
                return (
                  <g key={t.id} className="cursor-pointer" onClick={() => setSel(t.id)} tabIndex={0} role="button" aria-label={`${t.species} ${t.id}, ${s.category}`} onKeyDown={(e) => e.key === "Enter" && setSel(t.id)}>
                    {layer === "cooling" && <circle cx={x} cy={y} r={s.heightM * 5} className="fill-copper/25" />}
                    {layer === "hazard" && hz >= 50 && <circle cx={x} cy={y} r={30} className="fill-critical/20 stroke-critical" />}
                    <circle cx={x} cy={y} r={sel === t.id ? 15 : 11} className={`${FILL[s.category]} stroke-background`} strokeWidth="3" />
                  </g>
                );
              })}
            </svg>
          </div>
          <aside className="lg:col-span-4">
            {selected ? (
              <div className="rounded-md border bg-card p-6">
                <p className="eyebrow text-muted-foreground">{selected.id} · {selected.zone}</p>
                <h2 className="mt-2 text-4xl">{selected.species}</h2>
                <div className="mt-4 flex gap-3"><HealthBadge cat={latest(selected).category} score={latest(selected).score} /><span className="eyebrow self-center">Hazard {hazardIndex(latest(selected))}</span></div>
                <Link to="/trees/$id" params={{ id: selected.id }} className="mt-6 inline-block rounded-sm bg-ink px-5 py-2.5 text-ink-foreground hover:bg-primary">Open tree record</Link>
              </div>
            ) : <p className="text-muted-foreground">Select a tree on the map.</p>}
            <ul className="mt-6 divide-y border-y">
              {list.map((t) => <li key={t.id}><button onClick={() => setSel(t.id)} className="flex w-full items-center justify-between py-3 text-left hover:text-primary"><span>{t.species} <span className="font-mono text-xs text-muted-foreground">{t.id}</span></span><HealthBadge cat={latest(t).category} /></button></li>)}
            </ul>
          </aside>
        </div>
      </div>
    </div>
  );
}
