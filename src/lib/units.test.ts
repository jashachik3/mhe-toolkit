import { describe, it, expect } from "vitest";
import { unitLabel, convertValue, toImperial, displayResult, convertNumber } from "./units";

describe("unitLabel", () => {
  it("returns the imperial or metric label for a known kind", () => {
    expect(unitLabel("length_in", "imperial")).toBe("in");
    expect(unitLabel("length_in", "metric")).toBe("cm");
    expect(unitLabel("speed_ftmin", "metric")).toBe("m/min");
    expect(unitLabel("weight_lb", "metric")).toBe("kg");
  });

  it("returns an empty string for an unknown kind", () => {
    expect(unitLabel("not_a_kind", "metric")).toBe("");
  });
});

describe("convertValue", () => {
  it("converts inches to centimeters and back", () => {
    expect(convertValue("18", "length_in", "imperial", "metric")).toBe("45.72");
    expect(convertValue("45.72", "length_in", "metric", "imperial")).toBe("18");
  });

  it("is a no-op when from and to systems match", () => {
    expect(convertValue("18", "length_in", "imperial", "imperial")).toBe("18");
  });

  it("passes non-numeric input through unchanged", () => {
    expect(convertValue("", "length_in", "imperial", "metric")).toBe("");
    expect(convertValue("abc", "length_in", "imperial", "metric")).toBe("abc");
  });

  it("round-trips within a small tolerance for an odd value", () => {
    const toMetric = convertValue("37.5", "length_ft", "imperial", "metric");
    const back = convertValue(toMetric, "length_ft", "metric", "imperial");
    expect(Number(back)).toBeCloseTo(37.5, 2);
  });
});

describe("toImperial", () => {
  it("converts a metric-system value to its imperial equivalent", () => {
    expect(toImperial("45.72", "length_in", "metric")).toBe("18");
  });

  it("leaves an imperial-system value unchanged", () => {
    expect(toImperial("18", "length_in", "imperial")).toBe("18");
  });
});

describe("displayResult", () => {
  it("formats an imperial computed value at a fixed decimal count", () => {
    expect(displayResult(150, "weight_lb", "imperial", 1)).toBe("150.0");
  });

  it("converts an imperial computed value to metric for display", () => {
    // 150 lb -> kg
    expect(displayResult(150, "weight_lb", "metric", 1)).toBe("68.0");
  });

  it("accepts a string input the same as a number", () => {
    expect(displayResult("150", "weight_lb", "metric", 1)).toBe("68.0");
  });
});

describe("convertNumber", () => {
  it("returns the raw imperial number unchanged in imperial system", () => {
    expect(convertNumber(24, "length_in", "imperial")).toBe(24);
  });

  it("converts to a raw metric number for further math (no rounding/formatting)", () => {
    expect(convertNumber(24, "length_in", "metric")).toBeCloseTo(60.96, 5);
  });
});
