// Small deterministic PRNG (mulberry32) so Monte Carlo results are
// reproducible for a given set of inputs rather than jittering on every
// re-render. Seeded from a hash of the inputs that feed the simulation.
export function hashSeed(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

// Samples from a triangular distribution with min a, mode c, max b, using
// the given [0,1) random generator via inverse-CDF sampling.
export function sampleTriangular(rng, a, c, b) {
  if (b <= a) return a;
  const u = rng();
  const fc = (c - a) / (b - a);
  if (u < fc) return a + Math.sqrt(u * (b - a) * (c - a));
  return b - Math.sqrt((1 - u) * (b - a) * (b - c));
}
