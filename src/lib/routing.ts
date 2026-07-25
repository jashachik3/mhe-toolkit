import { useState, useEffect, useCallback } from "react";

export type View = "home" | "speed" | "hp" | "curve" | "accum" | "gap" | "reference";

// Shared prop shape for every top-level screen component.
export interface ScreenProps {
  setView: (view: View) => void;
}

const VALID_VIEWS: View[] = ["home", "speed", "hp", "curve", "accum", "gap", "reference"];

function isView(value: string): value is View {
  return (VALID_VIEWS as string[]).includes(value);
}

function readHash(): View {
  const h = window.location.hash.replace(/^#/, "");
  return isView(h) ? h : "home";
}

// Keeps the current screen in sync with the URL hash, so the browser's
// back/forward buttons navigate between calculators and a specific
// calculator can be bookmarked or shared as a link.
export function useHashView(): [View, (next: View) => void] {
  const [view, setViewState] = useState<View>(readHash);

  useEffect(() => {
    const onHashChange = () => setViewState(readHash());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const setView = useCallback((next: View) => {
    const target = isView(next) ? next : "home";
    if (readHash() === target) return;
    // Setting the hash triggers 'hashchange', which updates the state above
    // — this keeps a single source of truth (the URL) instead of two.
    window.location.hash = target === "home" ? "" : target;
  }, []);

  return [view, setView];
}
