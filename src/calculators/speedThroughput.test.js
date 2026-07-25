import { describe, it, expect } from "vitest";
import { calcSpeedThroughput } from "./speedThroughput";

describe("calcSpeedThroughput", () => {
  it("computes required belt speed from throughput (parcels/min)", () => {
    const result = calcSpeedThroughput({
      mode: "toSpeed",
      throughput: "30",
      throughputUnit: "min",
      parcelLength: "18",
      gap: "6",
      speed: "65",
    });
    expect(result).toEqual({
      value: "60.0",
      unit: "FT/MIN",
      label: "Required Belt Speed",
      extra: "30.0 parcels/min  ·  1800 parcels/hr",
    });
  });

  it("converts throughput given in parcels/hr before computing speed", () => {
    const result = calcSpeedThroughput({
      mode: "toSpeed",
      throughput: "1800",
      throughputUnit: "hr",
      parcelLength: "18",
      gap: "6",
      speed: "65",
    });
    expect(result.value).toBe("60.0");
    expect(result.extra).toBe("30.0 parcels/min  ·  1800 parcels/hr");
  });

  it("computes throughput from belt speed", () => {
    const result = calcSpeedThroughput({
      mode: "toThroughput",
      throughput: "30",
      throughputUnit: "min",
      parcelLength: "18",
      gap: "6",
      speed: "65",
    });
    expect(result).toEqual({
      value: "32.5",
      unit: "PARCELS/MIN",
      label: "Throughput",
      extra: "1950 parcels/hr",
    });
  });

  it("returns null when parcel length or gap is not a number", () => {
    expect(
      calcSpeedThroughput({ mode: "toSpeed", throughput: "30", throughputUnit: "min", parcelLength: "", gap: "6", speed: "65" })
    ).toBeNull();
    expect(
      calcSpeedThroughput({ mode: "toSpeed", throughput: "30", throughputUnit: "min", parcelLength: "18", gap: "", speed: "65" })
    ).toBeNull();
  });

  it("returns null when the driving input (throughput or speed) is zero", () => {
    expect(
      calcSpeedThroughput({ mode: "toSpeed", throughput: "0", throughputUnit: "min", parcelLength: "18", gap: "6", speed: "65" })
    ).toBeNull();
    expect(
      calcSpeedThroughput({ mode: "toThroughput", throughput: "30", throughputUnit: "min", parcelLength: "18", gap: "6", speed: "0" })
    ).toBeNull();
  });
});
