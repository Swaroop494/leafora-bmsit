import { ClientOnly, createFileRoute, Link } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { LeafSketch } from "@/components/LeafSketch";
import { Reveal } from "@/components/Reveal";

const HeroOrb = lazy(() => import("@/components/HeroOrb"));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Leafora — Mapping & protecting campus trees with AI" },
      {
        name: "description",
        content:
          "Photograph a tree, get species, health score, carbon value and a care plan, then log it on the BMSIT campus map.",
      },
      { property: "og:title", content: "Leafora — Campus Tree Health Inventory" },
      {
        property: "og:description",
        content: "Geo-tagged inventory, AI health screening and carbon estimates for campus trees.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const objectives = [
  ["01", "Geo-tagged inventory", "A dependable digital record of every campus tree."],
  ["02", "Species identification", "Top-3 species with confidence from leaf, bark and flower."],
  ["03", "Multi-input screening", "Leaf, trunk and crown models fused into one score."],
  ["04", "Actionable care", "Recommendations that go to qualified review."],
  ["05", "Carbon value", "Estimated storage from girth, height and wood density."],
  ["06", "Student participation", "Adopt, rescan and protect — a living campus record."],
];
const steps = [
  ["01", "Capture", "Guided photos plus GPS."],
  ["02", "Identify", "Top-3 species with confidence."],
  ["03", "Assess", "Health score and care plan."],
  ["04", "Map & monitor", "Log on the campus map."],
];

