/**
 * Helper to dynamically calculate current quarter string (e.g. "Q3 2026")
 */
export function getCurrentQuarterString(): string {
  const now = new Date();
  const month = now.getMonth(); // 0-indexed: 0-2 = Q1, 3-5 = Q2, 6-8 = Q3, 9-11 = Q4
  const quarter = Math.floor(month / 3) + 1;
  const year = now.getFullYear();
  return `Q${quarter} ${year}`;
}
