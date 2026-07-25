import { describe, it, expect } from "vitest";
import { calcCurveWidth } from "./curveGeometry";
import { unwrap } from "./testUtils";

describe("calcCurveWidth", () => {
  it("computes minimum curve width and required outside radius", () => {
    const result = unwrap(
      calcCurveWidth({
        pkgLength: "20",
        pkgWidth: "14",
        insideRadius: "24",
        clearance: "1.5",
      })
    );
    expect(result.bwGeometric).toBe("21.2");
    expect(result.bwDisplay).toBe("22.7");
    expect(result.r2).toBe("46.7");
    expect(result.clearance).toBe("1.5");
  });

  it("treats a missing clearance as zero rather than failing", () => {
    const result = unwrap(calcCurveWidth({ pkgLength: "20", pkgWidth: "14", insideRadius: "24", clearance: "" }));
    expect(result.clearance).toBe("0.0");
    expect(result.bwDisplay).toBe(result.bwGeometric);
  });

  it("returns null for a non-positive inside radius", () => {
    expect(calcCurveWidth({ pkgLength: "20", pkgWidth: "14", insideRadius: "0", clearance: "1.5" })).toBeNull();
    expect(calcCurveWidth({ pkgLength: "20", pkgWidth: "14", insideRadius: "-5", clearance: "1.5" })).toBeNull();
  });

  it("returns null when length, width, or radius fail to parse", () => {
    expect(calcCurveWidth({ pkgLength: "", pkgWidth: "14", insideRadius: "24", clearance: "1.5" })).toBeNull();
  });
});
