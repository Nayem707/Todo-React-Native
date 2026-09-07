const UNIT_MS = {
  s: 1000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000,
};

export const durationToMs = (input, fallbackMs = 15 * 60 * 1000) => {
  const match = /^(\d+)([smhd])$/.exec(String(input ?? "").trim());
  if (!match) return fallbackMs;
  return Number(match[1]) * UNIT_MS[match[2]];
};
