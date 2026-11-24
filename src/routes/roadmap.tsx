import { createFileRoute } from "@tanstack/react-router";
import { PageHead } from "@/components/SiteNav";
import { Reveal } from "@/components/Reveal";
export const Route = createFileRoute("/roadmap")({
  head: () => ({ meta: [{ title: "Feature roadmap — Leafora" }, { name: "description", content: "Features beyond a simple inventory: carbon calculator, hazard index, QR identity and more." }, { property: "og:title", content: "Feature roadmap — Leafora" }, { property: "og:description", content: "Proposed Leafora extensions." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: () => (
    <div><PageHead eyebrow="Feature roadmap" title="Features beyond a simple inventory." intro="Hazard Risk Index flags trees for qualified review; QR tags give each tree a lasting identity. Multilingual and voice notes widen participation." />
      <Reveal className="mx-auto grid max-w-7xl gap-px bg-border px-5 sm:grid-cols-2 md:px-10 lg:grid-cols-5">
        {["Carbon & ecosystem calculator", "Health timeline + alerts", "Hazard Risk Index", "Heat-island cooling map", "Biodiversity hotspots", "Native-planting advisor", "Phenology tracker", "QR tree identity", "Adopt a Tree", "Offline PWA"].map((f, i) => (
          <div key={f} className="reveal bg-background p-6"><span className="font-mono text-xs text-primary">{String(i + 1).padStart(2, "0")}</span><h3 className="mt-6 text-2xl">{f}</h3></div>))}
      </Reveal></div>),
});
