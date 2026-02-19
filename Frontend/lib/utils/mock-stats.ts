/**
 * Deterministic mock stats generator.
 *
 * Uses a simple seeded hash of the entity ID so every render produces the
 * same value for the same entity — avoiding SSR/client hydration mismatches
 * while still looking "random" across different entities.
 */

function seededRand(seed: number, salt: number): number {
  const x = Math.sin(seed * 9301 + salt * 49297 + 233280) * 1e9;
  return x - Math.floor(x); // 0..1
}

/** Progress percentage 0–100 (multiples of 5 for a clean look) */
export function mockProgress(id: number): number {
  return Math.round(seededRand(id, 1) * 20) * 5; // 0, 5, 10, … 100
}

/** Question count between 5 and 60 */
export function mockQuestionCount(id: number): number {
  return Math.floor(seededRand(id, 2) * 56) + 5;
}
