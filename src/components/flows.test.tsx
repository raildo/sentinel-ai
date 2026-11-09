import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DecisionStoreProvider, useDecisionStore } from '../state/DecisionStore';
import { MOCK_ANALYSES, MOCK_INCIDENTS, SCENARIO_IDS, getAnalysis, getIncident } from '../constants';
import { DEMO_BASE_TIME } from '../domain/clock';
import { sortQueue } from '../domain/queue';
import { TriageInbox } from './TriageInbox';
import { IncidentDetail } from './IncidentDetail';
import { AuditTrail } from './AuditTrail';
import { Handoff } from './Handoff';

const NEW_CASE = 'INC-2026-0417-01'; // score 88, no seed decision
const LOW_SCORE_CASE = 'INC-2026-0417-02'; // score 72

function Harness() {
  return (
    <DecisionStoreProvider>
      <IncidentDetail incidentId={NEW_CASE} onBack={() => undefined} />
      <AuditTrail />
    </DecisionStoreProvider>
  );
}

async function findTrailRow(id: string): Promise<HTMLElement> {
  const cell = await screen.findByText(id, { selector: 'td span' });
  return cell.closest('tr') as HTMLElement;
}

async function submitReady(
  user: ReturnType<typeof userEvent.setup>,
  choice: string | null = 'Accept recommendation',
) {
  if (choice) await user.click(screen.getByRole('button', { name: choice }));
  const submit = screen.getByRole('button', { name: 'Submit decision' });
  await waitFor(() => expect(submit).toBeEnabled());
  await user.click(submit);
}

describe('decision flow', () => {
  it('opens evidence, accepts, and shows the record in the audit trail', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole('button', { name: /Open evidence ev-1/ }));
    expect(screen.getByText(/1\/3 opened/)).toBeInTheDocument();
    await submitReady(user);

    expect(await screen.findByText('Recommendation accepted')).toBeInTheDocument();
    const row = await findTrailRow('DEC-0005');
    expect(within(row).getByText(/Score 88/)).toBeInTheDocument();
    expect(within(row).getByText('Accepted')).toBeInTheDocument();
    expect(within(row).getByText(/1 evidence opened/)).toBeInTheDocument();
    expect(within(row).queryByText('fast accept')).not.toBeInTheDocument();
  });

  it('marks a quick accept without evidence as fast accept', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await submitReady(user);
    expect(await screen.findByText(/Flagged as fast accept/)).toBeInTheDocument();
    const row = await findTrailRow('DEC-0005');
    expect(within(row).getByText('fast accept')).toBeInTheDocument();
  });

  it('requires a justification to diverge', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole('button', { name: 'Diverge' }));
    // Nothing changed yet: diverging is not possible.
    expect(screen.getByRole('button', { name: 'Submit decision' })).toBeDisabled();
    const current = getIncident(NEW_CASE)!.severity;
    await user.selectOptions(screen.getByLabelText('Final severity'), current === 'Low' ? 'Medium' : 'Low');
    await submitReady(user, null);
    expect(await screen.findByRole('alert')).toHaveTextContent(/Justification is required/);
    expect(screen.queryByText('Divergence recorded')).not.toBeInTheDocument();

    await user.type(screen.getByLabelText(/Justification/), 'Lateral movement, not execution');
    await user.click(screen.getByRole('button', { name: 'Submit decision' }));
    expect(await screen.findByText('Divergence recorded')).toBeInTheDocument();
  });
});

