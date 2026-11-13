import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type {
  AnalystDecision,
  ChainVerification,
  DecisionFeedback,
  DecisionRecord,
  EvidenceOpen,
  Severity,
} from '../types';
import { CURRENT_ANALYST, TECHNIQUES, getAnalysis, getIncident } from '../constants';
import { appendRecord, verifyChain } from '../domain/hash';
import { isFastAccept } from '../domain/fastAccept';
import { demoNowIso } from '../domain/clock';
import { buildSeedChain } from '../domain/seed';

export type SubmitDecisionInput = {
  incidentId: string;
  decision: AnalystDecision;
  /** Mandatory (non-empty) for "diverge" and "mark_wrong" */
  justification?: string;
  feedback?: Partial<DecisionFeedback>;
  finalTechniqueId?: string;
  finalSeverity?: Severity;
  analyst?: string;
};

const DECISIONS: readonly AnalystDecision[] = ['accept', 'diverge', 'mark_wrong'];
const SEVERITY_VALUES: readonly Severity[] = ['Critical', 'High', 'Medium', 'Low'];

export class DecisionValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DecisionValidationError';
  }
}

export type DecisionStore = {
  /** false while the seed chain is being hashed (first render only) */
  ready: boolean;
  /** The full trail, oldest first */
  decisions: DecisionRecord[];
  /** Incident ids whose CURRENT (latest) decision was handed off to SOAR/ITSM in this session */
  handedOffIds: string[];
  /** True only if the latest decision of the incident is the one that was sent */
  isHandedOff: (incidentId: string) => boolean;
  /** Id of the decision that was last sent for the incident, if any (may be older than the latest) */
  handedOffDecisionId: (incidentId: string) => string | undefined;
  /** Index tampered by the demo control, null if none */
  tamperedIndex: number | null;

  /** Current time on the domain (demo) clock, ISO 8601. Single time source for the trail and exported events. */
  nowIso: () => string;

  /** Marks the moment the analyst opened the case (starts the decision timer). Idempotent. */
  startReview: (incidentId: string) => void;
  /** Records the first opening of an evidence item. Idempotent per evidence. */
  recordEvidenceOpened: (incidentId: string, evidenceId: string) => void;
  getOpenedEvidence: (incidentId: string) => EvidenceOpen[];
  hasOpenedEvidence: (incidentId: string) => boolean;

  /** Validates, computes fastAccept, chains the hash and appends. Rejects with DecisionValidationError. */
  submitDecision: (input: SubmitDecisionInput) => Promise<DecisionRecord>;
  latestDecisionFor: (incidentId: string) => DecisionRecord | undefined;

  /**
   * Records that the given decision was sent. Returns false (and records nothing) when the incident has no
   * decision or `decisionId` is not its latest one.
   */
  markHandedOff: (incidentId: string, decisionId: string) => boolean;
  /** Recomputes the whole chain */
  verify: () => Promise<ChainVerification>;
  /** Demo control: edits a record without recomputing its hash */
  tamperRecord: (index: number) => void;
  /** Restores the seed trail and clears session state */
  reset: () => Promise<void>;
};

const Ctx = createContext<DecisionStore | null>(null);

