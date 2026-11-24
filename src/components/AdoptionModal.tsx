import { useState } from "react";
import { X, Award, Heart, Check, Printer, Droplets, Scissors } from "lucide-react";
import type { Tree } from "@/lib/trees";
import { speciesInfo, latest } from "@/lib/trees";

interface AdoptionModalProps {
  tree: Tree;
  isOpen: boolean;
  onClose: () => void;
  onAdopt: (stewardName: string) => void;
  onAddStewardshipLog: (
    action: "watering" | "mulching" | "pruning" | "compost" | "observation",
    notes: string,
  ) => void;
}

export function AdoptionModal({
  tree,
  isOpen,
  onClose,
  onAdopt,
  onAddStewardshipLog,
}: AdoptionModalProps) {
  const [stewardName, setStewardName] = useState(tree.adoptedBy || "");
  const [isEditing, setIsEditing] = useState(!tree.adoptedBy);
  const [actionType, setActionType] = useState<
    "watering" | "mulching" | "pruning" | "compost" | "observation"
  >("watering");
  const [logNotes, setLogNotes] = useState("");
  const [logSuccess, setLogSuccess] = useState(false);

  if (!isOpen) return null;

  const sp = speciesInfo(tree.species);
  const scan = latest(tree);

  function handleAdoptSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stewardName.trim()) return;
    onAdopt(stewardName.trim());
    setIsEditing(false);
  }

  function handleLogSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!logNotes.trim()) return;
    onAddStewardshipLog(actionType, logNotes.trim());
    setLogSuccess(true);
    setTimeout(() => {
      setLogSuccess(false);
      setLogNotes("");
    }, 1200);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative my-8 w-full max-w-2xl rounded-lg border bg-card p-6 md:p-8 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div>
          <span className="eyebrow text-primary">Student & Faculty Tree Adoption</span>
          <h2 className="mt-1 text-3xl font-display">Adopt-a-Tree Stewardship</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Foster, care for, and protect campus trees. Regular stewardship logs update the live
            health timeline.
          </p>
        </div>

        {/* Adoption Form or Certificate View */}
        {isEditing ? (
          <form
            onSubmit={handleAdoptSubmit}
            className="mt-6 rounded-md border bg-background/50 p-6 space-y-4"
          >
            <h3 className="text-lg font-bold">
              Adopt {tree.species} ({tree.id})
            </h3>
            <p className="text-xs text-muted-foreground">
              By adopting this tree in the {tree.zone}, you agree to periodically check its health,
              log seasonal observations, and alert campus facilities to structural hazards.
            </p>
            <div>
              <label className="block text-xs font-medium text-muted-foreground">
                Steward / Adopter Full Name
              </label>
              <input
                required
                value={stewardName}
                onChange={(e) => setStewardName(e.target.value)}
                placeholder="e.g. Swaroop Patil or CSE Eco-Club"
                className="mt-1 w-full rounded border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="pt-2">
              <button
                type="submit"
                className="flex items-center gap-2 rounded-sm bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                <Heart className="h-4 w-4 fill-current text-red-300" />
                Confirm Tree Adoption
              </button>
            </div>
          </form>
        ) : (
          /* Official Adoption Certificate */
          <div className="mt-6 space-y-6">
            <div
              id="adoption-certificate"
              className="rounded-lg border-4 border-amber-600/40 bg-stone-50 dark:bg-stone-900 p-6 text-center shadow-inner"
            >
              <div className="flex justify-center text-amber-600">
                <Award className="h-12 w-12" />
              </div>
              <p className="mt-2 text-xs font-mono uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
                BMS Institute of Technology & Management
              </p>
              <h3 className="mt-1 font-display text-2xl font-bold tracking-tight">
                Certificate of Tree Stewardship
              </h3>
              <p className="mt-4 text-xs text-muted-foreground">This honors that</p>
              <p className="font-display text-3xl font-bold text-primary mt-1">{tree.adoptedBy}</p>
              <p className="mt-1 text-xs text-muted-foreground">has pledged guardianship of</p>
              <p className="font-serif text-lg font-semibold text-foreground mt-1">
                {tree.species} <i className="text-xs text-muted-foreground">({sp.scientific})</i>
              </p>
              <p className="mt-2 font-mono text-xs text-stone-500">
                Tag ID: {tree.id} · Campus Zone: {tree.zone}
              </p>
              <div className="mt-4 flex justify-center gap-2">
                <span className="rounded-full bg-emerald-100 dark:bg-emerald-950 px-3 py-1 font-mono text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
                  🌿 Campus Green Guardian Badge
                </span>
              </div>
            </div>

            {/* Print Certificate Button */}
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-2 rounded-sm border px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                <Printer className="h-4 w-4" />
                Print Adoption Certificate
              </button>
            </div>

            {/* Stewardship Care Log Form */}
            <div className="rounded-md border bg-background/50 p-5 space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Log Tree Care Activity
              </h4>
              <form onSubmit={handleLogSubmit} className="grid gap-3 sm:grid-cols-3">
                <div className="sm:col-span-1">
                  <label className="block text-[11px] text-muted-foreground">Action</label>
                  <select
                    value={actionType}
                    onChange={(e) =>
                      setActionType(
                        e.target.value as
                          "watering" | "mulching" | "pruning" | "compost" | "observation",
                      )
                    }
                    className="mt-1 w-full rounded border bg-background px-2.5 py-1.5 text-xs"
                  >
                    <option value="watering">Watering (50L+)</option>
                    <option value="mulching">Root Mulching</option>
                    <option value="compost">Organic Compost</option>
                    <option value="pruning">Deadwood Pruning</option>
                    <option value="observation">Physical Inspection</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] text-muted-foreground">Care Notes</label>
                  <div className="mt-1 flex gap-2">
                    <input
                      required
                      value={logNotes}
                      onChange={(e) => setLogNotes(e.target.value)}
                      placeholder="e.g. Deep watered base; no pest holes noticed"
                      className="flex-1 rounded border bg-background px-2.5 py-1.5 text-xs"
                    />
                    <button
                      type="submit"
                      disabled={logSuccess}
                      className="rounded bg-primary px-3 py-1.5 text-xs text-primary-foreground hover:bg-primary/90"
                    >
                      {logSuccess ? <Check className="h-3.5 w-3.5" /> : "Log Care"}
                    </button>
                  </div>
                </div>
              </form>

              {/* Stewardship Activity List */}
              {tree.stewardshipLog && tree.stewardshipLog.length > 0 && (
                <div className="mt-3 space-y-2 border-t pt-3">
                  <span className="text-[11px] font-bold text-muted-foreground">Care History</span>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {tree.stewardshipLog.map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-center justify-between rounded bg-card p-2 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <Droplets className="h-3.5 w-3.5 text-blue-500" />
                          <span className="font-semibold capitalize">{entry.actionType}:</span>
                          <span className="text-muted-foreground">{entry.notes}</span>
                        </div>
                        <span className="font-mono text-[10px] text-muted-foreground shrink-0">
                          {entry.date}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-sm bg-primary px-5 py-2 text-sm text-primary-foreground hover:bg-primary/90"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