describe('decision panel', () => {
  it('keeps Submit disabled until the analyst picks an action', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const submit = screen.getByRole('button', { name: 'Submit decision' });
    expect(screen.getByRole('button', { name: 'Accept recommendation' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: 'Diverge' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: 'Mark analysis as wrong' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByText('Choose an action to enable Submit decision.')).toBeInTheDocument();
    await waitFor(() => expect(submit).toBeDisabled());
    await user.click(screen.getByRole('button', { name: 'Accept recommendation' }));
    await waitFor(() => expect(submit).toBeEnabled());
    expect(screen.queryByText('Choose an action to enable Submit decision.')).not.toBeInTheDocument();
  });

  it('keeps the evidence counter and the revealed score on screen after the decision', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const score = getAnalysis(NEW_CASE)!.score;
    await user.click(screen.getByRole('button', { name: /Open evidence ev-1/ }));
    await user.click(screen.getByRole('button', { name: /Open evidence ev-2/ }));
    expect(screen.getByText(/2\/3 opened/)).toBeInTheDocument();
    await submitReady(user);
    expect(await screen.findByText('Recommendation accepted')).toBeInTheDocument();
    expect(screen.getByText(/2\/3 opened/)).toBeInTheDocument();
    expect(screen.queryByText('Open an evidence item to reveal the score')).not.toBeInTheDocument();
    expect(screen.getAllByText(`${score}%`)[0].closest('[aria-hidden="true"]')).toBeNull();
  });
});

describe('handoff without a selected incident', () => {
  it('shows the empty state with a way back to the triage inbox', async () => {
    const user = userEvent.setup();
    const goToTriage = vi.fn();
    render(
      <DecisionStoreProvider>
        <Handoff incidentId={null} onGoToTriage={goToTriage} />
      </DecisionStoreProvider>,
    );
    expect(screen.getByRole('heading', { name: 'No incident selected' })).toBeInTheDocument();
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Go to Triage Inbox' }));
    expect(goToTriage).toHaveBeenCalledOnce();
  });
});

describe('cloud event clock', () => {
  it('stamps the event with the domain demo clock, not the real clock', async () => {
    render(
      <DecisionStoreProvider>
        <Handoff incidentId={NEW_CASE} />
      </DecisionStoreProvider>,
    );
    const payload = await screen.findByRole('region', { name: 'CloudEvents payload' });
    const time = /"time": "([^"]+)"/.exec(payload.textContent ?? '')?.[1];
    expect(time).toBeDefined();
    const delta = Date.parse(time!) - Date.parse(DEMO_BASE_TIME);
    expect(delta).toBeGreaterThanOrEqual(0);
    expect(delta).toBeLessThan(60_000);
    expect(Math.abs(Date.now() - Date.parse(time!))).toBeGreaterThan(60_000);
  });
});

describe('automation preview', () => {
  it('refuses when the score is below 85', async () => {
    const user = userEvent.setup();
    render(
      <DecisionStoreProvider>
        <Handoff incidentId={LOW_SCORE_CASE} />
      </DecisionStoreProvider>,
    );
    await user.click(screen.getByRole('tab', { name: /Preview/ }));
    await user.click(screen.getByRole('button', { name: 'Simulate Isolate host from network' }));
    expect(await screen.findByRole('status')).toHaveTextContent(/Refused.*below the 85/);
  });

  it('refuses a high score without an approval', async () => {
    const user = userEvent.setup();
    render(
      <DecisionStoreProvider>
        <Handoff incidentId={NEW_CASE} />
      </DecisionStoreProvider>,
    );
    await user.click(screen.getByRole('tab', { name: /Preview/ }));
    await user.click(screen.getByRole('button', { name: 'Simulate Isolate host from network' }));
    expect(await screen.findByRole('status')).toHaveTextContent(/no analyst approval/);
  });

  it('allows a high score once the case has an accepted decision', async () => {
    const user = userEvent.setup();
    render(
      <DecisionStoreProvider>
        <IncidentDetail incidentId={NEW_CASE} onBack={() => undefined} />
        <Handoff incidentId={NEW_CASE} />
      </DecisionStoreProvider>,
    );
    await submitReady(user);
    await screen.findByText('Recommendation accepted');
    await user.click(screen.getByRole('tab', { name: /Preview/ }));
    await user.click(screen.getByRole('button', { name: 'Simulate Isolate host from network' }));
    expect(await screen.findByText(/Allowed \(simulation only\)/)).toBeInTheDocument();
  });
});

