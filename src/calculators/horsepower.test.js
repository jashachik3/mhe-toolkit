import { describe, it, expect } from "vitest";
import { calcHorsepower, MOTOR_SIZES } from "./horsepower";

const DEFAULTS = {
  conveyorLength: "50",
  beltWidth: "24",
  beltUnitWeight: "1.5",
  loadPerFoot: "20",
  speed: "65",
  angle: "0",
  friction: "0.10",
  efficiency: "85",
};

describe("calcHorsepower", () => {
  it("computes belt weight, load, tension, HP and rounds up to the next stock motor", () => {
    const result = calcHorsepower(DEFAULTS);
    expect(result).toEqual({
      wb: "150.0",
      wm: "1000.0",
      te: "115.0",
      hpRaw: "0.27",
      motor: 0.33,
    });
  });

  it("adds an incline term via sin(angle) that increases effective tension", () => {
    const flat = calcHorsepower(DEFAULTS);
    const inclined = calcHorsepower({ ...DEFAULTS, angle: "10" });
    expect(Number(inclined.te)).toBeGreaterThan(Number(flat.te));
    expect(inclined.te).toBe("288.6");
    expect(inclined.hpRaw).toBe("0.67");
  });

  it("picks the smallest stock motor size that covers the raw HP", () => {
    // hpRaw ~0.27 -> next size at/above it is 0.33
    const result = calcHorsepower(DEFAULTS);
    expect(MOTOR_SIZES).toContain(result.motor);
    expect(Number(result.hpRaw)).toBeLessThanOrEqual(result.motor);
  });

  it("falls back to the largest motor size when raw HP exceeds the catalog", () => {
    const result = calcHorsepower({ ...DEFAULTS, loadPerFoot: "5000" });
    expect(result.motor).toBe(MOTOR_SIZES[MOTOR_SIZES.length - 1]);
  });

  it("returns null when efficiency is zero (division by zero guard)", () => {
    expect(calcHorsepower({ ...DEFAULTS, efficiency: "0" })).toBeNull();
  });

  it("returns null when any input fails to parse", () => {
    expect(calcHorsepower({ ...DEFAULTS, conveyorLength: "" })).toBeNull();
  });
});
