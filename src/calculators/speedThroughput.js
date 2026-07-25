// Pure math for the Conveyor Speed / Throughput calculator — no React,
// no formatting concerns beyond the display strings the UI reads directly.
export function calcSpeedThroughput({ mode, throughput, throughputUnit, parcelLength, gap, speed }) {
  const len = parseFloat(parcelLength); // inches
  const g = parseFloat(gap); // inches
  if (isNaN(len) || isNaN(g)) return null;
  const sp = len + g; // center-to-center spacing, inches

  if (mode === "toSpeed") {
    const tpInput = parseFloat(throughput);
    if (!tpInput || !sp) return null;
    const ppm = throughputUnit === "hr" ? tpInput / 60 : tpInput; // parcels/min
    const fpm = (ppm * sp) / 12;
    return {
      value: fpm.toFixed(1),
      unit: "FT/MIN",
      label: "Required Belt Speed",
      extra: `${ppm.toFixed(1)} parcels/min  ·  ${(ppm * 60).toFixed(0)} parcels/hr`,
    };
  } else {
    const spd = parseFloat(speed); // ft/min
    if (!spd || !sp) return null;
    const ppm = (spd * 12) / sp;
    return {
      value: ppm.toFixed(1),
      unit: "PARCELS/MIN",
      label: "Throughput",
      extra: `${(ppm * 60).toFixed(0)} parcels/hr`,
    };
  }
}
