import { QRCodeSVG } from "qrcode.react";
import { Printer, X } from "lucide-react";
import type { Tree } from "@/lib/trees";
import { speciesInfo, latest, estimateCarbon } from "@/lib/trees";

interface QrTagModalProps {
  tree: Tree;
  isOpen: boolean;
  onClose: () => void;
}

export function QrTagModal({ tree, isOpen, onClose }: QrTagModalProps) {
  if (!isOpen) return null;

  const sp = speciesInfo(tree.species);
  const scan = latest(tree);
  const carbon = estimateCarbon(scan.girthCm, scan.heightM, sp.woodDensity);

  function handlePrint() {
    window.print();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-md rounded-lg border bg-card p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Printable Placard Card */}
        <div
          id="printable-tree-tag"
          className="rounded-lg border-2 border-stone-800 bg-white p-6 text-stone-900 shadow-md"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-stone-800 pb-3">
            <div>
              <p className="text-[10px] font-bold tracking-widest text-emerald-800 uppercase">
                BMSIT GREEN INFRASTRUCTURE
              </p>
              <h3 className="font-display text-2xl font-bold tracking-tight">Leafora Tree Tag</h3>
            </div>
            <span className="rounded bg-emerald-900 px-2 py-1 font-mono text-xs font-bold text-white">
              {tree.id}
            </span>
          </div>

          {/* Main Info with QR */}
          <div className="mt-5 flex items-center gap-5">
            <div className="rounded-md border-2 border-stone-800 bg-white p-2 shadow-xs">
              <QRCodeSVG
                value={`https://leafora.bmsit.edu/trees/${tree.id}`}
                size={110}
                level="H"
              />
            </div>
            <div className="space-y-1">
              <h4 className="font-display text-2xl font-bold text-stone-900">{tree.species}</h4>
              {sp.kannadaName && (
                <p className="font-medium text-emerald-700 text-sm">{sp.kannadaName}</p>
              )}
              <p className="font-serif italic text-xs text-stone-600">{sp.scientific}</p>
              <p className="pt-1 text-[11px] font-mono text-stone-500">Zone: {tree.zone}</p>
            </div>
          </div>

          {/* Metrics Footer */}
          <div className="mt-5 grid grid-cols-3 gap-2 border-t-2 border-stone-800 pt-3 text-center">
            <div className="rounded bg-stone-100 p-1.5">
              <span className="block text-[9px] uppercase tracking-wider text-stone-500">
                Carbon Bank
              </span>
              <span className="font-mono text-sm font-bold text-emerald-800">
                {carbon.co2Kg.toFixed(0)} kg
              </span>
            </div>
            <div className="rounded bg-stone-100 p-1.5">
              <span className="block text-[9px] uppercase tracking-wider text-stone-500">
                Girth / Ht
              </span>
              <span className="font-mono text-sm font-bold text-stone-800">
                {scan.girthCm}cm / {scan.heightM}m
              </span>
            </div>
            <div className="rounded bg-stone-100 p-1.5">
              <span className="block text-[9px] uppercase tracking-wider text-stone-500">
                Status
              </span>
              <span className="font-mono text-sm font-bold text-stone-800">{scan.category}</span>
            </div>
          </div>

          <p className="mt-4 text-center text-[10px] text-stone-500">
            Scan to view health timeline, log seasonal observations, or adopt this tree.
          </p>
        </div>

        {/* Modal Actions */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-sm border px-4 py-2 text-sm text-foreground hover:bg-muted"
          >
            Done
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-2 rounded-sm bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
          >
            <Printer className="h-4 w-4" />
            Print Physical Tag
          </button>
        </div>
      </div>
    </div>
  );
}
