import { useState, useEffect } from "react";
import { getCurrentLanguage, setCurrentLanguage, type LanguageCode } from "@/lib/i18n";
import { Globe } from "lucide-react";

export function LanguageSelector() {
  const [lang, setLang] = useState<LanguageCode>("en");

  useEffect(() => {
    setLang(getCurrentLanguage());
    const handler = () => setLang(getCurrentLanguage());
    window.addEventListener("leafora:lang-update", handler);
    return () => window.removeEventListener("leafora:lang-update", handler);
  }, []);

  const options: { code: LanguageCode; label: string }[] = [
    { code: "en", label: "EN" },
    { code: "kn", label: "ಕನ್ನಡ" },
    { code: "hi", label: "हिन्दी" },
  ];

  return (
    <div className="flex items-center gap-1 rounded border border-border/80 bg-background/80 p-0.5 text-xs shadow-sm">
      <Globe className="ml-1.5 h-3.5 w-3.5 text-muted-foreground" />
      {options.map((opt) => (
        <button
          key={opt.code}
          type="button"
          onClick={() => setCurrentLanguage(opt.code)}
          className={`rounded px-2 py-1 font-medium transition-colors ${
            lang === opt.code
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
