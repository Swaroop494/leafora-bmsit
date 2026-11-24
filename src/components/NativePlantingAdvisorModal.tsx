import { useState } from "react";
import { X, Sprout, CheckCircle, ShieldCheck } from "lucide-react";
import { getNativePlantingRecommendations } from "@/lib/biodiversity";

interface NativePlantingAdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NativePlantingAdvisorModal({ isOpen, onClose }: NativePlantingAdvisorModalProps) {
  const [goal, setGoal] = useState<"carbon" | "cooling" | "pollinator" | "hardy" | "medicinal">(
    "cooling",
  );
  const [space, setSpace] = useState<"compact" | "medium" | "large">("medium");

  if (!isOpen) return null;

  const recommendations = getNativePlantingRecommendations(goal, space);

  const goalOptions = [
    { id: "cooling", label: "Cooling & Dense Shade", icon: "❄️" },
    { id: "carbon", label: "Maximum Carbon Sequestration", icon: "🌱" },
    { id: "pollinator", label: "Avian & Pollinator Sanctuary", icon: "🐝" },
    { id: "hardy", label: "Drought Hardy & Low Care", icon: "☀️" },
    { id: "medicinal", label: "Medicinal & Campus Heritage", icon: "🍃" },
  ] as const;

  const spaceOptions = [
    { id: "compact", label: "Compact Area (3–5m buffer)" },
    { id: "medium", label: "Medium Lawn / Avenue (6–10m)" },
    { id: "large", label: "Expansive Campus Quadrangle (12m+)" },
  ] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative my-8 w-full max-w-3xl rounded-lg border bg-card p-6 md:p-8 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div>
          <span className="eyebrow text-primary">Ecological Urban Forestry Engine</span>
          <h2 className="mt-1 text-3xl font-display">Native-Planting Advisor</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Algorithmically matches BMSIT campus planting sites with indigenous flora to optimize
            biodiversity, microclimate, and ecosystem resilience.
          </p>
        </div>

        {/* Configuration Filters */}
        <div className="mt-6 space-y-4 border-y py-5">
          <div>
            <span className="eyebrow text-muted-foreground">
              Select Primary Campus Ecological Objective
            </span>
            <div className="mt-2 flex flex-wrap gap-2">
              {goalOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setGoal(opt.id)}
                  className={`flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-medium transition-colors ${
                    goal === opt.id
                      ? "border-primary bg-primary text-primary-foreground shadow-xs"
                      : "hover:border-foreground/60"
                  }`}
                >
                  <span>{opt.icon}</span>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="eyebrow text-muted-foreground">Site Space Constraints</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {spaceOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSpace(opt.id)}
                  className={`rounded-sm border px-3 py-1.5 text-xs font-medium transition-colors ${
                    space === opt.id
                      ? "border-foreground bg-foreground text-background"
                      : "hover:border-foreground/60"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Ranked Recommendations */}
        <div className="mt-6 space-y-4">
          <h3 className="eyebrow text-muted-foreground">Top Recommended Native Species</h3>
          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {recommendations.map((rec, i) => (
              <div
                key={rec.species.name}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-md border bg-background/60 p-4 transition-colors hover:border-primary/50"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {i + 1}
                    </span>
                    <h4 className="text-lg font-bold">{rec.species.name}</h4>
                    {rec.species.kannadaName && (
                      <span className="text-xs text-muted-foreground">
                        {rec.species.kannadaName}
                      </span>
                    )}
                    <span className="rounded bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 dark:text-emerald-300">
                      Native Indigenous
                    </span>
                  </div>
                  <p className="font-serif italic text-xs text-muted-foreground">
                    {rec.species.scientific}
                  </p>
                  <p className="text-xs text-stone-700 dark:text-stone-300 pt-1">
                    {rec.primaryReason}
                  </p>
                  <div className="flex flex-wrap gap-4 pt-1 font-mono text-[11px] text-muted-foreground">
                    <span>Spacing: {rec.recommendedSpacingM}m</span>
                    <span>Canopy: ~{rec.canopySpreadPotentialM}m</span>
                    <span>Water: {rec.waterNeed}</span>
                    <span>Growth: {rec.growthRate}</span>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0">
                  <div className="flex items-baseline gap-1">
                    <span className="font-display text-3xl font-bold text-primary">
                      {rec.suitabilityScore}
                    </span>
                    <span className="text-xs text-muted-foreground">/ 100</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-600">
                    Suitability
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-sm bg-primary px-5 py-2 text-sm text-primary-foreground hover:bg-primary/90"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
