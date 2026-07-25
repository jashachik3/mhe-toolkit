import { describe, it, expect } from "vitest";
import { calcAccumulation } from "./accumulation";
import { unwrap } from "./testUtils";

describe("calcAccumulation", () => {
  it("computes total buffer length, buffer time, and package capacity", () => {
    const result = calcAccumulation({ speed: "100", zoneLength: "24", zoneCount: "10" });
    expect(result).toEqual({
      totalLengthFt: "20.0",
      bufferTimeSec: "12",
      bufferTimeMin: "0.20",
      packageCapacity: 10,
    });
  });

  it("floors a fractional zone count for package capacity", () => {
    const result = unwrap(calcAccumulation({ speed: "100", zoneLength: "24", zoneCount: "10.9" }));
    expect(result.packageCapacity).toBe(10);
  });

  it("returns null for non-positive speed or zone length, or fewer than 1 zone", () => {
    expect(calcAccumulation({ speed: "0", zoneLength: "24", zoneCount: "10" })).toBeNull();
    expect(calcAccumulation({ speed: "100", zoneLength: "0", zoneCount: "10" })).toBeNull();
    expect(calcAccumulation({ speed: "100", zoneLength: "24", zoneCount: "0.5" })).toBeNull();
  });

  it("returns null when inputs fail to parse", () => {
    expect(calcAccumulation({ speed: "", zoneLength: "24", zoneCount: "10" })).toBeNull();
  });
});