describe('audit integrity UI', () => {
  it('verifies a clean chain and flags a tampered record', async () => {
    const user = userEvent.setup();
    render(
      <DecisionStoreProvider>
        <AuditTrail />
      </DecisionStoreProvider>,
    );
    const verify = screen.getByRole('button', { name: /Verify chain/ });
    await waitFor(() => expect(verify).toBeEnabled());
    await user.click(verify);
    expect(await screen.findByRole('status')).toHaveTextContent(/Chain valid/);

    await user.click(screen.getByRole('button', { name: /Tamper record/ }));
    await user.click(screen.getByRole('button', { name: /Verify chain/ }));
    expect(await screen.findByRole('status')).toHaveTextContent(/Chain broken at record index 2/);
    expect(screen.getByText('tampered')).toBeInTheDocument();
  });
});

function Controls({ incidentId }: { incidentId: string }) {
  const store = useDecisionStore();
  return (
    <button
      type="button"
      onClick={() => {
        store.startReview(incidentId);
        void store.submitDecision({ incidentId, decision: 'accept' });
      }}
    >
      Record accept
    </button>
  );
}

describe('handoff', () => {
  it('re-enables sending and warns when a new decision is recorded after a handoff', async () => {
    const user = userEvent.setup();
    render(
      <DecisionStoreProvider>
        <Controls incidentId={NEW_CASE} />
        <Handoff incidentId={NEW_CASE} />
      </DecisionStoreProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'Record accept' }));
    const send = screen.getByRole('button', { name: 'Send case to SOAR and ITSM' });
    await waitFor(() => expect(send).toBeEnabled());
    await user.click(send);
    expect(await screen.findByText('Handed off')).toBeInTheDocument();
    expect(send).toBeDisabled();
    expect(screen.queryByText(/newer decision/)).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Record accept' }));
    expect(await screen.findByText(/newer decision/)).toBeInTheDocument();
    expect(screen.getByText('Not sent')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole('button', { name: 'Send case to SOAR and ITSM' })).toBeEnabled());
  });
});

describe('triage inbox search and filter', () => {
  const renderInbox = () =>
    render(
      <DecisionStoreProvider>
        <TriageInbox onSelectIncident={() => undefined} />
      </DecisionStoreProvider>,
    );

  it('searches by host, and shows an empty state with no match', async () => {
    const user = userEvent.setup();
    renderInbox();
    const kevHost = getIncident(SCENARIO_IDS.KEV)!.host;
    await user.type(screen.getByLabelText('Search incidents'), kevHost);
    expect(screen.getByText(SCENARIO_IDS.KEV)).toBeInTheDocument();
    expect(screen.queryByText(NEW_CASE)).not.toBeInTheDocument();

    await user.clear(screen.getByLabelText('Search incidents'));
    await user.type(screen.getByLabelText('Search incidents'), 'no-such-thing-xyz');
    expect(screen.getByText(/No incidents match/)).toBeInTheDocument();
  });

  it('filters by severity', async () => {
    const user = userEvent.setup();
    renderInbox();
    const critical = MOCK_INCIDENTS.filter((i) => i.severity === 'Critical');
    const others = MOCK_INCIDENTS.filter((i) => i.severity !== 'Critical');
    expect(critical.length).toBeGreaterThan(0);
    expect(others.length).toBeGreaterThan(0);
    await user.click(screen.getByRole('button', { name: 'Filter by severity' }));
    await user.click(screen.getByRole('button', { name: 'Critical' }));
    for (const i of critical) expect(screen.getByText(i.id)).toBeInTheDocument();
    for (const i of others) expect(screen.queryByText(i.id)).not.toBeInTheDocument();
  });
});

