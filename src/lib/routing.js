import { useState, useEffect, useCallback } from "react";

const VALID_VIEWS = ["home", "speed", "hp", "curve", "accum", "gap", "reference"];

function readHash() {
  const h = window.location.hash.replace(/^#/, "");
  return VALID_VIEWS.includes(h) ? h : "home";
}

// Keeps the current screen in sync with the URL hash, so the browser's
// back/forward buttons navigate between calculators and a specific
// calculator can be bookmarked or shared as a link.
export function useHashView() {
  const [view, setViewState] = useState(readHash);

  useEffect(() => {
    const onHashChange = () => setViewState(readHash());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const setView = useCallback((next) => {
    const target = VALID_VIEWS.includes(next) ? next : "home";
    if (readHash() === target) return;
    // Setting the hash triggers 'hashchange', which updates the state above
    // — this keeps a single source of truth (the URL) instead of two.
    window.location.hash = target === "home" ? "" : target;
  }, []);

  return [view, setView];
}