function Index() {
  return (
    <>
      <section className="grain relative overflow-hidden">
        <div className="aura absolute inset-0" aria-hidden="true" />
        <div className="relative z-10 mx-auto grid max-w-7xl gap-14 px-5 pb-20 pt-16 md:grid-cols-12 md:gap-8 md:px-10 md:pb-28 md:pt-24">
          <div className="md:col-span-7">
            <p className="enter eyebrow text-primary">
              Campus Tree Health · Inventory & Geo-Tagging Log
            </p>
            <h1 className="enter enter-d1 mt-6 text-balance text-[3.35rem] leading-[0.88] tracking-tight md:text-[6.6rem]">
              Trees work hard.
              <br />
              <em className="text-copper">Let&rsquo;s keep</em> the record.
            </h1>
            <p className="enter enter-d2 mt-8 max-w-md text-pretty text-lg leading-relaxed text-muted-foreground">
              Mapping, monitoring and protecting our green infrastructure with AI — geo-tagged
              inventory, health screening and carbon estimates.
            </p>
            <div className="enter enter-d3 mt-10 flex flex-wrap gap-3">
              <Link
                to="/capture"
                className="group inline-flex items-center gap-2.5 rounded-sm bg-primary px-6 py-3.5 text-primary-foreground shadow-lift transition-[transform,background-color] duration-300 ease-out hover:-translate-y-0.5 hover:bg-primary/90"
              >
                Frame a leaf
                <span
                  aria-hidden="true"
                  className="transition-transform duration-300 ease-out group-hover:translate-x-1"
                >
                  →
                </span>
              </Link>
              <Link
                to="/map"
                className="group inline-flex items-center gap-2.5 rounded-sm border border-foreground/30 px-6 py-3.5 transition-[transform,background-color,color] duration-300 ease-out hover:-translate-y-0.5 hover:bg-ink hover:text-ink-foreground"
              >
                Explore the campus map
                <span
                  aria-hidden="true"
                  className="transition-transform duration-300 ease-out group-hover:translate-x-1"
                >
                  →
                </span>
              </Link>
            </div>
            <dl className="enter enter-d4 mt-14 grid max-w-lg grid-cols-3 gap-6 border-t border-foreground/15 pt-6">
              <div>
                <dt className="eyebrow text-muted-foreground">Campus</dt>
                <dd className="mt-2 font-display text-2xl leading-none">BMSIT</dd>
              </div>
              <div>
                <dt className="eyebrow text-muted-foreground">Objectives</dt>
                <dd className="mt-2 font-display text-2xl leading-none">06</dd>
              </div>
              <div>
                <dt className="eyebrow text-muted-foreground">Field steps</dt>
                <dd className="mt-2 font-display text-2xl leading-none">04</dd>
              </div>
            </dl>
          </div>
          <div className="relative h-[420px] md:col-span-5 md:h-[560px]">
            <div className="absolute inset-0">
              <ClientOnly fallback={null}>
                <Suspense fallback={null}>
                  <HeroOrb />
                </Suspense>
              </ClientOnly>
            </div>
            <LeafSketch className="pointer-events-none absolute inset-x-8 inset-y-6 opacity-80" />
            <p className="eyebrow absolute bottom-0 right-0 text-muted-foreground">
              Fig. 1 — Neem, leaf study
            </p>
          </div>
        </div>
      </section>

      <Reveal as="section" className="mx-auto max-w-7xl px-5 py-28 md:px-10">
        <p className="reveal eyebrow text-primary">The monitoring gap</p>
        <div className="mt-6 grid gap-12 md:grid-cols-2">
          <h2 className="reveal text-4xl leading-tight md:text-6xl">
            Campus trees work hard, yet go unrecorded.
          </h2>
          <div className="grid gap-8 sm:grid-cols-2">
            <div className="reveal rule pt-4">
              <p className="eyebrow">Visible benefits</p>
              <p className="mt-3 text-muted-foreground">
                Shade, cooling, carbon storage, cleaner air and habitat.
              </p>
            </div>
            <div className="reveal rule pt-4">
              <p className="eyebrow text-critical">Invisible decline</p>
              <p className="mt-3 text-muted-foreground">
                Shrinking girth, oozing sap, discolouring and leaf pigmentation go unnoticed — until
                damage, a fall, or the tree is no more.
              </p>
            </div>
            <p className="reveal font-display text-2xl sm:col-span-2">
              Needed: simple, scalable, data-driven monitoring — routine, not reactive.
            </p>
          </div>
        </div>
      </Reveal>

      <section className="bg-ink text-ink-foreground">
        <Reveal className="mx-auto max-w-7xl px-5 py-28 md:px-10">
          <p className="reveal eyebrow text-primary">Project objectives</p>
          <h2 className="reveal mt-4 max-w-3xl text-4xl md:text-6xl">
            From four problems to six objectives.
          </h2>
          <div className="mt-14 grid gap-px bg-ink-foreground/15 sm:grid-cols-2 lg:grid-cols-3">
            {objectives.map(([n, t, d]) => (
              <div
                key={n}
                className="reveal bg-ink p-8 transition-colors duration-500 ease-out hover:bg-white/8"
              >
                <span className="font-mono text-sm text-primary">{n}</span>
                <h3 className="mt-8 text-2xl tracking-tight">{t}</h3>
                <p className="mt-3 max-w-xs text-sm leading-relaxed opacity-70">{d}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <Reveal as="section" className="mx-auto max-w-7xl px-5 py-28 md:px-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="reveal eyebrow text-primary">The field experience</p>
            <h2 className="reveal mt-4 text-4xl md:text-6xl">
              Photograph a tree,
              <br />
              get a care plan.
            </h2>
          </div>
          <Link
            to="/capture"
            className="reveal group inline-flex items-center gap-2.5 rounded-sm bg-primary px-6 py-3.5 text-primary-foreground transition-transform duration-300 ease-out hover:-translate-y-0.5"
          >
            Start a capture
            <span
              aria-hidden="true"
              className="transition-transform duration-300 ease-out group-hover:translate-x-1"
            >
              →
            </span>
          </Link>
        </div>
        <ol className="mt-14 grid gap-10 md:grid-cols-4">
          {steps.map(([n, t, d]) => (
            <li key={n} className="reveal rule group pt-6">
              <span className="inline-block font-display text-6xl text-copper transition-transform duration-500 ease-out group-hover:-translate-y-1">
                {n}
              </span>
              <h3 className="mt-5 text-2xl tracking-tight">{t}</h3>
              <p className="mt-2 leading-relaxed text-muted-foreground">{d}</p>
            </li>
          ))}
        </ol>
      </Reveal>

      <Reveal as="section" className="mx-auto grid max-w-7xl gap-10 px-5 md:grid-cols-12 md:px-10">
        <div className="reveal md:col-span-5">
          <p className="eyebrow text-primary">Illustrative result · not a measured record</p>
          <h2 className="mt-4 text-4xl md:text-5xl">One scan becomes a campus carbon record.</h2>
          <p className="mt-6 text-muted-foreground">
            Carbon ≈ 47% of dry biomass. Multiply by 3.67 for CO₂ equivalent. Per 100 kg dry
            biomass: <b className="text-foreground">47 kg C · 172.5 kg CO₂e</b>.
          </p>
        </div>
        <div className="reveal rounded-md border bg-card p-8 shadow-lift transition-shadow duration-500 hover:shadow-[0_28px_70px_-32px_oklch(0.19_0.03_170_/_55%)] md:col-span-7 md:p-10">
          <div className="flex items-baseline justify-between gap-4">
            <h3 className="text-3xl tracking-tight">Neem</h3>
            <span className="font-mono text-sm tabular-nums">92% confidence</span>
          </div>
          <div className="mt-8 flex items-end gap-4">
            <span className="font-display text-8xl leading-none tabular-nums">74</span>
            <span className="pb-3 text-muted-foreground">
              / 100 · <b className="text-watch">Watch</b>
            </span>
          </div>
          <div className="mt-6 h-1 overflow-hidden rounded-full bg-muted" aria-hidden="true">
            <div className="h-full w-[74%] rounded-full bg-watch" />
          </div>
          <p className="mt-6 rule pt-4">Early leaf spot · repeat scans support early detection.</p>
          <p className="mt-2 text-muted-foreground">
            Suggested care: prune; apply neem-oil spray after review.
          </p>
        </div>
      </Reveal>
    </>
  );
}
