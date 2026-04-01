export interface PercentilesResult {
  p25: number;
  p50: number;
  p75: number;
  p90: number;
}

function sanitize(values: number[]): number[] {
  return values.filter((v) => Number.isFinite(v)).sort((a, b) => a - b);
}

export function mean(values: number[]): number {
  const arr = sanitize(values);
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

export function median(values: number[]): number {
  const arr = sanitize(values);
  if (!arr.length) return 0;
  const m = Math.floor(arr.length / 2);
  return arr.length % 2 === 0 ? (arr[m - 1] + arr[m]) / 2 : arr[m];
}

export function mode(values: number[]): number {
  const arr = sanitize(values);
  if (!arr.length) return 0;
  const counts = new Map<number, number>();
  arr.forEach((v) => counts.set(v, (counts.get(v) || 0) + 1));
  let topVal = arr[0];
  let topCnt = 0;
  counts.forEach((cnt, val) => {
    if (cnt > topCnt) {
      topCnt = cnt;
      topVal = val;
    }
  });
  return topVal;
}

export function percentile(values: number[], p: number): number {
  const arr = sanitize(values);
  if (!arr.length) return 0;
  const rank = (p / 100) * (arr.length - 1);
  const lo = Math.floor(rank);
  const hi = Math.ceil(rank);
  if (lo === hi) return arr[lo];
  const weight = rank - lo;
  return arr[lo] * (1 - weight) + arr[hi] * weight;
}

export function percentiles(values: number[]): PercentilesResult {
  return {
    p25: percentile(values, 25),
    p50: percentile(values, 50),
    p75: percentile(values, 75),
    p90: percentile(values, 90),
  };
}

export function daysBetween(start?: string | null, end?: string | null): number | null {
  if (!start || !end) return null;
  const s = new Date(start);
  const e = new Date(end);
  if (!Number.isFinite(s.getTime()) || !Number.isFinite(e.getTime())) return null;
  return (e.getTime() - s.getTime()) / 86400000;
}
