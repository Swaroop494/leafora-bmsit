import { createFileRoute, Link } from "@tanstack/react-router";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";
import { HealthBadge } from "@/components/HealthBadge";
import { useTrees } from "@/lib/use-trees";
import { carePlan, estimateCarbon, hazardIndex, latest, makeScan, speciesInfo, SYMPTOMS, type SymptomKey } from "@/lib/trees";
export const Route = createFileRoute("/trees/$id")({
  head: ({ params }) => ({ meta: [{ title: `Tree ${params.id} — Leafora` }, { name: "description", content: "Tree record: health timeline, care plan, carbon and QR identity." }, { property: "og:title", content: `Tree ${params.id} — Leafora` }, { property: "og:description", content: "Campus tree record." }, { property: "og:type", content: "article" }, { name: "twitter:card", content: "summary" }] }),
  component: TreePage,
});
function TreePage() {
  const { id } = Route.useParams(); const { trees, update } = useTrees(); const [sym, setSym] = useState<SymptomKey[]>([]); const [name, setName] = useState("");
  if (!trees) return <p className="p-10">Loading…</p>;
  const t = trees.find((x) => x.id === id);
  if (!t) return <div className="p-10"><p>Tree not found.</p><Link to="/map" className="text-primary underline">Back to map</Link></div>;
  const s = latest(t); const c = estimateCarbon(s.girthCm, s.heightM, speciesInfo(t.species).woodDensity); const prev = t.scans[t.scans.length - 2];
  const set = (fn: (x: typeof t) => typeof t) => update((all) => all.map((x) => (x.id === id ? fn(x) : x)));
  return (
    <div className="mx-auto max-w-7xl px-5 py-16 md:px-10">
      <p className="eyebrow text-primary">{t.id} · {t.zone}</p>
      <h1 className="mt-4 text-6xl md:text-8xl">{t.species}</h1><p className="italic text-muted-foreground">{speciesInfo(t.species).scientific}</p>
      {prev && s.score < prev.score - 5 && <p role="alert" className="mt-6 rounded-sm bg-critical px-4 py-3 text-primary-foreground">Alert: health dropped {prev.score} → {s.score} since last scan.</p>}
      <div className="mt-12 grid gap-10 md:grid-cols-3">
        <div><div className="flex items-end gap-3"><span className="font-display text-8xl leading-none">{s.score}</span><HealthBadge cat={s.category} /></div><p className="mt-4 eyebrow">Hazard risk index {hazardIndex(s)}</p>
          <ul className="mt-6 list-disc space-y-1 pl-5 text-sm">{carePlan(s.symptoms, s.category).map((x) => <li key={x}>{x}</li>)}</ul></div>
        <div><p className="eyebrow text-muted-foreground">Carbon estimate</p><p className="mt-2 font-display text-4xl">{c.co2Kg.toFixed(0)} kg CO₂e</p><p className="text-sm text-muted-foreground">{c.biomassKg.toFixed(0)} kg biomass · {c.carbonKg.toFixed(0)} kg C · girth {s.girthCm} cm · {s.heightM} m</p>
          <p className="mt-8 eyebrow text-muted-foreground">Health timeline</p><ol className="mt-2 space-y-2">{t.scans.map((x) => <li key={x.id} className="flex justify-between text-sm"><span className="font-mono">{x.date.slice(0, 10)}</span><HealthBadge cat={x.category} score={x.score} /></li>)}</ol></div>
        <div className="space-y-6"><div className="inline-block rounded-md bg-card p-4"><QRCodeSVG value={`leafora:${t.id}`} size={140} /></div><p className="eyebrow">QR tree identity</p>
          {t.adoptedBy ? <p>Adopted by <b>{t.adoptedBy}</b> <button className="text-primary underline" onClick={() => set((x) => { const { adoptedBy: _a, ...r } = x; return r; })}>Release</button></p> :
            <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); if (name.trim()) set((x) => ({ ...x, adoptedBy: name.trim() })); }}><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" aria-label="Your name" className="flex-1 rounded-sm border border-input bg-card px-3 py-2" /><button className="rounded-sm bg-primary px-4 text-primary-foreground">Adopt</button></form>}
        </div>
      </div>
      <section className="mt-16 rule pt-8"><h2 className="text-3xl">Quick rescan</h2><div className="mt-4 flex flex-wrap gap-2">{SYMPTOMS.map((x) => { const on = sym.includes(x.key); return <button key={x.key} aria-pressed={on} onClick={() => setSym(on ? sym.filter((k) => k !== x.key) : [...sym, x.key])} className={`rounded-full border px-4 py-2 text-sm ${on ? "bg-ink text-ink-foreground" : ""}`}>{x.label}</button>; })}</div>
        <button onClick={() => { set((x) => ({ ...x, scans: [...x.scans, makeScan(s.girthCm, s.heightM, sym, s.photos)] })); setSym([]); }} className="mt-6 rounded-sm bg-ink px-6 py-3 text-ink-foreground hover:bg-primary">Add scan to timeline</button></section>
    </div>
  );
}
