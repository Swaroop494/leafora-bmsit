import { useCallback, useEffect, useState } from "react";
import { loadTrees, saveTrees, type Tree } from "./trees";

export function useTrees() {
  const [trees, setTrees] = useState<Tree[] | null>(null);
  useEffect(() => {
    const sync = () => setTrees(loadTrees());
    sync();
    window.addEventListener("leafora:update", sync);
    return () => window.removeEventListener("leafora:update", sync);
  }, []);
  const update = useCallback((fn: (t: Tree[]) => Tree[]) => saveTrees(fn(loadTrees())), []);
  return { trees, update };
}
