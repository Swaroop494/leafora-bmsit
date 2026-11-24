import { createFileRoute, Link } from "@tanstack/react-router";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";
import { HealthBadge } from "@/components/HealthBadge";
import { GradCamOverlay } from "@/components/GradCamOverlay";
import { QrTagModal } from "@/components/QrTagModal";
import { AdoptionModal } from "@/components/AdoptionModal";
import { EcosystemCalculatorModal } from "@/components/EcosystemCalculatorModal";
import { PhenologyModal } from "@/components/PhenologyModal";
import { useTrees } from "@/lib/use-trees";
import {
  hazardIndex,
  latest,
  makeScan,
  speciesInfo,
  SYMPTOMS,
  type SymptomKey,
  type Tree,
} from "@/lib/trees";
import { screenTreeHealth } from "@/lib/disease-detection";
import { calculateEcosystemBenefits } from "@/lib/ecosystem-calculator";
import {
  AlertTriangle,
  Award,
  Calendar,
  CloudRain,
  Eye,
  Heart,
  Printer,
  QrCode,
  Sparkles,
  Trees,
  Wind,
} from "lucide-react";

export const Route = createFileRoute("/trees/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Tree ${params.id} — Leafora Health Record` },
      {
        name: "description",
        content:
          "Campus tree record: health timeline, disease screening, carbon bank, and QR identity.",
      },
      { property: "og:title", content: `Tree ${params.id} — Leafora` },
      { property: "og:description", content: "Campus tree health and carbon log." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TreePage,
});

