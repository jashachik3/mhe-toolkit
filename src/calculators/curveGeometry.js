// Pure math for the Belt Curve Geometry calculator.
export function calcCurveWidth({ pkgLength, pkgWidth, insideRadius, clearance }) {
  const L = parseFloat(pkgLength);
  const W = parseFloat(pkgWidth);
  const R1 = parseFloat(insideRadius);
  const cl = parseFloat(clearance) || 0;
  if ([L, W, R1].some((n) => isNaN(n)) || R1 <= 0) return null;

  const bwGeometric = Math.sqrt(R1 * R1 + L * L) - R1 + W;
  const bw = bwGeometric + cl;
  const r2 = R1 + bw;

  return {
    bw,
    r2: r2.toFixed(1),
    bwDisplay: bw.toFixed(1),
    bwGeometric: bwGeometric.toFixed(1),
    clearance: cl.toFixed(1),
  };
}
