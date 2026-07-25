import { hashSeed, sampleTriangular } from "../lib/random";

// Pure math for the Static Gapping calculator's single-value result.
export function calcGapResult({ parcelLength, inputSpeed, gapperSpeeds }) {
  const Lp = parseFloat(parcelLength);
  const s0 = parseFloat(inputSpeed);
  const speeds = gapperSpeeds.map((s) => parseFloat(s));
  if (isNaN(Lp) || isNaN(s0) || speeds.some((s) => isNaN(s)) || speeds.length === 0) return null;

  const sequence = [s0, ...speeds];
  let valid = true;
  for (let i = 1; i < sequence.length; i++) {
    if (sequence[i] < sequence[i - 1]) valid = false;
  }

  const stepGaps = speeds.map((sN) => (Lp * (sN / s0 - 1)).toFixed(1));
  const gap = stepGaps[stepGaps.length - 1];

  return { gap, valid, stepGaps };
}

const SAMPLE_COUNT = 10000;
const BIN_COUNT = 18;

// Monte Carlo gap distribution: samples parcel length from a triangular
// distribution and propagates it through the same ratio as calcGapResult.
// Deterministic — seeded from the inputs, so identical inputs always
// produce identical output (see hashSeed).
export function calcMonteCarloGap({ minParcelLength, parcelLength, maxParcelLength, inputSpeed, gapperSpeeds }) {
  const a = parseFloat(minParcelLength);
  const c = parseFloat(parcelLength);
  const b = parseFloat(maxParcelLength);
  const s0 = parseFloat(inputSpeed);
  const sN = parseFloat(gapperSpeeds[gapperSpeeds.length - 1]);
  if ([a, c, b, s0, sN].some((n) => isNaN(n)) || b < a || c < a || c > b || s0 <= 0) return null;

  const ratio = sN / s0 - 1;

  const rng = hashSeed(`${a}|${c}|${b}|${s0}|${sN}`);
  const gaps = new Array(SAMPLE_COUNT);
  let sum = 0;
  for (let i = 0; i < SAMPLE_COUNT; i++) {
    const Lp = sampleTriangular(rng, a, c, b);
    const g = Lp * ratio;
    gaps[i] = g;
    sum += g;
  }
  gaps.sort((x, y) => x - y);

  const mean = sum / SAMPLE_COUNT;
  const variance = gaps.reduce((acc, g) => acc + (g - mean) ** 2, 0) / SAMPLE_COUNT;
  const stdDev = Math.sqrt(variance);
  const min = gaps[0];
  const max = gaps[SAMPLE_COUNT - 1];
  const p5 = gaps[Math.floor(SAMPLE_COUNT * 0.05)];

  const binWidth = (max - min) / BIN_COUNT || 1;
  const bins = Array.from({ length: BIN_COUNT + 1 }, (_, i) => min + i * binWidth);
  const counts = new Array(BIN_COUNT).fill(0);
  gaps.forEach((g) => {
    let idx = Math.floor((g - min) / binWidth);
    if (idx >= BIN_COUNT) idx = BIN_COUNT - 1;
    if (idx < 0) idx = 0;
    counts[idx]++;
  });

  return { bins, counts, mean, stdDev, min, max, p5, sampleCount: SAMPLE_COUNT };
}