export function DecisionStoreProvider({ children }: { children: ReactNode }) {
  const [decisions, setDecisions] = useState<DecisionRecord[]>([]);
  const [ready, setReady] = useState(false);
  const [opens, setOpens] = useState<Record<string, EvidenceOpen[]>>({});
  const [handedOff, setHandedOff] = useState<Record<string, string>>({});
  const [tamperedIndex, setTamperedIndex] = useState<number | null>(null);

  const decisionsRef = useRef<DecisionRecord[]>([]);
  const opensRef = useRef<Record<string, EvidenceOpen[]>>({});
  const startsRef = useRef<Record<string, number>>({});
  const seedRef = useRef<Promise<void> | null>(null);
  const queueRef = useRef<Promise<unknown>>(Promise.resolve());
  const mountedAtRef = useRef(Date.now());

  const setChain = useCallback((next: DecisionRecord[]) => {
    decisionsRef.current = next;
    setDecisions(next);
  }, []);

  const ensureSeeded = useCallback((): Promise<void> => {
    if (!seedRef.current) {
      seedRef.current = buildSeedChain().then((chain) => {
        setChain(chain);
        setReady(true);
      });
    }
    return seedRef.current;
  }, [setChain]);

  useEffect(() => {
    void ensureSeeded();
  }, [ensureSeeded]);

  const enqueue = useCallback(<T,>(job: () => Promise<T>): Promise<T> => {
    const run = queueRef.current.catch(() => undefined).then(job);
    queueRef.current = run;
    return run;
  }, []);

  const nowIso = useCallback(() => demoNowIso(mountedAtRef.current), []);

  const startReview = useCallback((incidentId: string) => {
    if (startsRef.current[incidentId] === undefined) startsRef.current[incidentId] = Date.now();
  }, []);

  const recordEvidenceOpened = useCallback((incidentId: string, evidenceId: string) => {
    const incident = getIncident(incidentId);
    if (!incident || !incident.evidence.some((e) => e.id === evidenceId)) return;
    if (startsRef.current[incidentId] === undefined) startsRef.current[incidentId] = Date.now();
    const current = opensRef.current[incidentId] ?? [];
    if (current.some((o) => o.evidenceId === evidenceId)) return;
    const next = {
      ...opensRef.current,
      [incidentId]: [...current, { evidenceId, openedAt: demoNowIso(mountedAtRef.current) }],
    };
    opensRef.current = next;
    setOpens(next);
  }, []);

  const getOpenedEvidence = useCallback((incidentId: string) => opens[incidentId] ?? [], [opens]);
  const hasOpenedEvidence = useCallback((incidentId: string) => (opens[incidentId]?.length ?? 0) > 0, [opens]);

  const submitDecision = useCallback(
    (input: SubmitDecisionInput) =>
      enqueue(async () => {
        await ensureSeeded();
        const incident = getIncident(input.incidentId);
        const analysis = getAnalysis(input.incidentId);
        if (!incident || !analysis) throw new DecisionValidationError(`Unknown incident ${input.incidentId}`);
        if (!DECISIONS.includes(input.decision)) {
          throw new DecisionValidationError(`Invalid decision "${String(input.decision)}".`);
        }
        if (input.finalTechniqueId !== undefined && !Object.prototype.hasOwnProperty.call(TECHNIQUES, input.finalTechniqueId)) {
          throw new DecisionValidationError(`Unknown technique "${input.finalTechniqueId}".`);
        }
        if (input.finalSeverity !== undefined && !SEVERITY_VALUES.includes(input.finalSeverity)) {
          throw new DecisionValidationError(`Invalid severity "${String(input.finalSeverity)}".`);
        }
        if (input.decision === 'diverge') {
          const techniqueChanged =
            input.finalTechniqueId !== undefined && input.finalTechniqueId !== (analysis.techniquesTop3[0]?.technique.id ?? '');
          const severityChanged = input.finalSeverity !== undefined && input.finalSeverity !== incident.severity;
          if (!techniqueChanged && !severityChanged) {
            throw new DecisionValidationError('To diverge, change the final technique or the final severity.');
          }
        }
        const justification = input.justification?.trim();
        if (input.decision !== 'accept' && !justification) {
          throw new DecisionValidationError('Justification is required to diverge or mark the analysis as wrong.');
        }
        const opened = opensRef.current[input.incidentId] ?? [];
        const startedAt = startsRef.current[input.incidentId];
        if (startedAt === undefined) {
          // Without a recorded start the decision time (and fastAccept) would be meaningless.
          throw new DecisionValidationError('Open the case before deciding.');
        }
        const timeToDecisionMs = Math.max(0, Date.now() - startedAt);
        const fastAccept = input.decision === 'accept' && isFastAccept(opened, timeToDecisionMs);
        const rec = await appendRecord(decisionsRef.current, {
          tenantId: incident.tenantId,
          incidentId: incident.id,
          incidentTitle: incident.title,
          analyst: input.analyst ?? CURRENT_ANALYST,
          detectedAt: incident.timestamp,
          decidedAt: demoNowIso(mountedAtRef.current),
          recommendation: {
            topTechniqueId: analysis.techniquesTop3[0]?.technique.id ?? '',
            severity: incident.severity,
            score: analysis.score,
            band: analysis.band,
            suggestedAction: analysis.recommendedAction,
          },
          analystDecision: input.decision,
          finalTechniqueId: input.finalTechniqueId,
          finalSeverity: input.finalSeverity,
          justification,
          feedback: {
            techniqueCorrect: input.feedback?.techniqueCorrect ?? null,
            severityCorrect: input.feedback?.severityCorrect ?? null,
          },
          evidenceOpened: opened,
          timeToDecisionMs,
          fastAccept,
          versions: { scoreModel: analysis.scoreModelVersion, prompt: analysis.promptVersion },
          degraded: analysis.degraded,
        });
        setChain([...decisionsRef.current, rec]);
        // A new review of the same case starts from scratch.
        delete startsRef.current[input.incidentId];
        const nextOpens = { ...opensRef.current };
        delete nextOpens[input.incidentId];
        opensRef.current = nextOpens;
        setOpens(nextOpens);
        return rec;
      }),
    [enqueue, ensureSeeded, setChain],
  );

  const latestDecisionFor = useCallback(
    (incidentId: string) => [...decisions].reverse().find((d) => d.incidentId === incidentId),
    [decisions],
  );

  const markHandedOff = useCallback((incidentId: string, decisionId: string) => {
    const latest = [...decisionsRef.current].reverse().find((d) => d.incidentId === incidentId);
    if (!latest || latest.id !== decisionId) return false;
    setHandedOff((prev) => ({ ...prev, [incidentId]: decisionId }));
    return true;
  }, []);

  const handedOffDecisionId = useCallback((incidentId: string) => handedOff[incidentId], [handedOff]);

  const isHandedOff = useCallback(
    (incidentId: string) => {
      const sent = handedOff[incidentId];
      return sent !== undefined && latestDecisionFor(incidentId)?.id === sent;
    },
    [handedOff, latestDecisionFor],
  );

  const handedOffIds = useMemo(
    () => Object.keys(handedOff).filter((id) => isHandedOff(id)),
    [handedOff, isHandedOff],
  );

  const verify = useCallback(() => verifyChain(decisionsRef.current), []);

  const tamperRecord = useCallback(
    (index: number) => {
      const chain = decisionsRef.current;
      const target = chain[index];
      if (!target) return;
      const edited: DecisionRecord = {
        ...target,
        fastAccept: !target.fastAccept,
        justification: `${target.justification ?? ''} [edited after the fact]`.trim(),
      };
      setChain(chain.map((r, i) => (i === index ? edited : r)));
      setTamperedIndex(index);
    },
    [setChain],
  );

  const reset = useCallback(
    () =>
      enqueue(async () => {
        seedRef.current = null;
        decisionsRef.current = [];
        opensRef.current = {};
        startsRef.current = {};
        setOpens({});
        setHandedOff({});
        setTamperedIndex(null);
        setReady(false);
        await ensureSeeded();
      }),
    [enqueue, ensureSeeded],
  );

  const value = useMemo<DecisionStore>(
    () => ({
      ready,
      decisions,
      handedOffIds,
      isHandedOff,
      handedOffDecisionId,
      tamperedIndex,
      nowIso,
      startReview,
      recordEvidenceOpened,
      getOpenedEvidence,
      hasOpenedEvidence,
      submitDecision,
      latestDecisionFor,
      markHandedOff,
      verify,
      tamperRecord,
      reset,
    }),
    [ready, decisions, handedOffIds, isHandedOff, handedOffDecisionId, tamperedIndex, nowIso, startReview, recordEvidenceOpened, getOpenedEvidence, hasOpenedEvidence, submitDecision, latestDecisionFor, markHandedOff, verify, tamperRecord, reset],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useDecisionStore(): DecisionStore {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useDecisionStore must be used inside <DecisionStoreProvider>');
  return ctx;
}
