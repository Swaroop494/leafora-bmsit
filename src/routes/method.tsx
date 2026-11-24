import { createFileRoute } from "@tanstack/react-router";
import { PageHead } from "@/components/SiteNav";
export const Route = createFileRoute("/method")({
  head: () => ({ meta: [{ title: "Method & next steps — Leafora" }, { name: "description", content: "Model design, implementation stack and pilot plan for Leafora." }, { property: "og:title", content: "Method — Leafora" }, { property: "og:description", content: "How Leafora is built and piloted." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: () => (
    <div><PageHead eyebrow="Model design · proposed" title="An explainable AI engine scores tree health." intro="Transfer learning (MobileNetV3 / EfficientNet) → fused top-3 species → separate leaf, trunk and crown models. Score 0–100: Healthy · Watch · Stressed · Critical." />
      <div className="mx-auto grid max-w-7xl gap-10 px-5 md:grid-cols-3 md:px-10">
        <ol className="space-y-3 md:col-span-2">{["Survey and dataset", "Preprocess and label", "Train and validate", "Build web app", "Pilot in one zone", "Analyse and refine"].map((s, i) => <li key={s} className="rule flex gap-6 pt-3 text-2xl font-display"><span className="text-copper">0{i + 1}</span>{s}</li>)}</ol>
        <div className="space-y-6 text-sm text-muted-foreground"><p><b className="text-foreground">Datasets:</b> PlantVillage, iNaturalist / PlantNet, Leafsnap and campus data.</p><p><b className="text-foreground">Deployment:</b> Vercel, Render, Hugging Face.</p><p><b className="text-foreground">Limits:</b> image quality, species coverage, estimated carbon. Screening requires arborist review.</p><p><b className="text-foreground">Future:</b> drones, IoT soil sensors, satellite NDVI, LiDAR, city-wide rollout.</p></div>
      </div></div>),
});
