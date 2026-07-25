import { describe, it, expect } from "vitest";
import { computeConvertedFields } from "./unitSystem";

describe("computeConvertedFields", () => {
  it("converts a field that's already in the snapshot", () => {
    const result = computeConvertedFields({ "hp.conveyorLength": "50" }, "imperial", "metric");
    expect(result["hp.conveyorLength"]).toBe("15.24"); // 50 ft -> m
  });

  it("regression: falls back to the field's default when it was never persisted", () => {
    // Simulates toggling units before ever opening the Static Gapping
    // screen — its usePersistentState hooks haven't run yet, so nothing
    // under "gap.*" exists in localStorage. The conversion must still use
    // gap.inputSpeed's real default (60 ft/min), not skip the field.
    const result = computeConvertedFields({}, "imperial", "metric");
    expect(result["gap.inputSpeed"]).toBe("18.288"); // 60 ft/min -> m/min
    expect(result["gap.parcelLength"]).toBe("60.96"); // 24 in -> cm
  });

  it("converts every registered array field, falling back to its default array", () => {
    const result = computeConvertedFields({}, "imperial", "metric");
    expect(result["gap.gapperSpeeds"]).toEqual(["22.86", "28.956", "36.576"]);
  });

  it("converts an already-persisted array field element-wise", () => {
    const result = computeConvertedFields({ "gap.gapperSpeeds": ["80", "100"] }, "imperial", "metric");
    expect(result["gap.gapperSpeeds"]).toEqual(["24.384", "30.48"]);
  });

  it("round-trips a converted snapshot back to (approximately) the original", () => {
    const toMetric = computeConvertedFields({ "curve.pkgLength": "37.5" }, "imperial", "metric");
    const backToImperial = computeConvertedFields(
      { "curve.pkgLength": toMetric["curve.pkgLength"] },
      "metric",
      "imperial"
    );
    expect(Number(backToImperial["curve.pkgLength"])).toBeCloseTo(37.5, 2);
  });

  it("leaves dimensionless fields (count, %, angle, friction) out of the conversion set", () => {
    const result = computeConvertedFields({}, "imperial", "metric");
    expect(result).not.toHaveProperty("gap.gapperCount");
    expect(result).not.toHaveProperty("hp.friction");
    expect(result).not.toHaveProperty("hp.efficiency");
  });
});