describe('P1.4 scenarios', () => {
  const renderDetail = (id: string) =>
    render(
      <DecisionStoreProvider>
        <IncidentDetail incidentId={id} onBack={() => undefined} />
      </DecisionStoreProvider>,
    );

  it('prompt injection: claim discarded and score unchanged', () => {
    const analysis = getAnalysis(SCENARIO_IDS.PROMPT_INJECTION)!;
    expect(analysis.validation.injectionSuspected).toBe(true);
    expect(analysis.claims.some((c) => c.discarded)).toBe(true);
    expect(analysis.validation.scoreBefore).toBe(analysis.validation.scoreAfter);
    expect(analysis.validation.scoreAfter).toBe(analysis.score);

    renderDetail(SCENARIO_IDS.PROMPT_INJECTION);
    const alert = screen.getByText(/Possible prompt injection/);
    expect(alert).toHaveTextContent(`${analysis.validation.discardedClaims} claim(s)`);
  });

  it('prompt injection: does not leak the score in the alert before the score is revealed', async () => {
    const user = userEvent.setup();
    const analysis = getAnalysis(SCENARIO_IDS.PROMPT_INJECTION)!;
    renderDetail(SCENARIO_IDS.PROMPT_INJECTION);
    const alert = screen.getByText(/Possible prompt injection/);
    expect(alert).toHaveTextContent('Score unchanged by the discarded claim. Open an evidence item to see it.');
    expect(alert).not.toHaveTextContent(`${analysis.validation.scoreBefore}%`);
    expect(alert).not.toHaveTextContent(`${analysis.validation.scoreAfter}%`);

    const incident = getIncident(SCENARIO_IDS.PROMPT_INJECTION)!;
    await user.click(screen.getByRole('button', { name: new RegExp(`Open evidence ${incident.evidence[0].id}`) }));
    expect(screen.getByText(/Possible prompt injection/)).toHaveTextContent(
      `Score unchanged at ${analysis.validation.scoreBefore}% (before) and ${analysis.validation.scoreAfter}% (after)`,
    );
  });

  it('degraded mode: the alert shows in the case view', () => {
    const analysis = getAnalysis(SCENARIO_IDS.DEGRADED)!;
    expect(analysis.degraded).toBe(true);
    renderDetail(SCENARIO_IDS.DEGRADED);
    expect(screen.getByText('Degraded mode.')).toBeInTheDocument();
    expect(screen.getByText(/No LLM call was made/)).toBeInTheDocument();
  });

  it('KEV: rises to the top of the queue and the case renders', () => {
    expect(sortQueue(MOCK_INCIDENTS, MOCK_ANALYSES)[0].id).toBe(SCENARIO_IDS.KEV);
    const { unmount } = render(
      <DecisionStoreProvider>
        <TriageInbox onSelectIncident={() => undefined} />
      </DecisionStoreProvider>,
    );
    const firstRow = screen.getAllByRole('row')[1];
    expect(within(firstRow).getByText(SCENARIO_IDS.KEV)).toBeInTheDocument();
    expect(within(firstRow).getByText('KEV')).toBeInTheDocument();
    unmount();

    renderDetail(SCENARIO_IDS.KEV);
    expect(screen.getByText(getIncident(SCENARIO_IDS.KEV)!.title)).toBeInTheDocument();
  });
});

describe('score reveal', () => {
  it('keeps the score hidden from assistive tech until an evidence item is opened', async () => {
    const user = userEvent.setup();
    render(
      <DecisionStoreProvider>
        <IncidentDetail incidentId={NEW_CASE} onBack={() => undefined} />
      </DecisionStoreProvider>,
    );
    const score = getAnalysis(NEW_CASE)!.score;
    expect(screen.getByText('Open an evidence item to reveal the score')).toBeInTheDocument();
    expect(screen.getByText(`${score}%`).closest('[aria-hidden="true"]')).not.toBeNull();

    await user.click(screen.getByRole('button', { name: /Open evidence ev-1/ }));
    expect(screen.queryByText('Open an evidence item to reveal the score')).not.toBeInTheDocument();
    expect(screen.getByText(`${score}%`).closest('[aria-hidden="true"]')).toBeNull();
  });
});

describe('LLM payload panel', () => {
  it('shows the token to real value table only while real values are shown', async () => {
    const user = userEvent.setup();
    render(
      <DecisionStoreProvider>
        <IncidentDetail incidentId={NEW_CASE} onBack={() => undefined} />
      </DecisionStoreProvider>,
    );
    const host = getIncident(NEW_CASE)!.host;
    const payload = () => screen.getByRole('region', { name: 'LLM payload' });

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(payload()).not.toHaveTextContent(host);

    await user.click(screen.getByRole('button', { name: 'Show real values' }));
    expect(within(screen.getByRole('table')).getByText(host)).toBeInTheDocument();
    expect(payload()).toHaveTextContent(host);

    await user.click(screen.getByRole('button', { name: 'Show tokens' }));
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(payload()).not.toHaveTextContent(host);
  });
});