function TreePage() {
  const { id } = Route.useParams();
  const { trees, update } = useTrees();
  const [sym, setSym] = useState<SymptomKey[]>([]);
  const [rescanGirth, setRescanGirth] = useState("");
  const [rescanHeight, setRescanHeight] = useState("");

  // Modals state
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isAdoptionModalOpen, setIsAdoptionModalOpen] = useState(false);
  const [isEcoModalOpen, setIsEcoModalOpen] = useState(false);
  const [isPhenoModalOpen, setIsPhenoModalOpen] = useState(false);
  const [showGradCam, setShowGradCam] = useState(false);

  if (!trees) return <div className="p-10 font-mono text-sm">Loading campus tree record…</div>;
  const t = trees.find((x) => x.id === id);
  if (!t) {
    return (
      <div className="mx-auto max-w-4xl px-5 py-24 text-center">
        <h2 className="text-4xl font-display">Tree Record Not Found</h2>
        <p className="mt-2 text-muted-foreground">
          The tag {id} does not exist in the active campus inventory.
        </p>
        <Link
          to="/map"
          className="mt-6 inline-block rounded bg-primary px-5 py-2 text-sm text-primary-foreground"
        >
          Return to Campus Map
        </Link>
      </div>
    );
  }

  const s = latest(t);
  const sp = speciesInfo(t.species);
  const eco = calculateEcosystemBenefits(s.girthCm, s.heightM, sp.woodDensity);
  const prev = t.scans[t.scans.length - 2];
  const hIndex = hazardIndex(s);

  // Pathological disease screening for the latest scan
  const disease = screenTreeHealth(s.symptoms, t.id + s.id, s.detectedDiseaseId);

  const setTree = (fn: (x: Tree) => Tree) =>
    update((all) => all.map((x) => (x.id === id ? fn(x) : x)));

  function handleQuickRescan() {
    const newG = Number(rescanGirth) > 0 ? Number(rescanGirth) : s.girthCm;
    const newH = Number(rescanHeight) > 0 ? Number(rescanHeight) : s.heightM;
    const newScan = makeScan(newG, newH, sym, s.photos, new Date().toISOString(), {
      diseaseId: disease.primaryDisease.id,
    });
    setTree((curr) => ({
      ...curr,
      scans: [...curr.scans, newScan],
    }));
    setSym([]);
    setRescanGirth("");
    setRescanHeight("");
  }

  function handleAdopt(stewardName: string) {
    setTree((curr) => ({
      ...curr,
      adoptedBy: stewardName,
      adoptionDate: new Date().toISOString().slice(0, 10),
    }));
  }

  function handleAddStewardshipLog(
    action: "watering" | "mulching" | "pruning" | "compost" | "observation",
    notes: string,
  ) {
    const entry = {
      id: `st-${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      stewardName: t?.adoptedBy || "Student Steward",
      actionType: action,
      notes,
    };
    setTree((curr) => ({
      ...curr,
      stewardshipLog: [entry, ...(curr.stewardshipLog || [])],
    }));
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-14 md:px-10 pb-28">
      {/* Breadcrumb & Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
        <div className="flex items-center gap-2 text-xs font-mono">
          <Link to="/map" className="text-primary hover:underline">
            Campus Map
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-muted-foreground">{t.zone}</span>
          <span className="text-muted-foreground">/</span>
          <span className="font-semibold text-foreground">{t.id}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsQrModalOpen(true)}
            className="flex items-center gap-1.5 rounded-sm border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
          >
            <Printer className="h-3.5 w-3.5" />
            Print QR Tag
          </button>
          <button
            type="button"
            onClick={() => setIsPhenoModalOpen(true)}
            className="flex items-center gap-1.5 rounded-sm border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
          >
            <Calendar className="h-3.5 w-3.5" />
            Phenology
          </button>
          <button
            type="button"
            onClick={() => setIsAdoptionModalOpen(true)}
            className="flex items-center gap-1.5 rounded-sm bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Heart className="h-3.5 w-3.5 fill-current text-red-200" />
            {t.adoptedBy ? "Stewardship Log" : "Adopt Tree"}
          </button>
        </div>
      </div>

      {/* Header Info */}
      <div className="mt-8 flex flex-wrap items-baseline justify-between gap-6">
        <div>
          <span className="eyebrow text-primary">
            {t.id} · {t.zone} · {sp.native ? "Native Indigenous" : "Non-Native"}
          </span>
          <h1 className="mt-2 text-6xl md:text-7xl font-display font-bold leading-tight">
            {t.species}
          </h1>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            {sp.kannadaName && (
              <span className="text-lg font-medium text-emerald-700 dark:text-emerald-400">
                {sp.kannadaName}
              </span>
            )}
            <span className="font-serif italic text-muted-foreground text-sm">{sp.scientific}</span>
            <span className="font-mono text-xs text-muted-foreground">
              GPS: {t.lat.toFixed(5)}°N, {t.lng.toFixed(5)}°E
            </span>
          </div>
        </div>

        {/* Hazard Risk Warning Tag */}
        {hIndex >= 50 && (
          <div className="flex items-center gap-3 rounded-md border border-critical/30 bg-critical/10 p-4 text-critical">
            <AlertTriangle className="h-6 w-6 shrink-0" />
            <div>
              <p className="font-bold text-sm">Hazard Risk Index: {hIndex} / 100</p>
              <p className="text-xs">Flagged for qualified arborist structural inspection.</p>
            </div>
          </div>
        )}
      </div>

      {/* Health Drop Warning Alert */}
      {prev && s.score < prev.score - 5 && (
        <div
          role="alert"
          className="mt-6 flex items-center justify-between rounded-md bg-critical px-5 py-3.5 text-primary-foreground shadow-md"
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5" />
            <span className="text-sm font-semibold">
              Health Decline Alert: Tree score dropped from {prev.score} → {s.score} since previous
              scan ({prev.date.slice(0, 10)}).
            </span>
          </div>
          <span className="rounded bg-black/20 px-2 py-1 font-mono text-xs">
            Arborist Review Pending
          </span>
        </div>
      )}

      {/* Primary Grid Dashboard */}
      <div className="mt-10 grid gap-8 lg:grid-cols-12">
        {/* Left Column: Health, Pathology & Care Plan */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-md border bg-card p-6 shadow-sm space-y-4">
            <div className="flex items-end justify-between border-b pb-4">
              <div>
                <span className="eyebrow text-muted-foreground">Health Score</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-display text-7xl font-bold leading-none">{s.score}</span>
                  <span className="text-sm text-muted-foreground">/ 100</span>
                </div>
              </div>
              <HealthBadge cat={s.category} />
            </div>

            {/* Pathological Disease Inference */}
            <div className="space-y-1">
              <span className="eyebrow text-muted-foreground">
                Plant-Health-Monitoring Diagnosis
              </span>
              <p className="text-base font-bold text-foreground">
                {disease.primaryDisease.commonName}
              </p>
              <p className="font-serif italic text-xs text-muted-foreground">
                {disease.primaryDisease.pathogen}
              </p>
              <p className="text-xs text-muted-foreground pt-1">
                {disease.primaryDisease.description}
              </p>
            </div>

            {/* Grad-CAM Toggle Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowGradCam(!showGradCam)}
                className="flex items-center gap-2 rounded border bg-muted/30 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors w-full justify-center"
              >
                <Eye className="h-3.5 w-3.5 text-primary" />
                {showGradCam
                  ? "Hide Explainable Grad-CAM Heatmap"
                  : "View Explainable Grad-CAM Heatmap"}
              </button>
            </div>

            {showGradCam && (
              <div className="pt-2">
                <GradCamOverlay
                  imageSrc={s.photoUrls?.leafFront}
                  points={disease.gradCamAttentionPoints}
                  diseaseName={disease.primaryDisease.commonName}
                  severity={disease.primaryDisease.severityLevel}
                />
              </div>
            )}

            {/* Organ Score Breakdown */}
            <div className="space-y-2 border-t pt-4 text-xs">
              <span className="eyebrow text-muted-foreground">Organ Health Scoring</span>
              <div className="flex items-center justify-between">
                <span>Foliar Lamina (35%)</span>
                <span className="font-mono font-semibold">{s.scores.leaf} / 100</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Trunk & Bark (30%)</span>
                <span className="font-mono font-semibold">{s.scores.trunk} / 100</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Canopy Crown (25%)</span>
                <span className="font-mono font-semibold">{s.scores.crown} / 100</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Root Collar / Site (10%)</span>
                <span className="font-mono font-semibold">{s.scores.site} / 100</span>
              </div>
            </div>

            {/* Actionable Care Plan */}
            <div className="border-t pt-4 space-y-2">
              <span className="eyebrow text-muted-foreground">Targeted Action Plan</span>
              <ul className="list-disc space-y-1.5 pl-4 text-xs">
                {disease.carePlan.map((c, i) => (
                  <li
                    key={i}
                    className={
                      i === 0 && disease.arboristFlagNeeded ? "font-bold text-critical" : ""
                    }
                  >
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Center Column: Ecosystem & Biomass Record */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-md border bg-card p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="eyebrow text-primary">Pantropical Allometry (Chave 2014)</span>
                <h3 className="text-xl font-bold font-display">Campus Carbon Record</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEcoModalOpen(true)}
                className="text-xs text-primary font-medium hover:underline"
              >
                Expand Eco-Model
              </button>
            </div>

            <div>
              <span className="eyebrow text-muted-foreground">Lifetime CO₂e Sequestered</span>
              <p className="mt-1 font-display text-5xl font-bold text-foreground">
                {eco.co2StoredKg.toLocaleString()}{" "}
                <span className="text-xl font-normal text-muted-foreground">kg</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Equates to {(eco.co2StoredKg / 1000).toFixed(2)} metric tonnes of atmospheric CO₂
                locked.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 border-t pt-4 text-xs font-mono">
              <div className="rounded bg-background/50 p-3 border">
                <span className="text-muted-foreground block text-[10px] uppercase">
                  Dry Biomass
                </span>
                <span className="text-lg font-bold text-foreground">
                  {eco.totalBiomassKg.toLocaleString()} kg
                </span>
                <span className="text-[10px] text-muted-foreground block">Above + Root System</span>
              </div>
              <div className="rounded bg-background/50 p-3 border">
                <span className="text-muted-foreground block text-[10px] uppercase">
                  Carbon Stock
                </span>
                <span className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
                  {eco.totalCarbonKg.toLocaleString()} kg C
                </span>
                <span className="text-[10px] text-muted-foreground block">47% of dry biomass</span>
              </div>
            </div>

            {/* Ecosystem Services Cards */}
            <div className="space-y-2 border-t pt-4 text-xs">
              <span className="eyebrow text-muted-foreground">Annual Environmental Yields</span>
              <div className="flex items-center justify-between rounded border bg-background/40 p-2.5">
                <div className="flex items-center gap-2">
                  <Trees className="h-4 w-4 text-emerald-600" />
                  <span>Annual Oxygen Output:</span>
                </div>
                <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                  {eco.annualOxygenKg} kg/yr ({eco.peopleOxygenSupported} people)
                </span>
              </div>

              <div className="flex items-center justify-between rounded border bg-background/40 p-2.5">
                <div className="flex items-center gap-2">
                  <CloudRain className="h-4 w-4 text-blue-500" />
                  <span>Rainwater Interception:</span>
                </div>
                <span className="font-mono font-bold text-blue-600">
                  {eco.annualRainwaterInterceptedLiters.toLocaleString()} L/yr
                </span>
              </div>

              <div className="flex items-center justify-between rounded border bg-background/40 p-2.5">
                <div className="flex items-center gap-2">
                  <Wind className="h-4 w-4 text-amber-500" />
                  <span>Particulate PM2.5 / PM10:</span>
                </div>
                <span className="font-mono font-bold text-amber-600">
                  {eco.pm25FilteredGrams + eco.pm10FilteredGrams} g/yr
                </span>
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground pt-1">
              D = {eco.diameterCm} cm · H = {s.heightM} m · ρ = {sp.woodDensity} g/cm³ · Canopy
              Area: {eco.canopyAreaSqM} m²
            </p>
          </div>
        </div>

        {/* Right Column: QR Identity, Stewardship & Timeline */}
        <div className="lg:col-span-4 space-y-6">
          {/* QR Identity Card */}
          <div className="rounded-md border bg-card p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="eyebrow text-primary">Physical Identity Placard</span>
                <h3 className="text-lg font-bold">QR Tag Identity</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsQrModalOpen(true)}
                className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
              >
                <QrCode className="h-3.5 w-3.5" />
                Placard View
              </button>
            </div>

            <div className="flex items-center gap-4">
              <div className="rounded-md border-2 border-stone-800 bg-white p-2 shrink-0">
                <QRCodeSVG value={`https://leafora.bmsit.edu/trees/${t.id}`} size={96} />
              </div>
              <div className="space-y-1 text-xs">
                <p className="font-mono font-bold text-sm text-foreground">{t.id}</p>
                <p className="text-muted-foreground">
                  {t.species} ({sp.kannadaName})
                </p>
                <p className="text-stone-500">Fast lookup on campus map & scan history.</p>
              </div>
            </div>

            {/* Adoption Stewardship Status */}
            <div className="border-t pt-4">
              <span className="eyebrow text-muted-foreground">Community Adoption</span>
              {t.adoptedBy ? (
                <div className="mt-2 rounded bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                      <Award className="h-4 w-4" />
                      Adopted by {t.adoptedBy}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setTree((curr) => {
                          const { adoptedBy: _a, ...r } = curr;
                          return r;
                        })
                      }
                      className="text-[10px] text-destructive underline"
                    >
                      Release
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAdoptionModalOpen(true)}
                    className="w-full rounded bg-emerald-800 text-white text-[11px] py-1.5 font-medium hover:bg-emerald-700"
                  >
                    View Adoption Certificate & Log Care
                  </button>
                </div>
              ) : (
                <div className="mt-2 space-y-2">
                  <p className="text-xs text-muted-foreground">
                    This tree is looking for a student, faculty, or club guardian!
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsAdoptionModalOpen(true)}
                    className="w-full rounded-sm bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 flex items-center justify-center gap-2"
                  >
                    <Heart className="h-3.5 w-3.5 fill-current" />
                    Adopt This Campus Tree
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Historical Health Timeline */}
          <div className="rounded-md border bg-card p-6 shadow-sm space-y-4">
            <span className="eyebrow text-muted-foreground">Health Timeline & Scans</span>
            <ol className="divide-y text-xs">
              {t.scans.map((x) => (
                <li key={x.id} className="flex items-center justify-between py-2.5">
                  <div>
                    <span className="font-mono text-foreground font-semibold">
                      {x.date.slice(0, 10)}
                    </span>
                    <p className="text-[11px] text-muted-foreground">
                      Girth: {x.girthCm}cm · Ht: {x.heightM}m{" "}
                      {x.symptoms.length > 0 ? `· (${x.symptoms.length} symptoms)` : ""}
                    </p>
                  </div>
                  <HealthBadge cat={x.category} score={x.score} />
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      {/* Quick Rescan Section */}
      <section className="mt-14 rounded-md border bg-card p-6 md:p-8 shadow-sm">
        <h2 className="text-2xl font-bold font-display">Log a Follow-Up Rescan</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Perform a routine screening check to update the health timeline and monitor disease
          regression or recovery.
        </p>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-muted-foreground">
              Updated Girth (GBH in cm)
            </label>
            <input
              value={rescanGirth}
              onChange={(e) => setRescanGirth(e.target.value.replace(/[^\d.]/g, ""))}
              placeholder={`Current: ${s.girthCm} cm`}
              className="mt-1 w-full rounded border bg-background px-3 py-2 text-sm font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground">
              Updated Height (meters)
            </label>
            <input
              value={rescanHeight}
              onChange={(e) => setRescanHeight(e.target.value.replace(/[^\d.]/g, ""))}
              placeholder={`Current: ${s.heightM} m`}
              className="mt-1 w-full rounded border bg-background px-3 py-2 text-sm font-mono"
            />
          </div>
        </div>

        <div className="mt-4">
          <span className="text-xs font-medium text-muted-foreground">
            Tick Active Physical Symptoms
          </span>
          <div className="mt-2 flex flex-wrap gap-2">
            {SYMPTOMS.map((x) => {
              const on = sym.includes(x.key);
              return (
                <button
                  key={x.key}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setSym(on ? sym.filter((k) => k !== x.key) : [...sym, x.key])}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    on ? "bg-ink text-ink-foreground border-ink" : "hover:border-foreground/60"
                  }`}
                >
                  {x.label}
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          onClick={handleQuickRescan}
          className="mt-6 rounded-sm bg-ink px-6 py-2.5 text-sm font-semibold text-ink-foreground hover:bg-primary transition-colors"
        >
          Add Scan to Health Timeline
        </button>
      </section>

      {/* Feature Modals */}
      <QrTagModal tree={t} isOpen={isQrModalOpen} onClose={() => setIsQrModalOpen(false)} />
      <AdoptionModal
        tree={t}
        isOpen={isAdoptionModalOpen}
        onClose={() => setIsAdoptionModalOpen(false)}
        onAdopt={handleAdopt}
        onAddStewardshipLog={handleAddStewardshipLog}
      />
      <EcosystemCalculatorModal
        isOpen={isEcoModalOpen}
        onClose={() => setIsEcoModalOpen(false)}
        initialSpecies={t.species}
        initialGirth={s.girthCm}
        initialHeight={s.heightM}
      />
      <PhenologyModal
        isOpen={isPhenoModalOpen}
        onClose={() => setIsPhenoModalOpen(false)}
        defaultTreeId={t.id}
        defaultSpecies={t.species}
      />
    </div>
  );
}
