import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHead } from "@/components/SiteNav";
import { HealthBadge } from "@/components/HealthBadge";
import {
  BOUNDS, CAPTURE_INPUTS, HEALTH_WEIGHTS, SYMPTOMS, ZONES, carePlan, estimateCarbon, identify, loadTrees, makeScan, nextId, saveTrees, speciesInfo,
  type PhotoKey, type SymptomKey,
} from "@/lib/trees";

export const Route = createFileRoute("/capture")({
  head: () => ({
    meta: [
      { title: "Capture a tree — Leafora" },
      { name: "description", content: "Seven guided inputs: leaf, bark, crown, flower, girth, height and GPS to identify and screen a campus tree." },
      { property: "og:title", content: "Capture a tree — Leafora" },
      { property: "og:description", content: "Guided capture protocol for species ID, health screening and carbon estimates." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Capture,
});

type Photos = Partial<Record<PhotoKey, string>>;

function Capture() {
  const navigate = useNavigate();
  const [photos, setPhotos] = useState<Photos>({});
  const [girth, setGirth] = useState("");
  const [height, setHeight] = useState("");
  const [symptoms, setSymptoms] = useState<SymptomKey[]>([]);
  const [zone, setZone] = useState(ZONES[0]!);
  const [gps, setGps] = useState<{ lat: number; lng: number; src: string } | null>(null);
  const [stamp, setStamp] = useState("");
  const [analysed, setAnalysed] = useState(false);
  const [species, setSpecies] = useState<string>("");

  useEffect(() => { setStamp(new Date().toLocaleString()); locate(); }, []);
  function locate() {
    const fallback = () => setGps({ lat: BOUNDS.minLat + Math.random() * (BOUNDS.maxLat - BOUNDS.minLat), lng: BOUNDS.minLng + Math.random() * (BOUNDS.maxLng - BOUNDS.minLng), src: "approximate (campus)" });
    if (!navigator.geolocation) return fallback();
    navigator.geolocation.getCurrentPosition((p) => {
      const { latitude: lat, longitude: lng } = p.coords;
      const inside = lat > BOUNDS.minLat && lat < BOUNDS.maxLat && lng > BOUNDS.minLng && lng < BOUNDS.maxLng;
      inside ? setGps({ lat, lng, src: "device GPS" }) : fallback();
    }, fallback, { timeout: 5000 });
  }

  const required = CAPTURE_INPUTS.filter((i) => i.required);
  const missing = required.filter((i) => !photos[i.key]);
  const g = Number(girth), h = Number(height);
  const measuresOk = g > 0 && g < 2000 && h > 0 && h < 80;
  const canAnalyse = missing.length === 0 && measuresOk && gps;

  const candidates = identify(Object.values(photos).join("|") + girth);
  const health = analysed ? makeScan(g, h, symptoms, Object.keys(photos) as PhotoKey[]) : null;
  const chosen = species || candidates[0]!.name;
  const carbon = estimateCarbon(g, h, speciesInfo(chosen).woodDensity);

  function onFile(key: PhotoKey, f: File | undefined) {
    if (!f) return;
    setPhotos((p) => ({ ...p, [key]: URL.createObjectURL(f) }));
    setAnalysed(false);
  }
  function save() {
    if (!health || !gps) return;
    const trees = loadTrees();
    const id = nextId(trees);
    saveTrees([...trees, { id, species: chosen, candidates, lat: gps.lat, lng: gps.lng, zone, scans: [health] }]);
    navigate({ to: "/trees/$id", params: { id } });
  }

  return (
    <div>
      <PageHead eyebrow="Capture protocol" title="Seven inputs feed the AI — three are compulsory to identify." intro="Find species cues, disease spots, borer holes, crown dieback and canopy density. GPS and timestamp are captured automatically." />
      <div className="mx-auto grid max-w-7xl gap-12 px-5 md:grid-cols-12 md:px-10">
        <div className="space-y-12 md:col-span-7">
          <section>
            <h2 className="text-3xl">Photographs</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {CAPTURE_INPUTS.map((inp, i) => (
                <label key={inp.key} className="group relative flex aspect-[4/3] cursor-pointer flex-col justify-end overflow-hidden rounded-md border bg-card p-4 transition-colors focus-within:ring-2 focus-within:ring-ring hover:border-foreground/50">
                  {photos[inp.key] ? <img src={photos[inp.key]} alt="" className="absolute inset-0 h-full w-full object-cover" /> : (
                    <span className="absolute inset-6 border border-dashed border-foreground/20" aria-hidden="true" />
                  )}
                  <span className="relative rounded-sm bg-background/90 p-2">
                    <span className="eyebrow block text-muted-foreground">0{i + 1} · {inp.required ? <span className="text-primary">Required</span> : "Optional"}</span>
                    <span className="block font-medium">{inp.label}</span>
                    <span className="block text-xs text-muted-foreground">{inp.cue}</span>
                  </span>
                  <input type="file" accept="image/*" capture="environment" className="sr-only" onChange={(e) => onFile(inp.key, e.target.files?.[0])} />
                </label>
              ))}
            </div>
          </section>
          <section className="grid gap-6 sm:grid-cols-2">
            <Field label="06 · Girth at breast height (cm)" value={girth} onChange={(v) => { setGirth(v); setAnalysed(false); }} error={girth !== "" && !(g > 0 && g < 2000) ? "Enter 1–2000 cm" : ""} />
            <Field label="07 · Height (m)" value={height} onChange={(v) => { setHeight(v); setAnalysed(false); }} error={height !== "" && !(h > 0 && h < 80) ? "Enter 1–80 m" : ""} />
            <label className="block sm:col-span-2"><span className="eyebrow text-muted-foreground">Campus zone</span>
              <select value={zone} onChange={(e) => setZone(e.target.value)} className="mt-2 w-full rounded-sm border border-input bg-card px-3 py-3">{ZONES.map((z) => <option key={z}>{z}</option>)}</select>
            </label>
            <div className="rule pt-4 text-sm sm:col-span-2">
              <span className="eyebrow text-muted-foreground">Auto-captured</span>
              <p className="mt-2 font-mono">{gps ? `${gps.lat.toFixed(5)}, ${gps.lng.toFixed(5)} · ${gps.src}` : "Locating…"} · {stamp}</p>
              <button type="button" onClick={locate} className="mt-2 text-primary underline underline-offset-4">Refresh location</button>
            </div>
          </section>
          <section>
            <h2 className="text-3xl">Field observations</h2>
            <p className="mt-2 text-muted-foreground">Tick what you can see — the screening models weight these alongside the images.</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {SYMPTOMS.map((s) => {
                const on = symptoms.includes(s.key);
                return <button key={s.key} type="button" aria-pressed={on} onClick={() => { setSymptoms(on ? symptoms.filter((x) => x !== s.key) : [...symptoms, s.key]); setAnalysed(false); }}
                  className={`rounded-full border px-4 py-2 text-sm transition-colors ${on ? "border-ink bg-ink text-ink-foreground" : "hover:border-foreground/60"}`}>{s.label}</button>;
              })}
            </div>
          </section>
        </div>

        <aside className="md:col-span-5">
          <div className="sticky top-24 rounded-md border bg-card p-6 shadow-lift md:p-8">
            <p className="eyebrow text-primary">Explainable AI engine · proposed</p>
            {!analysed ? (
              <>
                <h2 className="mt-4 text-3xl">Ready when you are.</h2>
                <ul className="mt-6 space-y-2 text-sm">
                  {required.map((r) => <li key={r.key} className={photos[r.key] ? "text-healthy" : "text-muted-foreground"}>{photos[r.key] ? "✓" : "○"} {r.label}</li>)}
                  <li className={measuresOk ? "text-healthy" : "text-muted-foreground"}>{measuresOk ? "✓" : "○"} Girth and height</li>
                </ul>
                <button disabled={!canAnalyse} onClick={() => setAnalysed(true)} className="mt-8 w-full rounded-sm bg-primary px-6 py-3 text-primary-foreground transition-opacity disabled:cursor-not-allowed disabled:opacity-40">Analyse tree</button>
              </>
            ) : health && (
              <div className="mt-4 space-y-6">
                <fieldset>
                  <legend className="eyebrow text-muted-foreground">Top-3 species — confirm one</legend>
                  {candidates.map((c) => (
                    <label key={c.name} className="mt-2 flex cursor-pointer items-center gap-3">
                      <input type="radio" name="sp" checked={chosen === c.name} onChange={() => setSpecies(c.name)} className="accent-primary" />
                      <span className="flex-1">{c.name} <i className="text-xs text-muted-foreground">{speciesInfo(c.name).scientific}</i></span>
                      <span className="font-mono text-sm">{c.confidence}%</span>
                    </label>
                  ))}
                </fieldset>
                <div className="flex items-end gap-3"><span className="font-display text-7xl leading-none">{health.score}</span><HealthBadge cat={health.category} /></div>
                <div className="space-y-2 text-sm">
                  {(Object.keys(HEALTH_WEIGHTS) as (keyof typeof HEALTH_WEIGHTS)[]).map((k) => (
                    <div key={k} className="flex items-center gap-3"><span className="w-28 capitalize">{k} · {HEALTH_WEIGHTS[k] * 100}%</span>
                      <span className="h-1.5 flex-1 rounded bg-muted"><span className="block h-full rounded bg-copper" style={{ width: `${health.scores[k]}%` }} /></span><span className="w-8 text-right font-mono">{health.scores[k]}</span></div>
                  ))}
                </div>
                <div className="rule pt-4"><p className="eyebrow text-muted-foreground">Care plan</p><ul className="mt-2 list-disc space-y-1 pl-5 text-sm">{carePlan(symptoms, health.category).map((c) => <li key={c}>{c}</li>)}</ul></div>
                <div className="rule pt-4 text-sm"><p className="eyebrow text-muted-foreground">Carbon estimate</p><p className="mt-2 font-mono">{carbon.biomassKg.toFixed(0)} kg biomass · {carbon.carbonKg.toFixed(0)} kg C · {carbon.co2Kg.toFixed(0)} kg CO₂e</p></div>
                <button onClick={save} className="w-full rounded-sm bg-ink px-6 py-3 text-ink-foreground hover:bg-primary">Log on campus map</button>
                <p className="text-xs text-muted-foreground">Screening only — confirm with an arborist before treatment.</p>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, error }: { label: string; value: string; onChange: (v: string) => void; error: string }) {
  return (
    <label className="block"><span className="eyebrow text-muted-foreground">{label}</span>
      <input inputMode="decimal" value={value} onChange={(e) => onChange(e.target.value.replace(/[^\d.]/g, ""))} aria-invalid={!!error}
        className={`mt-2 w-full rounded-sm border bg-card px-3 py-3 font-mono ${error ? "border-destructive" : "border-input"}`} />
      {error && <span className="mt-1 block text-xs text-destructive">{error}</span>}
    </label>
  );
}
