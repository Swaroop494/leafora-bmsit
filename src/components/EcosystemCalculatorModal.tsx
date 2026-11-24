import { useState } from "react";
import { X, Trees, CloudRain, Wind, HeartPulse } from "lucide-react";
import { CAMPUS_TREE_CATALOG } from "@/lib/tree-id";
import { calculateEcosystemBenefits } from "@/lib/ecosystem-calculator";

interface EcosystemCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSpecies?: string;
  initialGirth?: number;
  initialHeight?: number;
}

export function EcosystemCalculatorModal({
  isOpen,
  onClose,
  initialSpecies = "Neem",
  initialGirth = 150,
  initialHeight = 12,
}: EcosystemCalculatorModalProps) {
  const [species, setSpecies] = useState(initialSpecies);
  const [girth, setGirth] = useState(initialGirth);
  const [height, setHeight] = useState(initialHeight);

  if (!isOpen) return null;

  const sp = CAMPUS_TREE_CATALOG.find((s) => s.name === species) || CAMPUS_TREE_CATALOG[0]!;
  const eco = calculateEcosystemBenefits(girth, height, sp.woodDensity);

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
          <span className="eyebrow text-primary">Allometric Biomass & Ecosystem Valuation</span>
          <h2 className="mt-1 text-3xl font-display">Carbon & Ecosystem Calculator</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Chave et al. (2014) pantropical allometric equations integrated with urban microclimate
            and eco-valuation models.
          </p>
        </div>

        {/* Interactive Controls */}
        <div className="mt-6 grid gap-6 sm:grid-cols-3 border-y py-5">
          <div>
            <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Tree Species
            </label>
            <select
              value={species}
              onChange={(e) => setSpecies(e.target.value)}
              className="mt-2 w-full rounded border bg-background px-3 py-2 text-sm"
            >
              {CAMPUS_TREE_CATALOG.map((s) => (
                <option key={s.name} value={s.name}>
                  {s.name} (ρ = {s.woodDensity} g/cm³)
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex justify-between text-xs font-medium text-muted-foreground uppercase tracking-wider">
              <span>Girth (GBH)</span>
              <span className="font-mono text-foreground font-semibold">{girth} cm</span>
            </div>
            <input
              type="range"
              min={20}
              max={600}
              step={5}
              value={girth}
              onChange={(e) => setGirth(Number(e.target.value))}
              className="mt-3 w-full accent-primary"
            />
            <span className="text-[11px] text-muted-foreground">Diameter: {eco.diameterCm} cm</span>
          </div>

          <div>
            <div className="flex justify-between text-xs font-medium text-muted-foreground uppercase tracking-wider">
              <span>Tree Height</span>
              <span className="font-mono text-foreground font-semibold">{height} m</span>
            </div>
            <input
              type="range"
              min={2}
              max={40}
              step={1}
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
              className="mt-3 w-full accent-primary"
            />
            <span className="text-[11px] text-muted-foreground">
              Canopy spread: {eco.canopyAreaSqM} m²
            </span>
          </div>
        </div>

        {/* Results Dashboard */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-md border bg-background/50 p-4">
            <div className="flex items-center gap-2 text-primary">
              <Trees className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Lifetime Carbon</span>
            </div>
            <p className="mt-2 font-display text-3xl font-bold">
              {eco.co2StoredKg.toLocaleString()} <span className="text-base font-normal">kg</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              CO₂e sequestered ({eco.totalCarbonKg} kg pure Carbon)
            </p>
            <p className="text-[11px] text-primary mt-2 font-mono">
              Asset value: ₹{eco.carbonCreditValueINR.toLocaleString()}
            </p>
          </div>

          <div className="rounded-md border bg-background/50 p-4">
            <div className="flex items-center gap-2 text-emerald-600">
              <HeartPulse className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Annual Oxygen</span>
            </div>
            <p className="mt-2 font-display text-3xl font-bold">
              {eco.annualOxygenKg} <span className="text-base font-normal">kg/yr</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">Sustains breathable air for</p>
            <p className="text-[11px] text-emerald-700 font-bold mt-2">
              {eco.peopleOxygenSupported} adult humans / year
            </p>
          </div>

          <div className="rounded-md border bg-background/50 p-4">
            <div className="flex items-center gap-2 text-blue-600">
              <CloudRain className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wider">
                Stormwater Runoff
              </span>
            </div>
            <p className="mt-2 font-display text-3xl font-bold">
              {eco.annualRainwaterInterceptedLiters.toLocaleString()}{" "}
              <span className="text-base font-normal">L</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">Rainwater intercepted / year</p>
            <p className="text-[11px] text-blue-700 font-mono mt-2">
              Mitigates urban campus flash floods
            </p>
          </div>

          <div className="rounded-md border bg-background/50 p-4">
            <div className="flex items-center gap-2 text-amber-600">
              <Wind className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Air Filtration</span>
            </div>
            <p className="mt-2 font-display text-3xl font-bold">
              {eco.pm25FilteredGrams + eco.pm10FilteredGrams}{" "}
              <span className="text-base font-normal">g/yr</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">PM2.5 & PM10 particulates</p>
            <p className="text-[11px] text-amber-700 font-mono mt-2">
              NO₂ & SO₂: {eco.no2FilteredGrams + eco.so2FilteredGrams} g/yr
            </p>
          </div>
        </div>

        {/* Biomass Breakdown Table */}
        <div className="mt-6 rounded border bg-muted/30 p-4 text-xs">
          <h4 className="font-semibold text-foreground">Allometric Dry Biomass Breakdown</h4>
          <div className="mt-3 grid grid-cols-3 gap-4 font-mono">
            <div>
              <span className="text-muted-foreground block">Above-Ground (AGB):</span>
              <span className="text-base font-bold text-foreground">
                {eco.agbBiomassKg.toLocaleString()} kg
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block">Below-Ground Roots (BGB):</span>
              <span className="text-base font-bold text-foreground">
                {eco.bgbBiomassKg.toLocaleString()} kg
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block">Total Dry Biomass:</span>
              <span className="text-base font-bold text-foreground">
                {eco.totalBiomassKg.toLocaleString()} kg
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-sm bg-primary px-5 py-2 text-sm text-primary-foreground hover:bg-primary/90"
          >
            Close Calculator
          </button>
        </div>
      </div>
    </div>
  );
}
