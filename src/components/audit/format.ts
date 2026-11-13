export const shortHash = (h: string): string => (h.length > 14 ? `${h.slice(0, 8)}...${h.slice(-4)}` : h);

export const pct = (v: number | null, digits = 1): string => (v === null ? 'n/a' : `${(v * 100).toFixed(digits)}%`);

export const formatTime = (iso: string): string => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString();
};

export const DECISION_LABEL: Record<string, string> = {
  accept: 'Accepted',
  diverge: 'Diverged',
  mark_wrong: 'Marked wrong',
};
