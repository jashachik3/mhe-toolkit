import { usePersistentState } from "./storage";
import { convertValue } from "./units";

// Maps each persisted scalar field to its physical-quantity "kind" and its
// hardcoded default (must match the default passed to usePersistentState in
// the owning screen), so a toggle between imperial/metric can bulk-convert
// everything — including calculators the user hasn't opened yet, which
// have no localStorage entry until their component first mounts. Without
// the default here, switching units before ever visiting e.g. Static
// Gapping would leave its fields un-converted: the screen would fall back
// to its hardcoded imperial default value, mislabeled as metric.
// Dimensionless fields (counts, %, friction factor, angle in degrees, the
// throughput-unit/mode selectors) are intentionally omitted — they don't
// change with the unit system.
const SCALAR_FIELDS = {
  "speed.parcelLength": { kind: "length_in", default: "18" },
  "speed.gap": { kind: "length_in", default: "6" },
  "speed.speed": { kind: "speed_ftmin", default: "65" },
  "hp.conveyorLength": { kind: "length_ft", default: "50" },
  "hp.beltWidth": { kind: "length_in", default: "24" },
  "hp.beltUnitWeight": { kind: "unitweight_lbft2", default: "1.5" },
  "hp.loadPerFoot": { kind: "load_lbft", default: "20" },
  "hp.speed": { kind: "speed_ftmin", default: "65" },
  "curve.pkgLength": { kind: "length_in", default: "20" },
  "curve.pkgWidth": { kind: "length_in", default: "14" },
  "curve.insideRadius": { kind: "length_in", default: "24" },
  "curve.clearance": { kind: "length_in", default: "1.5" },
  "accum.speed": { kind: "speed_ftmin", default: "100" },
  "accum.zoneLength": { kind: "length_in", default: "24" },
  "gap.parcelLength": { kind: "length_in", default: "24" },
  "gap.minParcelLength": { kind: "length_in", default: "16" },
  "gap.maxParcelLength": { kind: "length_in", default: "34" },
  "gap.inputSpeed": { kind: "speed_ftmin", default: "60" },
};

// Same idea, for usePersistentJSON array fields (each element converted).
export const ARRAY_FIELDS = {
  "gap.gapperSpeeds": { kind: "speed_ftmin", default: ["75", "95", "120"] },
};

// Read-only accessor for screens that just need to know which system is
// active (to pick unit labels / normalize values before calculating).
export function useUnitSystem() {
  const [system] = usePersistentState("unitSystem", "imperial");
  return system;
}

// Pure: given a snapshot of whatever's currently persisted (keyed by the
// bare storage key, e.g. "gap.inputSpeed" — no "mhe-toolkit:" prefix, and
// only for keys that actually exist in localStorage), returns the full
// set of converted values to write back for EVERY registered field —
// falling back to each field's known default when the snapshot doesn't
// have it. That fallback is what makes switching units safe before ever
// visiting every calculator (see the SCALAR_FIELDS comment above).
export function computeConvertedFields(snapshot, currentSystem, newSystem) {
  const next = {};
  for (const [key, { kind, default: def }] of Object.entries(SCALAR_FIELDS)) {
    const raw = key in snapshot ? snapshot[key] : def;
    next[key] = convertValue(raw, kind, currentSystem, newSystem);
  }
  for (const [key, { kind, default: def }] of Object.entries(ARRAY_FIELDS)) {
    const arr = key in snapshot ? snapshot[key] : def;
    next[key] = arr.map((v) => convertValue(v, kind, currentSystem, newSystem));
  }
  return next;
}

// Bulk-converts every persisted field in place, then reloads the page —
// the same "mutate localStorage + reload" pattern already used by the
// "Reset saved inputs" button, so every screen picks up correctly
// converted values on next mount instead of needing live cross-component
// sync. A full reload also means values mid-edit are safely flushed first.
export function switchUnitSystem(newSystem) {
  const current = window.localStorage.getItem("mhe-toolkit:unitSystem") || "imperial";
  if (current === newSystem) return;

  try {
    const snapshot = {};
    for (const key of Object.keys(SCALAR_FIELDS)) {
      const raw = window.localStorage.getItem(`mhe-toolkit:${key}`);
      if (raw !== null) snapshot[key] = raw;
    }
    for (const key of Object.keys(ARRAY_FIELDS)) {
      const raw = window.localStorage.getItem(`mhe-toolkit:${key}`);
      if (raw !== null) snapshot[key] = JSON.parse(raw);
    }

    const converted = computeConvertedFields(snapshot, current, newSystem);
    for (const [key, value] of Object.entries(converted)) {
      const fullKey = `mhe-toolkit:${key}`;
      window.localStorage.setItem(fullKey, key in ARRAY_FIELDS ? JSON.stringify(value) : value);
    }
    window.localStorage.setItem("mhe-toolkit:unitSystem", newSystem);
  } catch {
    // localStorage unavailable — nothing to convert, just flip forward
  }
  window.location.reload();
}
