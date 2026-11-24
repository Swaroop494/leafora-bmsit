import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHead } from "@/components/SiteNav";
import {
  Brain,
  Cpu,
  Layers,
  Sparkles,
  Eye,
  CheckCircle,
  Database,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

export const Route = createFileRoute("/method")({
  head: () => ({
    meta: [
      { title: "Method, AI Architecture & Next Steps — Leafora" },
      {
        name: "description",
        content:
          "Explainable AI engine architecture: TreeID leaf curvature identification, Plant-Health-Monitoring disease classification, MobileNetV3 transfer learning, and Chave allometric carbon models.",
      },
      { property: "og:title", content: "Method & AI — Leafora" },
      {
        property: "og:description",
        content: "How Leafora integrates computer vision, deep learning, and campus forestry.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MethodPage,
});

function MethodPage() {
  const steps = [
    {
      num: "01",
      title: "Survey & Dataset Assembly",
      desc: "Collecting multi-angle campus tree imagery (leaves, bark, crowns) combined with benchmark datasets: PlantVillage for foliar pathologies, Leafsnap for leaf boundaries, and local Bangalore urban forestry records.",
    },
    {
      num: "02",
      title: "Preprocessing & Leaf Segmentation",
      desc: "Color-based background segmentation (TreeID pipeline) to isolate clean leaf silhouettes from outdoor mobile noise. Contrast normalization, histogram equalization, and bounding contour extraction.",
    },
    {
      num: "03",
      title: "Model Training & Transfer Learning",
      desc: "Fine-tuning lightweight MobileNetV3 and EfficientNet backbones with transfer learning. Fusing multi-scale Histograms of Curvature over Scale (HoCS) descriptors with deep CNN spatial feature maps.",
    },
    {
      num: "04",
      title: "Explainable AI Engine (Grad-CAM)",
      desc: "Generating Gradient-weighted Class Activation Mappings (Grad-CAM) to project neural attention heatmaps onto leaf images, highlighting exact lesion foci for transparent arborist review.",
    },
    {
      num: "05",
      title: "Zone Pilot at BMSIT Campus",
      desc: "Deploying the web app across BMSIT zones (Main Block, Library Lawn, Hostel Road, Sports Field) to log initial geo-tagged tree records and ground-truth carbon values.",
    },
    {
      num: "06",
      title: "Field Validation & Iterative Refinement",
      desc: "Refining health scoring weights (Leaf 35%, Trunk 30%, Crown 25%, Site 10%) against certified arborist ground evaluations and expanding native species coverage.",
    },
  ];

  return (
    <div>
      <PageHead
        eyebrow="Model Design · Methodology · Architecture"
        title="An explainable AI engine scores tree health."
        intro="Transfer learning (MobileNetV3 / EfficientNet) fused with TreeID leaf curvature analysis and Plant-Health-Monitoring disease classification. Score 0–100: Healthy · Watch · Stressed · Critical."
      />

      <div className="mx-auto max-w-7xl px-5 md:px-10 pb-28 space-y-16">
        {/* Architectural Pillars */}
        <section className="grid gap-8 md:grid-cols-2">
          {/* Pillar 1: TreeID */}
          <div className="rounded-lg border bg-card p-8 shadow-xs space-y-4">
            <div className="flex items-center gap-3 text-primary">
              <Cpu className="h-6 w-6" />
              <span className="eyebrow">TreeID Architecture (Manu Chopra)</span>
            </div>
            <h3 className="text-2xl font-bold font-display">
              Leaf Identification by Shape & Curvature
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Based on Stanford CS231n research by Manu Chopra, TreeID solves real-world mobile
              capture noise (shadows, varying illumination, motion blur) through color segmentation
              and boundary contour descriptors:
            </p>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <b>Color Segmentation:</b> Isolates the green leaf lamina from background
                  interference.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <b>Histograms of Curvature over Scale (HoCS):</b> Captures multi-scale margin
                  traits (serrated vs smooth vs lobed).
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <b>ConvNet Embedding:</b> Compact (conv-relu-pool)x2 + affine pipeline yields
                  robust top-3 species candidates with confidence scores.
                </span>
              </li>
            </ul>
          </div>

          {/* Pillar 2: Plant-Health-Monitoring */}
          <div className="rounded-lg border bg-card p-8 shadow-xs space-y-4">
            <div className="flex items-center gap-3 text-primary">
              <Brain className="h-6 w-6" />
              <span className="eyebrow">Plant-Health-Monitoring (CodeByPinar)</span>
            </div>
            <h3 className="text-2xl font-bold font-display">
              Pathological Disease Screening & Grad-CAM
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Based on deep learning pipelines by Pınar Topuz (CodeByPinar), this module automates
              foliar and trunk disease classification using benchmark models trained on PlantVillage
              and agricultural datasets:
            </p>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <b>Multi-Class Pathologies:</b> Classifies Early Leaf Spot, Powdery Mildew,
                  Bacterial Blight, Rust, Anthracnose, Gummosis, and Borers.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <b>Grad-CAM Explainability:</b> Computes gradients of the target class to
                  visualize exactly which pixels triggered the diagnostic prediction.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <b>Actionable Care Guidance:</b> Pairs each condition with organic biological
                  remedies (Neem oil, potassium bicarbonate) and arborist escalations.
                </span>
              </li>
            </ul>
          </div>
        </section>

        {/* 6-Step Implementation Roadmap */}
        <section className="space-y-8">
          <div>
            <span className="eyebrow text-primary">Methodology & Next Steps</span>
            <h2 className="mt-2 text-3xl md:text-5xl font-display font-bold">
              Six Phases from Pilot to Scale
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {steps.map((s) => (
              <div key={s.num} className="rounded-md border bg-card p-6 shadow-xs space-y-3">
                <span className="font-mono text-2xl font-bold text-copper">{s.num}</span>
                <h3 className="text-xl font-bold font-display">{s.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Implementation Stack & Technical Limits */}
        <section className="grid gap-8 rounded-lg border bg-muted/20 p-8 md:grid-cols-3">
          <div className="space-y-2">
            <span className="eyebrow text-foreground">Datasets & Benchmarks</span>
            <p className="text-xs text-muted-foreground leading-relaxed">
              PlantVillage (54,000+ pathological images), iNaturalist / PlantNet, Leafsnap boundary
              collection, and BMSIT local field survey dataset.
            </p>
          </div>
          <div className="space-y-2">
            <span className="eyebrow text-foreground">Deployment Stack</span>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Vite 8, TanStack Router/Start, Tailwind CSS v4, PWA Service Worker caching, and
              client-side Web Audio MediaRecorder.
            </p>
          </div>
          <div className="space-y-2">
            <span className="eyebrow text-foreground">Scientific Scope & Limitations</span>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Screening tool for early detection; structural hazard remediation and systemic
              treatments require certified arborist on-site validation.
            </p>
          </div>
        </section>

        {/* Future Horizons */}
        <section className="rounded-lg border bg-ink text-ink-foreground p-8 md:p-12 space-y-6">
          <div className="max-w-2xl space-y-3">
            <span className="eyebrow text-primary">Future Horizons</span>
            <h3 className="text-3xl md:text-4xl font-display font-bold">
              Autonomous Drones, Satellite NDVI & City-Wide Rollout
            </h3>
            <p className="text-sm opacity-80 leading-relaxed">
              Next-generation phases envision autonomous multispectral drone canopy imaging, ground
              IoT soil moisture/sap-flow sensors, satellite normalized difference vegetation index
              (NDVI) tracking, and extending the Leafora platform to municipal Bangalore urban
              forest reserves.
            </p>
          </div>
          <div className="pt-2">
            <Link
              to="/capture"
              className="inline-flex items-center gap-2 rounded-sm bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lift hover:bg-primary/90"
            >
              <span>Test the Capture Protocol</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
