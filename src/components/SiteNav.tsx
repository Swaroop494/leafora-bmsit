import { Link } from "@tanstack/react-router";
import { useState } from "react";

const links = [
  { to: "/capture", label: "Capture" },
  { to: "/map", label: "Campus map" },
  { to: "/roadmap", label: "Features" },
  { to: "/method", label: "Method" },
] as const;

export function SiteNav() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-10" aria-label="Main">
        <Link to="/" className="flex items-baseline gap-2">
          <span className="font-display text-2xl">Leafora</span>
          <span className="eyebrow hidden text-muted-foreground sm:inline">BMSIT</span>
        </Link>
        <div className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="text-sm text-muted-foreground transition-colors hover:text-foreground" activeProps={{ className: "text-sm text-foreground underline underline-offset-8 decoration-primary" }}>
              {l.label}
            </Link>
          ))}
          <Link to="/login" className="rounded-sm bg-ink px-4 py-2 text-sm text-ink-foreground transition-colors hover:bg-primary">Sign in</Link>
        </div>
        <button className="eyebrow md:hidden" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? "Close" : "Menu"}</button>
      </nav>
      {open && (
        <div className="flex flex-col gap-4 border-t px-5 py-6 md:hidden">
          {links.map((l) => <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="font-display text-3xl">{l.label}</Link>)}
          <Link to="/login" onClick={() => setOpen(false)} className="font-display text-3xl text-primary">Sign in</Link>
        </div>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-32 bg-ink text-ink-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 md:grid-cols-3 md:px-10">
        <p className="font-display text-4xl leading-tight md:col-span-2">Healthy trees, healthy campus — measured and protected.</p>
        <div className="space-y-2 text-sm opacity-80">
          <p className="eyebrow">Guide · Chandrashekhar N</p>
          <p>Swaroop Patil · Gagan KS · Sneha Tapse · Madhurya B O</p>
          <p className="pt-4 opacity-70">A screening tool, not a replacement for an arborist. Carbon values are estimates.</p>
        </div>
      </div>
    </footer>
  );
}

export function PageHead({ eyebrow, title, intro }: { eyebrow: string; title: string; intro?: string }) {
  return (
    <div className="mx-auto max-w-7xl px-5 pb-10 pt-16 md:px-10 md:pt-24">
      <p className="eyebrow text-primary">{eyebrow}</p>
      <h1 className="mt-4 max-w-4xl text-5xl leading-[0.95] md:text-7xl">{title}</h1>
      {intro && <p className="mt-6 max-w-xl text-lg text-muted-foreground">{intro}</p>}
    </div>
  );
}
