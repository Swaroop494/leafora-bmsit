import { useState } from "react";
import type { GradCamPoint } from "@/lib/disease-detection";

interface GradCamOverlayProps {
  imageSrc?: string | undefined;
  points: GradCamPoint[];
  diseaseName: string;
  severity: string;
  className?: string | undefined;
}

export function GradCamOverlay({
  imageSrc,
  points,
  diseaseName,
  severity,
  className = "",
}: GradCamOverlayProps) {
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [hoveredPoint, setHoveredPoint] = useState<GradCamPoint | null>(null);

  return (
    <div className={`relative overflow-hidden rounded-md border bg-black/5 ${className}`}>
      {/* Base photo or illustrative leaf texture */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        {imageSrc ? (
          <img src={imageSrc} alt="Leaf scan" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-stone-900 text-stone-400">
            <svg viewBox="0 0 200 200" className="h-44 w-44 opacity-40">
              <path
                d="M100 15 C 40 40, 20 100, 40 160 C 60 190, 95 195, 100 200 C 105 195, 140 190, 160 160 C 180 100, 160 40, 100 15 Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path d="M100 20 L 100 190" stroke="currentColor" strokeWidth="3" />
              <path d="M100 70 Q 140 60 150 90" stroke="currentColor" strokeWidth="2" fill="none" />
              <path
                d="M100 110 Q 60 100 50 130"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
              />
            </svg>
          </div>
        )}

        {/* Explainable AI / Grad-CAM Attention Heatmap Layer */}
        {showHeatmap && (
          <svg
            className="absolute inset-0 h-full w-full pointer-events-none"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <defs>
              {points.map((pt, i) => (
                <radialGradient key={`grad-${i}`} id={`heat-grad-${i}`} cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={pt.intensity * 0.85} />
                  <stop offset="40%" stopColor="#f59e0b" stopOpacity={pt.intensity * 0.65} />
                  <stop offset="75%" stopColor="#3b82f6" stopOpacity={pt.intensity * 0.35} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                </radialGradient>
              ))}
            </defs>

            {points.map((pt, i) => (
              <circle
                key={`heat-${i}`}
                cx={pt.x}
                cy={pt.y}
                r={pt.radius}
                fill={`url(#heat-grad-${i})`}
                className="transition-all duration-300"
              />
            ))}
          </svg>
        )}

        {/* Interactive Attention Hotspot Markers */}
        {showHeatmap &&
          points.map((pt, i) => (
            <button
              key={`hotspot-${i}`}
              type="button"
              style={{ left: `${pt.x}%`, top: `${pt.y}%` }}
              onMouseEnter={() => setHoveredPoint(pt)}
              onMouseLeave={() => setHoveredPoint(null)}
              onClick={() => setHoveredPoint(pt)}
              className="group absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-red-600/90 p-1 shadow-lg ring-2 ring-red-400/50 transition-transform hover:scale-125 focus:outline-none"
              aria-label={pt.label}
            >
              <span className="block h-2 w-2 rounded-full bg-white animate-pulse" />
            </button>
          ))}

        {/* Hover Tooltip Overlay */}
        {hoveredPoint && (
          <div
            style={{
              left: `${Math.min(75, Math.max(25, hoveredPoint.x))}%`,
              top: `${Math.min(80, Math.max(15, hoveredPoint.y - 12))}%`,
            }}
            className="absolute z-20 -translate-x-1/2 rounded-sm bg-ink/95 px-3 py-1.5 text-xs text-white shadow-xl backdrop-blur"
          >
            <p className="font-medium text-amber-300">{hoveredPoint.label}</p>
            <p className="font-mono text-[10px] text-stone-300">
              Confidence Weight: {Math.round(hoveredPoint.intensity * 100)}%
            </p>
          </div>
        )}

        {/* Explanatory Overlay Banner */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between rounded-sm bg-black/75 px-3 py-1.5 text-xs text-white backdrop-blur">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-red-500" />
            <span className="font-medium">Grad-CAM Focus: {diseaseName}</span>
            <span className="rounded bg-white/20 px-1.5 py-0.5 text-[10px]">{severity}</span>
          </div>
          <button
            type="button"
            onClick={() => setShowHeatmap(!showHeatmap)}
            className="rounded px-2 py-0.5 text-[11px] font-medium bg-white/20 hover:bg-white/30"
          >
            {showHeatmap ? "Hide Heatmap" : "Show Heatmap"}
          </button>
        </div>
      </div>
    </div>
  );
}
