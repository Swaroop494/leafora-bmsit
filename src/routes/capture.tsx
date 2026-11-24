import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHead } from "@/components/SiteNav";
import { HealthBadge } from "@/components/HealthBadge";
import { GradCamOverlay } from "@/components/GradCamOverlay";
import { LeafSegmentationView } from "@/components/LeafSegmentationView";
import { VoiceNoteRecorder } from "@/components/VoiceNoteRecorder";
import {
  BOUNDS,
  CAPTURE_INPUTS,
  HEALTH_WEIGHTS,
  SYMPTOMS,
  ZONES,
  loadTrees,
  makeScan,
  nextId,
  saveTrees,
  speciesInfo,
  hazardIndex,
  type PhotoKey,
  type SymptomKey,
} from "@/lib/trees";
import { identifySpeciesWithTreeID, type IdentificationResult } from "@/lib/tree-id";
import { screenTreeHealth, type DiseaseDetectionResult } from "@/lib/disease-detection";
import { calculateEcosystemBenefits } from "@/lib/ecosystem-calculator";
import { TRANSLATIONS, getCurrentLanguage, type LanguageCode } from "@/lib/i18n";
import { Eye, ShieldAlert, Sparkles, Volume2 } from "lucide-react";

export const Route = createFileRoute("/capture")({
  head: () => ({
    meta: [
      { title: "Capture a Tree — Leafora AI Screening" },
      {
        name: "description",
        content:
          "Seven guided inputs: leaf, bark, crown, flower, girth, height and GPS to identify species via TreeID and screen diseases via Plant-Health-Monitoring.",
      },
      { property: "og:title", content: "Capture a tree — Leafora" },
      {
        property: "og:description",
        content: "Explainable AI species identification, disease screening, and carbon estimates.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Capture,
});

type Photos = Partial<Record<PhotoKey, string>>;

function Capture() {
  const navigate = useNavigate();
  const [photos, setPhotos] = useState<Photos>({});
  const [girth, setGirth] = useState("165");
  const [height, setHeight] = useState("11");
  const [symptoms, setSymptoms] = useState<SymptomKey[]>(["leafSpot"]);
  const [zone, setZone] = useState(ZONES[0]!);
  const [gps, setGps] = useState<{ lat: number; lng: number; src: string } | null>(null);
  const [stamp, setStamp] = useState("");
  const [voiceNoteUrl, setVoiceNoteUrl] = useState<string | undefined>();
  const [fieldRemarks, setFieldRemarks] = useState("");

  // AI inference state
  const [analysed, setAnalysed] = useState(false);
  const [selectedSpecies, setSelectedSpecies] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"health" | "treeId" | "gradcam">("health");

  // Multilingual state
  const [lang, setLang] = useState<LanguageCode>("en");
  useEffect(() => {
    setLang(getCurrentLanguage());
    const handler = () => setLang(getCurrentLanguage());
    window.addEventListener("leafora:lang-update", handler);
    return () => window.removeEventListener("leafora:lang-update", handler);
  }, []);
  const t = TRANSLATIONS[lang];

  useEffect(() => {
    setStamp(new Date().toLocaleString());
    locate();
  }, []);

  function locate() {
    const fallback = () =>
      setGps({
        lat: BOUNDS.minLat + Math.random() * (BOUNDS.maxLat - BOUNDS.minLat),
        lng: BOUNDS.minLng + Math.random() * (BOUNDS.maxLng - BOUNDS.minLng),
        src: "approximate (campus GPS simulation)",
      });

    if (!navigator.geolocation) return fallback();
    navigator.geolocation.getCurrentPosition(
      (p) => {
        const { latitude: lat, longitude: lng } = p.coords;
        const inside =
          lat > BOUNDS.minLat && lat < BOUNDS.maxLat && lng > BOUNDS.minLng && lng < BOUNDS.maxLng;
        if (inside) {
          setGps({ lat, lng, src: "device GPS" });
        } else {
          fallback();
        }
      },
      fallback,
      { timeout: 5000 },
    );
  }

  const required = CAPTURE_INPUTS.filter((i) => i.required);
  const missing = required.filter((i) => !photos[i.key]);
  const g = Number(girth),
    h = Number(height);
  const measuresOk = g > 0 && g < 2000 && h > 0 && h < 80;
  const canAnalyse = missing.length === 0 && measuresOk && gps;

  // TreeID Leaf Recognition Model Inference
  const imageSeedKey = Object.values(photos).join("|") + girth + height;
  const treeIdResult: IdentificationResult = identifySpeciesWithTreeID(
    imageSeedKey || "neem-leaf-sample",
  );
  const chosenSpecies = selectedSpecies || treeIdResult.candidates[0]!.species.name;
  const currentSpeciesInfo = speciesInfo(chosenSpecies);

  // Plant-Health-Monitoring Pathological Screening Inference
  const diseaseResult: DiseaseDetectionResult = screenTreeHealth(
    symptoms,
    imageSeedKey || "leaf-spot-sample",
  );

  // Carbon and Ecosystem Allometry
  const eco = calculateEcosystemBenefits(g, h, currentSpeciesInfo.woodDensity);

  function onFile(key: PhotoKey, f: File | undefined) {
    if (!f) return;
    setPhotos((p) => ({ ...p, [key]: URL.createObjectURL(f) }));
    setAnalysed(false);
  }

  function handleQuickSampleLoad() {
    // Fills sample photos for quick demo testing
    setPhotos({
      leafFront:
        "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=600&q=80",
      bark: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=600&q=80",
      whole:
        "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=600&q=80",
    });
    setAnalysed(true);
  }

  function save() {
    if (!gps) return;
    const scan = makeScan(
      g,
      h,
      symptoms,
      Object.keys(photos) as PhotoKey[],
      new Date().toISOString(),
      {
        photoUrls: photos,
        voiceNoteUrl,
        notes: fieldRemarks,
        diseaseId: diseaseResult.primaryDisease.id,
      },
    );

    const trees = loadTrees();
    const id = nextId(trees);
    saveTrees([
      ...trees,
      {
        id,
        species: chosenSpecies,
        candidates: treeIdResult.candidates.map((c) => ({
          name: c.species.name,
          confidence: c.confidence,
        })),
        lat: gps.lat,
        lng: gps.lng,
        zone,
        scans: [scan],
      },
    ]);
    navigate({ to: "/trees/$id", params: { id } });
  }

  return (
    <div>
      <PageHead
        eyebrow="Guided AI Field Capture Protocol"
        title="Seven inputs feed the AI — three are compulsory to identify."
        intro="Leaf upper surface, bark, and whole tree crown are mandatory. Mobile leaf features are fed to TreeID for species classification and Plant-Health-Monitoring for disease detection."
      />

      <div className="mx-auto grid max-w-7xl gap-12 px-5 md:grid-cols-12 md:px-10 pb-24">
        {/* Left Column: Capture Inputs */}
        <div className="space-y-12 md:col-span-7">
          {/* Section 1: Photographs */}
          <section>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-display">{t.photographsHeading}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Tap each frame to capture or upload high-resolution field photos.
                </p>
              </div>
              <button
                type="button"
                onClick={handleQuickSampleLoad}
                className="flex items-center gap-1.5 rounded border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Load Sample Photos
              </button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {CAPTURE_INPUTS.map((inp, i) => (
                <label
                  key={inp.key}
                  className="group relative flex aspect-[4/3] cursor-pointer flex-col justify-end overflow-hidden rounded-md border bg-card p-4 transition-colors focus-within:ring-2 focus-within:ring-ring hover:border-foreground/50 shadow-xs"
                >
                  {photos[inp.key] ? (
                    <img
                      src={photos[inp.key]}
                      alt={inp.label}
                      className="absolute inset-0 h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <span
                      className="absolute inset-6 border border-dashed border-foreground/20 rounded flex items-center justify-center text-muted-foreground/50 text-xs"
                      aria-hidden="true"
                    >
                      {inp.required ? "Required Photo" : "Optional"}
                    </span>
                  )}
                  <span className="relative rounded-sm bg-background/90 p-2 backdrop-blur-xs">
                    <span className="eyebrow block text-muted-foreground">
                      0{i + 1} ·{" "}
                      {inp.required ? (
                        <span className="text-primary font-semibold">Required</span>
                      ) : (
                        "Optional"
                      )}
                    </span>
                    <span className="block font-medium text-sm">{inp.label}</span>
                    <span className="block text-xs text-muted-foreground">{inp.cue}</span>
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="sr-only"
                    onChange={(e) => onFile(inp.key, e.target.files?.[0])}
                  />
                </label>
              ))}
            </div>
          </section>

          {/* Section 2: Measurements & GPS */}
          <section className="grid gap-6 sm:grid-cols-2 border-t pt-8">
            <Field
              label={t.girthLabel}
              value={girth}
              onChange={(v) => {
                setGirth(v);
                setAnalysed(false);
              }}
              error={girth !== "" && !(g > 0 && g < 2000) ? "Enter 1–2000 cm" : ""}
            />
            <Field
              label={t.heightLabel}
              value={height}
              onChange={(v) => {
                setHeight(v);
                setAnalysed(false);
              }}
              error={height !== "" && !(h > 0 && h < 80) ? "Enter 1–80 m" : ""}
            />

            <label className="block sm:col-span-2">
              <span className="eyebrow text-muted-foreground">{t.campusZoneLabel}</span>
              <select
                value={zone}
                onChange={(e) => setZone(e.target.value)}
                className="mt-2 w-full rounded-sm border border-input bg-card px-3 py-3 text-sm font-medium"
              >
                {ZONES.map((z) => (
                  <option key={z}>{z}</option>
                ))}
              </select>
            </label>

            <div className="rule pt-4 text-sm sm:col-span-2">
              <span className="eyebrow text-muted-foreground">Auto-Captured Field Metadata</span>
              <p className="mt-2 font-mono text-xs">
                {gps
                  ? `${gps.lat.toFixed(5)}°N, ${gps.lng.toFixed(5)}°E · ${gps.src}`
                  : "Locating GPS…"}{" "}
                · {stamp}
              </p>
              <button
                type="button"
                onClick={locate}
                className="mt-2 text-xs text-primary underline underline-offset-4"
              >
                Refresh GPS coordinates
              </button>
            </div>
          </section>

          {/* Section 3: Physical Field Observations */}
          <section className="border-t pt-8">
            <h2 className="text-3xl font-display">{t.fieldObservationsHeading}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Select visible signs of pathology or structural stress — weighted alongside neural
              network feature embeddings.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {SYMPTOMS.map((s) => {
                const on = symptoms.includes(s.key);
                return (
                  <button
                    key={s.key}
                    type="button"
                    aria-pressed={on}
                    onClick={() => {
                      setSymptoms(on ? symptoms.filter((x) => x !== s.key) : [...symptoms, s.key]);
                      setAnalysed(false);
                    }}
                    className={`rounded-full border px-4 py-2 text-xs font-medium transition-colors ${
                      on
                        ? "border-ink bg-ink text-ink-foreground shadow-xs"
                        : "hover:border-foreground/60"
                    }`}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Section 4: Voice Notes & Remarks */}
          <section className="border-t pt-8 space-y-4">
            <VoiceNoteRecorder
              onAudioRecorded={(url) => setVoiceNoteUrl(url)}
              existingAudioUrl={voiceNoteUrl}
            />
            <div>
              <label className="block text-xs font-medium text-muted-foreground">
                Field Inspection Remarks (Optional)
              </label>
              <textarea
                value={fieldRemarks}
                onChange={(e) => setFieldRemarks(e.target.value)}
                placeholder="e.g. Tree leans 8 degrees toward library walkway; root collar partially paved with asphalt."
                rows={2}
                className="mt-1 w-full rounded border bg-card p-3 text-sm font-sans"
              />
            </div>
          </section>
        </div>

        {/* Right Column: AI Analysis Engine */}
        <aside className="md:col-span-5">
          <div className="sticky top-20 rounded-md border bg-card p-6 shadow-lift md:p-8 space-y-6">
            <div className="flex items-center justify-between border-b pb-3">
              <p className="eyebrow text-primary">Explainable AI Screening Engine</p>
              <span className="rounded bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300">
                TreeID & PlantHealth
              </span>
            </div>

            {!analysed ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-3xl font-display">Ready for AI Screening</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Ensure the 3 compulsory photos, girth, and height are provided.
                  </p>
                </div>

                <ul className="space-y-2 text-sm font-medium">
                  {required.map((r) => (
                    <li
                      key={r.key}
                      className={
                        photos[r.key]
                          ? "text-healthy flex items-center gap-2"
                          : "text-muted-foreground flex items-center gap-2"
                      }
                    >
                      <span>{photos[r.key] ? "✓" : "○"}</span>
                      <span>{r.label}</span>
                    </li>
                  ))}
                  <li
                    className={
                      measuresOk
                        ? "text-healthy flex items-center gap-2"
                        : "text-muted-foreground flex items-center gap-2"
                    }
                  >
                    <span>{measuresOk ? "✓" : "○"}</span>
                    <span>Girth and Height</span>
                  </li>
                  <li
                    className={
                      gps
                        ? "text-healthy flex items-center gap-2"
                        : "text-muted-foreground flex items-center gap-2"
                    }
                  >
                    <span>{gps ? "✓" : "○"}</span>
                    <span>Campus GPS locked</span>
                  </li>
                </ul>

                <button
                  disabled={!canAnalyse}
                  onClick={() => setAnalysed(true)}
                  className="w-full rounded-sm bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-lift transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {t.analyseButton}
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Result Navigation Tabs */}
                <div className="flex rounded border bg-muted/40 p-1 text-xs">
                  <button
                    type="button"
                    onClick={() => setActiveTab("health")}
                    className={`flex-1 rounded py-1.5 font-medium transition-colors ${
                      activeTab === "health"
                        ? "bg-background text-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Health Screening
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("treeId")}
                    className={`flex-1 rounded py-1.5 font-medium transition-colors ${
                      activeTab === "treeId"
                        ? "bg-background text-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    TreeID Matches
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("gradcam")}
                    className={`flex-1 rounded py-1.5 font-medium transition-colors ${
                      activeTab === "gradcam"
                        ? "bg-background text-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Grad-CAM
                  </button>
                </div>

                {/* Tab 1: Health Screening */}
                {activeTab === "health" && (
                  <div className="space-y-5">
                    {/* Top-3 Species Candidate Selector */}
                    <fieldset className="rounded-md border bg-background/50 p-4">
                      <legend className="eyebrow text-muted-foreground px-1">
                        {t.top3CandidatesTitle}
                      </legend>
                      <div className="space-y-2 mt-1">
                        {treeIdResult.candidates.map((c) => (
                          <label
                            key={c.species.name}
                            className={`flex cursor-pointer items-center justify-between rounded p-2 text-sm transition-colors ${
                              chosenSpecies === c.species.name
                                ? "bg-primary/10 font-semibold"
                                : "hover:bg-muted"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <input
                                type="radio"
                                name="speciesSelect"
                                checked={chosenSpecies === c.species.name}
                                onChange={() => setSelectedSpecies(c.species.name)}
                                className="accent-primary"
                              />
                              <div>
                                <span>{c.species.name}</span>
                                {c.species.kannadaName && (
                                  <span className="ml-2 text-xs text-muted-foreground font-normal">
                                    {c.species.kannadaName}
                                  </span>
                                )}
                                <p className="italic text-[11px] text-muted-foreground">
                                  {c.species.scientific}
                                </p>
                              </div>
                            </div>
                            <span className="font-mono text-xs font-bold text-primary">
                              {c.confidence}%
                            </span>
                          </label>
                        ))}
                      </div>
                    </fieldset>

                    {/* Overall Health Score Card */}
                    <div className="flex items-end justify-between border-b pb-4">
                      <div>
                        <span className="eyebrow text-muted-foreground">{t.healthScoreTitle}</span>
                        <div className="mt-1 flex items-baseline gap-3">
                          <span className="font-display text-7xl font-bold leading-none">
                            {diseaseResult.overallHealthScore}
                          </span>
                          <span className="text-sm text-muted-foreground">/ 100</span>
                        </div>
                      </div>
                      <HealthBadge cat={diseaseResult.category} />
                    </div>

                    {/* Detected Pathogen Card */}
                    <div className="rounded border bg-muted/30 p-3 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-foreground">
                          Pathology: {diseaseResult.primaryDisease.commonName}
                        </span>
                        <span className="rounded bg-primary/10 px-2 py-0.5 font-mono text-[10px] text-primary">
                          {diseaseResult.primaryDisease.severityLevel}
                        </span>
                      </div>
                      <p className="text-muted-foreground font-serif italic">
                        {diseaseResult.primaryDisease.pathogen}
                      </p>
                      <p className="text-muted-foreground pt-1">
                        {diseaseResult.primaryDisease.description}
                      </p>
                    </div>

                    {/* Organ Sub-Score Progress Bars */}
                    <div className="space-y-2 text-xs">
                      {(Object.keys(HEALTH_WEIGHTS) as (keyof typeof HEALTH_WEIGHTS)[]).map((k) => (
                        <div key={k} className="flex items-center gap-3">
                          <span className="w-28 capitalize font-medium">
                            {k} · {HEALTH_WEIGHTS[k] * 100}%
                          </span>
                          <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                diseaseResult.organScores[k] >= 80
                                  ? "bg-healthy"
                                  : diseaseResult.organScores[k] >= 60
                                    ? "bg-watch"
                                    : diseaseResult.organScores[k] >= 40
                                      ? "bg-stressed"
                                      : "bg-critical"
                              }`}
                              style={{ width: `${diseaseResult.organScores[k]}%` }}
                            />
                          </div>
                          <span className="w-8 text-right font-mono font-semibold">
                            {diseaseResult.organScores[k]}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Care Plan */}
                    <div className="rounded-md border bg-background/50 p-4 space-y-2 text-xs">
                      <span className="eyebrow text-muted-foreground">{t.carePlanTitle}</span>
                      <ul className="list-disc space-y-1.5 pl-4 text-foreground">
                        {diseaseResult.carePlan.map((step, idx) => (
                          <li
                            key={idx}
                            className={
                              idx === 0 && diseaseResult.arboristFlagNeeded
                                ? "font-bold text-critical"
                                : ""
                            }
                          >
                            {step}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Carbon Estimate Summary */}
                    <div className="rounded border bg-muted/20 p-3 text-xs space-y-1">
                      <span className="eyebrow text-muted-foreground">{t.carbonEstimateTitle}</span>
                      <p className="font-mono text-foreground font-semibold">
                        {eco.co2StoredKg.toLocaleString()} kg CO₂e · {eco.totalCarbonKg} kg C ·{" "}
                        {eco.totalBiomassKg} kg Biomass
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Annual O₂: {eco.annualOxygenKg} kg/yr (supports {eco.peopleOxygenSupported}{" "}
                        people)
                      </p>
                    </div>
                  </div>
                )}

                {/* Tab 2: TreeID Morphological Analysis */}
                {activeTab === "treeId" && (
                  <LeafSegmentationView
                    features={treeIdResult.extractedFeatures}
                    speciesName={chosenSpecies}
                  />
                )}

                {/* Tab 3: Grad-CAM Explainable AI Heatmap */}
                {activeTab === "gradcam" && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-bold">Grad-CAM Neural Attention Heatmap</h4>
                      <p className="text-xs text-muted-foreground">
                        Focal red/orange attention spots indicate regions triggering disease
                        classification.
                      </p>
                    </div>
                    <GradCamOverlay
                      imageSrc={photos.leafFront}
                      points={diseaseResult.gradCamAttentionPoints}
                      diseaseName={diseaseResult.primaryDisease.commonName}
                      severity={diseaseResult.primaryDisease.severityLevel}
                    />
                  </div>
                )}

                {/* Action to Log on Campus Map */}
                <button
                  onClick={save}
                  className="w-full rounded-sm bg-ink px-6 py-3.5 text-sm font-semibold text-ink-foreground shadow-lift transition-all hover:bg-primary hover:text-primary-foreground"
                >
                  {t.logOnMapButton}
                </button>
                <p className="text-center text-[11px] text-muted-foreground">
                  Proactive screening record — structural and chemical interventions require
                  arborist review.
                </p>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error: string;
}) {
  return (
    <label className="block">
      <span className="eyebrow text-muted-foreground">{label}</span>
      <input
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/[^\d.]/g, ""))}
        aria-invalid={!!error}
        className={`mt-2 w-full rounded-sm border bg-card px-3 py-3 font-mono text-sm ${
          error ? "border-destructive" : "border-input"
        }`}
      />
      {error && <span className="mt-1 block text-xs text-destructive">{error}</span>}
    </label>
  );
}
