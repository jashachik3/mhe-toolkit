// Pure math for the Accumulation Buffer / Time calculator.
export function calcAccumulation({ speed, zoneLength, zoneCount }) {
  const V = parseFloat(speed);
  const zl = parseFloat(zoneLength);
  const N = parseFloat(zoneCount);
  if ([V, zl, N].some((n) => isNaN(n)) || V <= 0 || zl <= 0 || N < 1) return null;

  const totalLengthFt = (N * zl) / 12;
  const bufferTimeMin = totalLengthFt / V;
  const bufferTimeSec = bufferTimeMin * 60;

  return {
    totalLengthFt: totalLengthFt.toFixed(1),
    bufferTimeSec: bufferTimeSec.toFixed(0),
    bufferTimeMin: bufferTimeMin.toFixed(2),
    packageCapacity: Math.floor(N),
  };
}
