import { Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { LanguageSelector } from "./LanguageSelector";
import { QrScannerModal } from "./QrScannerModal";
import { TRANSLATIONS, getCurrentLanguage, type LanguageCode } from "@/lib/i18n";
import { QrCode } from "lucide-react";

export function SiteNav() {
  const [open, setOpen] = useState(false);
  const [isQrScanOpen, setIsQrScanOpen] = useState(false);
  const [lang, setLang] = useState<LanguageCode>("en");

  useEffect(() => {
    setLang(getCurrentLanguage());
    const handler = () => setLang(getCurrentLanguage());
    window.addEventListener("leafora:lang-update", handler);
    return () => window.removeEventListener("leafora:lang-update", handler);
  }, []);

  const t = TRANSLATIONS[lang];

  const links = [
    { to: "/capture", label: t.navCapture },
    { to: "/map", label: t.navMap },
    { to: "/roadmap", label: t.navRoadmap },
    { to: "/method", label: t.navMethod },
  ] as const;

  return (
    <>
      <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
        <nav
          className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 md:px-10"
          aria-label="Main"
        >
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-baseline gap-2">
              <span className="font-display text-2xl font-bold tracking-tight text-primary">
                Leafora
              </span>
              <span className="eyebrow hidden text-muted-foreground sm:inline">BMSIT</span>
            </Link>
            <div className="hidden lg:block">
              <LanguageSelector />
            </div>
          </div>

          <div className="hidden items-center gap-6 md:flex">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                activeProps={{
                  className:
                    "text-sm text-foreground underline underline-offset-8 decoration-primary font-semibold",
                }}
              >
                {l.label}
              </Link>
            ))}

            <button
              type="button"
              onClick={() => setIsQrScanOpen(true)}
              className="flex items-center gap-1.5 rounded-sm border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:border-primary hover:text-primary transition-colors"
              title="Scan Campus Tree QR Tag"
            >
              <QrCode className="h-3.5 w-3.5" />
              <span>Scan QR</span>
            </button>

            <Link
              to="/login"
              className="rounded-sm bg-ink px-4 py-2 text-sm text-ink-foreground transition-colors hover:bg-primary"
            >
              {t.navSignIn}
            </Link>
          </div>

          <div className="flex items-center gap-3 md:hidden">
            <LanguageSelector />
            <button
              type="button"
              onClick={() => setIsQrScanOpen(true)}
              className="rounded border p-1.5 text-muted-foreground hover:text-foreground"
              aria-label="Scan QR Tag"
            >
              <QrCode className="h-4 w-4" />
            </button>
            <button className="eyebrow" aria-expanded={open} onClick={() => setOpen(!open)}>
              {open ? "Close" : "Menu"}
            </button>
          </div>
        </nav>

        {open && (
          <div className="flex flex-col gap-4 border-t px-5 py-6 md:hidden bg-background">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="font-display text-2xl text-foreground"
              >
                {l.label}
              </Link>
            ))}
            <Link
              to="/login"
              onClick={() => setOpen(false)}
              className="font-display text-2xl text-primary"
            >
              {t.navSignIn}
            </Link>
          </div>
        )}
      </header>

      <QrScannerModal isOpen={isQrScanOpen} onClose={() => setIsQrScanOpen(false)} />
    </>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-32 bg-ink text-ink-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 md:grid-cols-3 md:px-10">
        <div className="md:col-span-2 space-y-4">
          <p className="font-display text-4xl leading-tight">
            Healthy trees, healthy campus — measured, monitored and protected.
          </p>
          <p className="text-sm opacity-80 max-w-xl">
            Leafora combines computer vision tree leaf identification (TreeID), deep learning
            pathological disease screening (Plant-Health-Monitoring), and Chave pantropical biomass
            allometry to build an explainable campus carbon bank for BMSIT.
          </p>
        </div>
        <div className="space-y-2 text-sm opacity-80 border-t md:border-t-0 pt-6 md:pt-0">
          <p className="eyebrow text-emerald-400">Guide · Chandrashekhar N</p>
          <p className="font-medium">Swaroop Patil · Gagan KS · Sneha Tapse · Madhurya B O</p>
          <p className="text-xs opacity-75 pt-2">
            BMS Institute of Technology and Management, Yelahanka, Bangalore
          </p>
          <p className="pt-4 text-xs opacity-60">
            A proactive AI screening tool, not a replacement for an arborist. Biomass and carbon
            values are estimates.
          </p>
        </div>
      </div>
    </footer>
  );
}

export function PageHead({
  eyebrow,
  title,
  intro,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
}) {
  return (
    <div className="mx-auto max-w-7xl px-5 pb-10 pt-16 md:px-10 md:pt-24">
      <p className="eyebrow text-primary">{eyebrow}</p>
      <h1 className="mt-4 max-w-4xl text-5xl leading-[0.95] md:text-7xl font-display">{title}</h1>
      {intro && <p className="mt-6 max-w-2xl text-lg text-muted-foreground">{intro}</p>}
    </div>
  );
}
