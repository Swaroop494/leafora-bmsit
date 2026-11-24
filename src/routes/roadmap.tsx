import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageHead } from "@/components/SiteNav";
import { EcosystemCalculatorModal } from "@/components/EcosystemCalculatorModal";
import { NativePlantingAdvisorModal } from "@/components/NativePlantingAdvisorModal";
import { PhenologyModal } from "@/components/PhenologyModal";
import { QrTagModal } from "@/components/QrTagModal";
import { loadTrees } from "@/lib/trees";
import {
  Trees,
  Activity,
  AlertTriangle,
  Sun,
  Sprout,
  Compass,
  Calendar,
  QrCode,
  Heart,
  WifiOff,
  Mic,
  Eye,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/roadmap")({
  head: () => ({
    meta: [
      { title: "Feature Roadmap & AI Hub — Leafora" },
      {
        name: "description",
        content:
          "Explore every feature beyond a simple inventory: Carbon & Ecosystem Calculator, TreeID Identification, Plant-Health-Monitoring Disease Screening, Hazard Risk Index, QR tags, and Native Advisor.",
      },
      { property: "og:title", content: "Feature Roadmap — Leafora" },
      {
        property: "og:description",
        content: "Campus green infrastructure features powered by computer vision and allometry.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RoadmapPage,
});

function RoadmapPage() {
  const [isEcoOpen, setIsEcoOpen] = useState(false);
  const [isNativeOpen, setIsNativeOpen] = useState(false);
  const [isPhenoOpen, setIsPhenoOpen] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [offlineSyncSimulated, setOfflineSyncSimulated] = useState(false);

  const trees = loadTrees();
  const sampleTree = trees[0]!;

  const features = [
    {
      num: "01",
      title: "Carbon & Ecosystem Calculator",
      icon: Trees,
      tag: "Allometric Model",
      desc: "Chave et al. (2014) pantropical allometry computes dry biomass, carbon stocks, lifetime CO₂e, annual O₂ production, and rainwater interception.",
      actionLabel: "Launch Interactive Calculator",
      onAction: () => setIsEcoOpen(true),
    },
    {
      num: "02",
      title: "Health Timeline + Alerts",
      icon: Activity,
      tag: "Temporal Monitoring",
      desc: "Multi-scan health history per tree with automated alert triggers whenever a health score drops or transitions to Stressed or Critical state.",
      actionLabel: "View Sample Tree Record",
      link: `/trees/${sampleTree.id}`,
    },
    {
      num: "03",
      title: "Hazard Risk Index (HRI)",
      icon: AlertTriangle,
      tag: "Arborist Safety",
      desc: "Algorithmic 0–100 arborist risk assessment fusing crown dieback, trunk borer cavities, leaning angle, and pedestrian path proximity.",
      actionLabel: "Explore Hazard Map Layer",
      link: "/map",
    },
    {
      num: "04",
      title: "Heat-Island Cooling Map",
      icon: Sun,
      tag: "Microclimate",
      desc: "Calculates canopy shade radius and evapotranspirative thermal shadow, demonstrating 1.5°C to 4.2°C ambient temperature reduction across campus.",
      actionLabel: "View Cooling Map",
      link: "/map",
    },
    {
      num: "05",
      title: "Biodiversity Hotspots",
      icon: Compass,
      tag: "Ecological Index",
      desc: "Computes Shannon-Wiener Diversity Index (H') and Simpson's Index across campus zones to track species richness and native vs exotic equilibrium.",
      actionLabel: "View Zone Hotspots",
      link: "/map",
    },
    {
      num: "06",
      title: "Native-Planting Advisor",
      icon: Sprout,
      tag: "Restoration AI",
      desc: "Intelligent species recommendation tool suggesting indigenous flora (Neem, Honge, Peepal, Banyan, Jamun) based on soil, space, and ecological goals.",
      actionLabel: "Launch Native Advisor",
      onAction: () => setIsNativeOpen(true),
    },
    {
      num: "07",
      title: "Phenology Tracker",
      icon: Calendar,
      tag: "Citizen Science",
      desc: "12-month biological calendar tracking seasonal leaf flush, flowering, fruiting, and leaf drop with field observation logging for BMSIT trees.",
      actionLabel: "Open Phenology Calendar",
      onAction: () => setIsPhenoOpen(true),
    },
    {
      num: "08",
      title: "QR Tree Identity & Placards",
      icon: QrCode,
      tag: "Physical Tagging",
      desc: "Generates high-resolution printable campus tree placards with bilingual names, carbon sequestered, and instant mobile QR lookup.",
      actionLabel: "Generate Tree Placard",
      onAction: () => setIsQrOpen(true),
    },
    {
      num: "09",
      title: "Adopt a Tree Stewardship",
      icon: Heart,
      tag: "Community",
      desc: "Empowers students, faculty, and campus clubs to adopt trees, log watering/mulching care activities, and earn Campus Green Guardian badges.",
      actionLabel: "Adopt a Tree",
      link: `/trees/${sampleTree.id}`,
    },
    {
      num: "10",
      title: "Offline PWA & Field Voice Notes",
      icon: WifiOff,
      tag: "Field Accessibility",
      desc: "PWA service worker caching with offline scan queuing and web audio MediaRecorder voice notes for effortless field data collection.",
      actionLabel: offlineSyncSimulated ? "✓ Scans Synced!" : "Simulate Offline Sync Queue",
      onAction: () => {
        setOfflineSyncSimulated(true);
        setTimeout(() => setOfflineSyncSimulated(false), 2500);
      },
    },
    {
      num: "11",
      title: "TreeID Leaf Identification",
      icon: Sparkles,
      tag: "Manu Chopra TreeID",
      desc: "Isolates leaf boundary contours from mobile camera photos, extracts multi-scale Curvature (HoCS) and aspect ratios, and outputs top-3 candidate species.",
      actionLabel: "Try TreeID in Capture",
      link: "/capture",
    },
    {
      num: "12",
      title: "Plant-Health-Monitoring & Grad-CAM",
      icon: Eye,
      tag: "CodeByPinar Engine",
      desc: "Deep learning pathological disease detection (leaf spots, powdery mildew, bacterial blight, rust, gummosis, borers) with explainable Grad-CAM heatmaps.",
      actionLabel: "Try Disease Screening",
      link: "/capture",
    },
  ];

  return (
    <div>
      <PageHead
        eyebrow="Comprehensive System Architecture"
        title="Features beyond a simple inventory."
        intro="Hazard Risk Index flags trees for qualified review; QR tags give each tree a lasting identity; TreeID and Plant-Health-Monitoring provide explainable AI diagnostics; multilingual support and voice notes widen participation."
      />

      <div className="mx-auto max-w-7xl px-5 md:px-10 pb-28">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.num}
                className="flex flex-col justify-between rounded-lg border bg-card p-6 shadow-xs transition-all hover:shadow-md hover:border-primary/50"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-primary">{f.num}</span>
                    <span className="rounded bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground uppercase">
                      {f.tag}
                    </span>
                  </div>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-xl font-bold font-display">{f.title}</h3>
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{f.desc}</p>
                </div>

                <div className="mt-6 border-t pt-4">
                  {f.link ? (
                    <Link
                      to={f.link}
                      className="flex items-center justify-between text-xs font-semibold text-primary hover:underline"
                    >
                      <span>{f.actionLabel}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={f.onAction}
                      className="flex w-full items-center justify-between text-xs font-semibold text-primary hover:underline text-left"
                    >
                      <span>{f.actionLabel}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Feature Modals */}
      <EcosystemCalculatorModal isOpen={isEcoOpen} onClose={() => setIsEcoOpen(false)} />
      <NativePlantingAdvisorModal isOpen={isNativeOpen} onClose={() => setIsNativeOpen(false)} />
      <PhenologyModal isOpen={isPhenoOpen} onClose={() => setIsPhenoOpen(false)} />
      <QrTagModal tree={sampleTree} isOpen={isQrOpen} onClose={() => setIsQrOpen(false)} />
    </div>
  );
}
