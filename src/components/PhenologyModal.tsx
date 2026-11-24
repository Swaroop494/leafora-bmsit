import { useState, useEffect } from "react";
import { X, Calendar, PlusCircle, Check } from "lucide-react";
import {
  CAMPUS_PHENOLOGY_DATA,
  MONTH_NAMES,
  PHENOPHASE_LABELS,
  loadPhenologyObservations,
  savePhenologyObservation,
  type Phenophase,
  type PhenologyObservation,
} from "@/lib/phenology";

interface PhenologyModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTreeId?: string;
  defaultSpecies?: string;
}

export function PhenologyModal({
  isOpen,
  onClose,
  defaultTreeId = "LF-0001",
  defaultSpecies = "Neem",
}: PhenologyModalProps) {
  const [selectedSpecies, setSelectedSpecies] = useState(defaultSpecies);
  const [observations, setObservations] = useState<PhenologyObservation[]>([]);
  const [showLogForm, setShowLogForm] = useState(false);

  // Form states
  const [observer, setObserver] = useState("");
  const [phase, setPhase] = useState<Phenophase>("flowering");
  const [intensity, setIntensity] = useState(70);
  const [notes, setNotes] = useState("");
  const [loggedSuccess, setLoggedSuccess] = useState(false);

  useEffect(() => {
    setObservations(loadPhenologyObservations());
    const handler = () => setObservations(loadPhenologyObservations());
    window.addEventListener("leafora:phenology-update", handler);
    return () => window.removeEventListener("leafora:phenology-update", handler);
  }, []);

  if (!isOpen) return null;

  const speciesList = Object.keys(CAMPUS_PHENOLOGY_DATA);
  const defaultCalendar = CAMPUS_PHENOLOGY_DATA["Neem"] ?? [];
  const calendarData = CAMPUS_PHENOLOGY_DATA[selectedSpecies] ?? defaultCalendar;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!observer.trim()) return;

    savePhenologyObservation({
      treeId: defaultTreeId,
      speciesName: selectedSpecies,
      date: new Date().toISOString().slice(0, 10),
      observerName: observer.trim(),
      observedPhase: phase,
      intensityPercentage: intensity,
      notes: notes.trim() || undefined,
    });

    setLoggedSuccess(true);
    setTimeout(() => {
      setLoggedSuccess(false);
      setShowLogForm(false);
      setNotes("");
    }, 1200);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative my-8 w-full max-w-4xl rounded-lg border bg-card p-6 md:p-8 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="eyebrow text-primary">
              Seasonal Biological Cycles · Bangalore Climate
            </span>
            <h2 className="mt-1 text-3xl font-display">Campus Phenology Tracker</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Monitor seasonal leaf flush, flowering, fruiting, and leaf drop across the BMSIT urban
              canopy.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowLogForm(!showLogForm)}
            className="flex items-center gap-2 rounded-sm bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90"
          >
            <PlusCircle className="h-4 w-4" />
            {showLogForm ? "View Calendar" : "Log Observation"}
          </button>
        </div>

        {/* Species Tabs */}
        <div className="mt-6 flex flex-wrap gap-2 border-b pb-4">
          {speciesList.map((sp) => (
            <button
              key={sp}
              type="button"
              onClick={() => setSelectedSpecies(sp)}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                selectedSpecies === sp
                  ? "bg-foreground text-background"
                  : "border text-muted-foreground hover:text-foreground"
              }`}
            >
              {sp}
            </button>
          ))}
        </div>

        {/* Observation Logging Form */}
        {showLogForm ? (
          <form
            onSubmit={handleSubmit}
            className="mt-6 rounded-md border bg-background/50 p-6 space-y-4"
          >
            <h3 className="text-lg font-bold">
              Log Seasonal Observation for {selectedSpecies} ({defaultTreeId})
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-muted-foreground">
                  Observer Name
                </label>
                <input
                  required
                  value={observer}
                  onChange={(e) => setObserver(e.target.value)}
                  placeholder="Student or staff name"
                  className="mt-1 w-full rounded border bg-background px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground">
                  Observed Biological Phase
                </label>
                <select
                  value={phase}
                  onChange={(e) => setPhase(e.target.value as Phenophase)}
                  className="mt-1 w-full rounded border bg-background px-3 py-2 text-sm"
                >
                  {Object.entries(PHENOPHASE_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v.label} ({v.desc})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground">
                  Canopy Coverage / Intensity ({intensity}%)
                </label>
                <input
                  type="range"
                  min={10}
                  max={100}
                  step={5}
                  value={intensity}
                  onChange={(e) => setIntensity(Number(e.target.value))}
                  className="mt-2 w-full accent-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground">
                  Field Remarks (Optional)
                </label>
                <input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Heavy bee activity around blossoms"
                  className="mt-1 w-full rounded border bg-background px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={loggedSuccess}
                className="flex items-center gap-2 rounded-sm bg-primary px-5 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90"
              >
                {loggedSuccess ? <Check className="h-4 w-4" /> : null}
                {loggedSuccess ? "Observation Saved!" : "Submit Observation"}
              </button>
              <button
                type="button"
                onClick={() => setShowLogForm(false)}
                className="rounded-sm border px-4 py-2 text-xs text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          /* Annual 12-Month Calendar Grid */
          <div className="mt-6 space-y-6">
            <div className="overflow-x-auto">
              <div className="grid grid-cols-12 gap-1.5 min-w-[680px]">
                {MONTH_NAMES.map((m, i) => {
                  const phases = calendarData[i] ?? [];
                  const isCurrentMonth = new Date().getMonth() === i;

                  return (
                    <div
                      key={m}
                      className={`rounded-md border p-2 text-center transition-all ${
                        isCurrentMonth
                          ? "border-primary bg-primary/5 ring-2 ring-primary"
                          : "bg-card"
                      }`}
                    >
                      <span
                        className={`block font-mono text-xs font-bold ${isCurrentMonth ? "text-primary" : "text-muted-foreground"}`}
                      >
                        {m}
                      </span>
                      <div className="mt-2 flex flex-col gap-1 min-h-[70px] justify-center">
                        {phases.map((p) => (
                          <span
                            key={p}
                            className={`rounded px-1 py-0.5 text-[9px] font-semibold leading-tight ${PHENOPHASE_LABELS[p].color}`}
                            title={PHENOPHASE_LABELS[p].desc}
                          >
                            {PHENOPHASE_LABELS[p].label}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Phenophase Legend */}
            <div className="rounded border bg-background/50 p-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Phenophase Legend
              </h4>
              <div className="mt-2.5 flex flex-wrap gap-4 text-xs">
                {Object.entries(PHENOPHASE_LABELS).map(([k, v]) => (
                  <div key={k} className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${v.color}`} />
                    <span className="font-medium">{v.label}:</span>
                    <span className="text-muted-foreground">{v.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Campus Observations */}
            <div className="space-y-3">
              <h4 className="eyebrow text-muted-foreground">Recent Citizen Science Field Logs</h4>
              {observations.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">
                  No field observations recorded yet. Be the first student or researcher to log a
                  phenophase!
                </p>
              ) : (
                <div className="divide-y rounded border bg-card">
                  {observations.slice(0, 4).map((obs) => (
                    <div key={obs.id} className="flex items-center justify-between p-3 text-xs">
                      <div className="space-y-0.5">
                        <span className="font-semibold text-foreground">
                          {obs.speciesName} ({obs.treeId})
                        </span>
                        <span className="text-muted-foreground ml-2">by {obs.observerName}</span>
                        {obs.notes && (
                          <p className="text-stone-500 italic mt-0.5">&ldquo;{obs.notes}&rdquo;</p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-semibold ${PHENOPHASE_LABELS[obs.observedPhase]?.color || "bg-muted"}`}
                        >
                          {PHENOPHASE_LABELS[obs.observedPhase]?.label || obs.observedPhase} ·{" "}
                          {obs.intensityPercentage}%
                        </span>
                        <span className="font-mono text-muted-foreground">{obs.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-sm bg-primary px-5 py-2 text-sm text-primary-foreground hover:bg-primary/90"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
