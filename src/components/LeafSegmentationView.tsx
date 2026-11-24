import type { LeafFeatures } from "@/lib/tree-id";

interface LeafSegmentationViewProps {
  features: LeafFeatures;
  speciesName: string;
}

export function LeafSegmentationView({ features, speciesName }: LeafSegmentationViewProps) {
  return (
    <div className="rounded-md border bg-card p-5">
      <div className="flex items-center justify-between border-b pb-3">
        <div>
          <span className="eyebrow text-primary">TreeID Morphological Analysis</span>
          <h4 className="text-lg font-medium">{speciesName} — Leaf Shape & HoCS Curvature</h4>
        </div>
        <span className="rounded-full bg-primary/10 px-3 py-1 font-mono text-xs font-medium text-primary">
          ConvNet Extracted
        </span>
      </div>

      <div className="mt-4 grid gap-6 sm:grid-cols-2">
        {/* Curvature over Scale (HoCS) Histogram */}
        <div>
          <p className="eyebrow text-muted-foreground">Histograms of Curvature over Scale (HoCS)</p>
          <div className="mt-3 flex items-end gap-2 h-24 rounded border bg-background/50 p-3">
            {features.meanCurvatureHoCS.map((val, idx) => (
              <div
                key={idx}
                className="flex flex-1 flex-col items-center gap-1.5 h-full justify-end"
              >
                <span className="text-[10px] font-mono text-muted-foreground">
                  {val.toFixed(2)}
                </span>
                <div
                  className="w-full rounded-t bg-emerald-600/80 transition-all duration-500"
                  style={{ height: `${Math.min(100, Math.max(10, val * 200))}%` }}
                />
                <span className="text-[9px] font-mono uppercase text-muted-foreground">
                  Scale {idx + 1}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-1.5 text-[11px] text-muted-foreground">
            Multi-scale boundary curvature distinguishes serrations from smooth margins.
          </p>
        </div>

        {/* Morphological Descriptors */}
        <div className="space-y-2.5 text-xs">
          <p className="eyebrow text-muted-foreground">Morphological Metrics</p>
          <div className="flex items-center justify-between border-b py-1">
            <span className="text-muted-foreground">Aspect Ratio (Length / Width)</span>
            <span className="font-mono font-medium">{features.aspectRatio.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between border-b py-1">
            <span className="text-muted-foreground">Margin Margin Structure</span>
            <span className="font-mono font-medium capitalize text-primary">
              {features.leafMargin}
            </span>
          </div>
          <div className="flex items-center justify-between border-b py-1">
            <span className="text-muted-foreground">Perimeter Convexity Ratio</span>
            <span className="font-mono font-medium">{features.perimeterConvexity.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-muted-foreground">Green Foliage Dominance</span>
            <span className="font-mono font-medium">{features.greenDominance}x</span>
          </div>
        </div>
      </div>
    </div>
  );
}
