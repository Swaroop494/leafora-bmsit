import { useEffect, useRef } from "react";
import { animate, stagger } from "animejs";

/** Conceptual line drawing — used sparingly (hero + capture frame). */
export function LeafSketch({ className = "" }: { className?: string }) {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const paths = ref.current?.querySelectorAll("path");
    if (paths)
      animate(paths, {
        strokeDashoffset: [1200, 0],
        duration: 2600,
        delay: stagger(180),
        ease: "inOutQuad",
      });
  }, []);
  return (
    <svg ref={ref} viewBox="0 0 400 520" fill="none" className={className} aria-hidden="true">
      <g className="stroke-ink" strokeWidth="1.1" strokeLinecap="round">
        <path className="sketch-line" d="M200 500 C 196 380, 204 260, 200 40" />
        <path
          className="sketch-line"
          d="M200 40 C 330 120, 360 300, 200 470 C 40 300, 70 120, 200 40 Z"
        />
        <path
          className="sketch-line"
          d="M200 150 C 240 130, 280 140, 310 170 M200 220 C 250 200, 300 215, 335 250 M200 290 C 245 275, 290 290, 320 330 M200 360 C 235 350, 265 365, 285 395"
        />
        <path
          className="sketch-line"
          d="M200 150 C 160 130, 120 140, 90 170 M200 220 C 150 200, 100 215, 65 250 M200 290 C 155 275, 110 290, 80 330 M200 360 C 165 350, 135 365, 115 395"
        />
        <path
          className="sketch-line stroke-primary"
          strokeWidth="1.6"
          d="M268 228 a 14 14 0 1 0 1 0 M120 318 a 9 9 0 1 0 1 0"
        />
      </g>
    </svg>
  );
}
