// Unit-system conversion for the metric/imperial toggle. Every physical
// quantity in the app is tagged with a "kind"; each kind has a fixed
// imperial<->metric factor (multiply by `toMetric` to go imperial->metric).
export type UnitKind = "length_in" | "length_ft" | "speed_ftmin" | "load_lbft" | "unitweight_lbft2" | "weight_lb";
export type UnitSystem = "imperial" | "metric";

interface UnitFactor {
  toMetric: number;
  imperial: string;
  metric: string;
}

const FACTORS: Record<UnitKind, UnitFactor> = {
  length_in: { toMetric: 2.54, imperial: "in", metric: "cm" },
  length_ft: { toMetric: 0.3048, imperial: "ft", metric: "m" },
  speed_ftmin: { toMetric: 0.3048, imperial: "ft/min", metric: "m/min" },
  load_lbft: { toMetric: 1.48816, imperial: "lb/ft", metric: "kg/m" },
  unitweight_lbft2: { toMetric: 4.88243, imperial: "lb/ft²", metric: "kg/m²" },
  weight_lb: { toMetric: 0.453592, imperial: "lb", metric: "kg" },
};

// `kind` is typed loosely (string) in these utilities rather than as
// UnitKind, on purpose: they're meant to degrade gracefully (return "" /
// pass the value through unchanged) for whatever runtime value shows up,
// rather than assume it's already valid. The actual typo-safety comes
// from the *call sites* — Field's `kind` prop and the unitSystem.ts
// registries are typed as UnitKind, so a typo'd kind string fails to
// compile there instead of silently no-op'ing here at runtime.
export function unitLabel(kind: string | undefined, system: UnitSystem): string {
  if (!kind) return "";
  const f = FACTORS[kind as UnitKind];
  if (!f) return "";
  return system === "metric" ? f.metric : f.imperial;
}

function roundForDisplay(n: number): number {
  // Enough precision to not lose meaning, not so much that float tails
  // show up (e.g. 18 * 2.54 should read "45.72", not "45.71999999996").
  return Math.round(n * 1000) / 1000;
}

// Converts a raw display-string value (as stored/typed) from one system to
// another for the same physical quantity. Used both for the one-time bulk
// conversion when the global toggle flips, and for normalizing a
// currently-displayed value to imperial before feeding a calculator's
// (imperial-only) formula. Non-numeric input passes through unchanged.
export function convertValue(valueStr: string, kind: string, fromSystem: UnitSystem, toSystem: UnitSystem): string {
  const f = FACTORS[kind as UnitKind];
  if (fromSystem === toSystem || !f) return valueStr;
  const n = parseFloat(valueStr);
  if (isNaN(n)) return valueStr;
  const converted = fromSystem === "imperial" ? n * f.toMetric : n / f.toMetric;
  return String(roundForDisplay(converted));
}

export function toImperial(valueStr: string, kind: string, system: UnitSystem): string {
  return convertValue(valueStr, kind, system, "imperial");
}

// For formatting a computed (imperial) result for display in the current
// system — read-only, never round-tripped back into storage, so it can
// use its own fixed decimal precision independent of convertValue.
export function displayResult(numOrStr: number | string, kind: string, system: UnitSystem, decimals = 1): string {
  const n = typeof numOrStr === "number" ? numOrStr : parseFloat(numOrStr);
  const f = FACTORS[kind as UnitKind];
  if (isNaN(n) || !f) return String(numOrStr);
  const converted = system === "metric" ? n * f.toMetric : n;
  return converted.toFixed(decimals);
}

// Same idea as displayResult, but returns a raw number instead of a fixed
// -decimal string — for values that feed further internal math (histogram
// binning, diagram scaling) rather than being rendered as text directly.
export function convertNumber(n: number, kind: string, system: UnitSystem): number {
  const f = FACTORS[kind as UnitKind];
  if (system !== "metric" || !f) return n;
  return n * f.toMetric;
}
