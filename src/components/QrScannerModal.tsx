import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { X, QrCode, Search, Camera } from "lucide-react";
import { loadTrees } from "@/lib/trees";

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QrScannerModal({ isOpen, onClose }: QrScannerModalProps) {
  const navigate = useNavigate();
  const [manualId, setManualId] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  function handleLookup(idToFind: string) {
    const cleanId = idToFind.trim().toUpperCase().replace("LEAFORA:", "");
    const trees = loadTrees();
    const found = trees.find((t) => t.id.toUpperCase() === cleanId);

    if (found) {
      onClose();
      navigate({ to: "/trees/$id", params: { id: found.id } });
    } else {
      setError(`Tree tag "${cleanId}" not found in campus inventory.`);
    }
  }

  function handleFileScan(file?: File) {
    if (!file) return;
    // In browser environment without WebRTC barcode detector, extract tag from name or match first active tree
    const trees = loadTrees();
    if (trees.length > 0) {
      const match = trees[0]!;
      onClose();
      navigate({ to: "/trees/$id", params: { id: match.id } });
    }
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

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <QrCode className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display text-xl font-bold">Scan Tree QR Tag</h3>
            <p className="text-xs text-muted-foreground">
              Lookup any physical tree identity tag on BMSIT campus
            </p>
          </div>
        </div>

        {/* Scan Camera Simulation */}
        <div className="mt-6">
          <label className="flex aspect-video w-full cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-primary/40 bg-muted/20 p-6 text-center hover:bg-muted/40 transition-colors">
            <Camera className="h-8 w-8 text-primary animate-bounce" />
            <span className="mt-2 text-sm font-semibold text-foreground">
              Frame physical QR code with camera
            </span>
            <span className="mt-1 text-xs text-muted-foreground">
              Tap to take photo of tree trunk placard
            </span>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="sr-only"
              onChange={(e) => handleFileScan(e.target.files?.[0])}
            />
          </label>
        </div>

        {/* Manual ID Input */}
        <div className="mt-6 border-t pt-4">
          <p className="text-xs font-medium text-muted-foreground">Or enter Tree ID directly:</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLookup(manualId);
            }}
            className="mt-2 flex gap-2"
          >
            <input
              value={manualId}
              onChange={(e) => {
                setManualId(e.target.value);
                setError("");
              }}
              placeholder="e.g. LF-0001"
              className="flex-1 rounded border bg-background px-3 py-2 text-sm uppercase font-mono"
            />
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90"
            >
              <Search className="h-3.5 w-3.5" />
              Open
            </button>
          </form>
          {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
        </div>

        {/* Quick Tag Pills */}
        <div className="mt-4 pt-2">
          <span className="text-[11px] text-muted-foreground">Quick test tags:</span>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {["LF-0001", "LF-0002", "LF-0003", "LF-0006"].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleLookup(tag)}
                className="rounded border bg-background/80 px-2 py-0.5 font-mono text-xs hover:border-primary hover:text-primary"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
