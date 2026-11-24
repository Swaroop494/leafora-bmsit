import { CATEGORY_CLASS, type HealthCategory } from "@/lib/trees";
export function HealthBadge({ cat, score }: { cat: HealthCategory; score?: number }) {
  return (
    <span
      className={`eyebrow inline-flex items-center gap-2 rounded-sm px-2 py-1 ${CATEGORY_CLASS[cat]}`}
    >
      {score !== undefined && <b>{score}</b>}
      {cat}
    </span>
  );
}
