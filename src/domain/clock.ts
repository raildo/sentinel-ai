/** Demo clock anchored near the mock incidents so MTTR stays coherent. */
export const DEMO_BASE_TIME = '2026-04-17T12:30:00Z';

export function demoNowIso(startedAtRealMs: number, nowRealMs: number = Date.now()): string {
  return new Date(Date.parse(DEMO_BASE_TIME) + Math.max(0, nowRealMs - startedAtRealMs)).toISOString();
}
