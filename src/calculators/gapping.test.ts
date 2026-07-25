import { describe, it, expect } from "vitest";
import { calcGapResult, calcMonteCarloGap } from "./gapping";
import { unwrap } from "./testUtils";

describe("calcGapResult", () => {
  it("computes the gap created after each gapper stage", () => {
    const result = calcGapResult({ parcelLength: "24", inputSpeed: "60", gapperSpeeds: ["75", "95", "120"] });
    expect(result).toEqual({
      gap: "24.0",
      valid: true,
      stepGaps: ["6.0", "14.0", "24.0"],
    });
  });

  it("flags the sequence invalid when any stage is slower than the one before it", () => {
    const result = unwrap(calcGapResult({ parcelLength: "24", inputSpeed: "60", gapperSpeeds: ["75", "50", "120"] }));
    expect(result.valid).toBe(false);
  });

  it("flags the sequence invalid when the first gapper is slower than the input speed", () => {
    const result = unwrap(calcGapResult({ parcelLength: "24", inputSpeed: "60", gapperSpeeds: ["50"] }));
    expect(result.valid).toBe(false);
  });

  it("returns null when parcel length, input speed, or any gapper speed fails to parse", () => {
    expect(calcGapResult({ parcelLength: "", inputSpeed: "60", gapperSpeeds: ["75"] })).toBeNull();
    expect(calcGapResult({ parcelLength: "24", inputSpeed: "60", gapperSpeeds: ["75", ""] })).toBeNull();
    expect(calcGapResult({ parcelLength: "24", inputSpeed: "60", gapperSpeeds: [] })).toBeNull();
  });
});

describe("calcMonteCarloGap", () => {
  const DEFAULTS = {
    minParcelLength: "16",
    parcelLength: "24",
    maxParcelLength: "34",
    inputSpeed: "60",
    gapperSpeeds: ["75", "95", "120"],
  };

  it("is deterministic for the same inputs", () => {
    const a = calcMonteCarloGap(DEFAULTS);
    const b = calcMonteCarloGap(DEFAULTS);
    expect(a).toEqual(b);
  });

  it("samples 10,000 parcels into 18 bins that account for every sample", () => {
    const result = unwrap(calcMonteCarloGap(DEFAULTS));
    expect(result.sampleCount).toBe(10000);
    expect(result.counts).toHaveLength(18);
    expect(result.bins).toHaveLength(19);
    expect(result.counts.reduce((a, b) => a + b, 0)).toBe(10000);
  });

  it("centers the sampled mean near the analytic mean of the triangular distribution", () => {
    // For a triangular(a, c, b) distribution, E[X] = (a + c + b) / 3. The
    // gap is that parcel-length distribution scaled by a fixed speed ratio.
    const result = unwrap(calcMonteCarloGap(DEFAULTS));
    const ratio = 120 / 60 - 1; // last gapper speed vs input speed
    const analyticMean = ratio * ((16 + 24 + 34) / 3);
    expect(result.mean).toBeGreaterThan(analyticMean - 0.5);
    expect(result.mean).toBeLessThan(analyticMean + 0.5);
  });

  it("keeps min <= p5 <= mean <= max", () => {
    const result = unwrap(calcMonteCarloGap(DEFAULTS));
    expect(result.min).toBeLessThanOrEqual(result.p5);
    expect(result.p5).toBeLessThanOrEqual(result.mean);
    expect(result.mean).toBeLessThanOrEqual(result.max);
  });

  it("returns null when max is less than min, or the average is outside [min, max]", () => {
    expect(calcMonteCarloGap({ ...DEFAULTS, maxParcelLength: "10" })).toBeNull(); // max < min
    expect(calcMonteCarloGap({ ...DEFAULTS, parcelLength: "5" })).toBeNull(); // average < min
    expect(calcMonteCarloGap({ ...DEFAULTS, parcelLength: "100" })).toBeNull(); // average > max
  });

  it("returns null when input speed is not positive", () => {
    expect(calcMonteCarloGap({ ...DEFAULTS, inputSpeed: "0" })).toBeNull();
  });
});
