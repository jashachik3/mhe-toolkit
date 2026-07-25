// Unit-system conversion for the metric/imperial toggle. Every physical
// quantity in the app is tagged with a "kind"; each kind has a fixed
// imperial<->metric factor (multiply by `toMetric` to go imperial->metric).
const FACTORS = {
  length_in: { toMetric: 2.54, imperial: "in", metric: "cm" },
  length_ft: { toMetric: 0.3048, imperial: "ft", metric: "m" },
  speed_ftmin: { toMetric: 0.3048, imperial: "ft/min", metric: "m/min" },
  load_lbft: { toMetric: 1.48816, imperial: "lb/ft", metric: "kg/m" },
  unitweight_lbft2: { toMetric: 4.88243, imperial: "lb/ft²", metric: "kg/m²" },
  weight_lb: { toMetric: 0.453592, imperial: "lb", metric: "kg" },
};

export function unitLabel(kind, system) {
  const f = FACTORS[kind];
  if (!f) return "";
  return system === "metric" ? f.metric : f.imperial;
}

function roundForDisplay(n) {
  // Enough precision to not lose meaning, not so much that float tails
  // show up (e.g. 18 * 2.54 should read "45.72", not "45.71999999996").
  return Math.round(n * 1000) / 1000;
}

// Converts a raw display-string value (as stored/typed) from one system to
// another for the same physical quantity. Used both for the one-time bulk
// conversion when the global toggle flips, and for normalizing a
// currently-displayed value to imperial before feeding a calculator's
// (imperial-only) formula. Non-numeric input passes through unchanged.
export function convertValue(valueStr, kind, fromSystem, toSystem) {
  if (fromSystem === toSystem || !FACTORS[kind]) return valueStr;
  const n = parseFloat(valueStr);
  if (isNaN(n)) return valueStr;
  const factor = FACTORS[kind].toMetric;
  const converted = fromSystem === "imperial" ? n * factor : n / factor;
  return String(roundForDisplay(converted));
}

export function toImperial(valueStr, kind, system) {
  return convertValue(valueStr, kind, system, "imperial");
}

// For formatting a computed (imperial) result for display in the current
// system — read-only, never round-tripped back into storage, so it can
// use its own fixed decimal precision independent of convertValue.
export function displayResult(numOrStr, kind, system, decimals = 1) {
  const n = typeof numOrStr === "number" ? numOrStr : parseFloat(numOrStr);
  if (isNaN(n)) return String(numOrStr);
  const converted = system === "metric" ? n * FACTORS[kind].toMetric : n;
  return converted.toFixed(decimals);
}

// Same idea as displayResult, but returns a raw number instead of a fixed
// -decimal string — for values that feed further internal math (histogram
// binning, diagram scaling) rather than being rendered as text directly.
export function convertNumber(n, kind, system) {
  if (system !== "metric" || !FACTORS[kind]) return n;
  return n * FACTORS[kind].toMetric;
}
