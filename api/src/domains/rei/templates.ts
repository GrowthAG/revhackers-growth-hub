// Email templates extracted from hormozi-gtm plugin's template-client-onboarding skill.
// Reproducing the exact copy structure for RevHackers onboarding cadence.

export interface WelcomeEmailContext {
  clientName: string;
  productName: string;
  csLeadName: string;
  kickoffLink: string;
  milestone1Window: string; // e.g. "within 3 days"
  quickWinPreview: string;
  midPointDay: number;
  wrapUpDay: number;
}

export function buildWelcomeEmail(ctx: WelcomeEmailContext): {
  subject: string;
  body: string;
} {
  return {
    subject: `Welcome — your next ${ctx.midPointDay * 3} days with ${ctx.productName}`,
    body: `${ctx.clientName},

Decision made. The next few weeks decide whether it was the right one.
Here's what happens from now on:

1. Kickoff call ${ctx.milestone1Window}
2. Quick win visible by day 7 — ${ctx.quickWinPreview}
3. Mid-point review on day ${ctx.midPointDay}
4. Wrap-up on day ${ctx.wrapUpDay} with NPS

Next action: ${ctx.kickoffLink} — pick a time in the next 3 days.

Any questions, reply to this email. Response within 4 business hours.

${ctx.csLeadName}`,
  };
}

export interface KickoffDocContext {
  clientName: string;
  productName: string;
  goalSentence: string;
  durationDays: number;
  csLeadName: string;
}

export function buildKickoffDoc(ctx: KickoffDocContext): string {
  return `# Kickoff Plan — ${ctx.productName}

**Client:** ${ctx.clientName}
**Duration:** ${ctx.durationDays} days
**Goal:** ${ctx.goalSentence}
**Owner:** ${ctx.csLeadName}

## Milestones

| Day | Milestone | Deliverable |
|---|---|---|
| 0 | Welcome | Email triggered |
| 1-3 | Kickoff call | This doc + aligned plan |
| 7 | Quick Win | Personalized dashboard + Loom |
| 14 | NPS check-in | Survey |
| 21 | Mid-point review | 30-min call |
| 30 | Wrap-up + NPS | Formal report + transition |

## Responsibilities

- **CS Lead:** Cadence, triggers, escalations.
- **Client:** Inputs on time, attendance at milestones.

## Next Step

Schedule Milestone 4 (mid-point review) on day 21.
`;
}

export interface WrapUpEmailContext {
  clientName: string;
  productName: string;
  milestone1Result: string;
  quickWinResult: string;
  metricResult: string;
  nextPhaseAligned: string;
  csLeadName: string;
  npsLink: string;
}

export function buildWrapUpEmail(ctx: WrapUpEmailContext): {
  subject: string;
  body: string;
} {
  return {
    subject: `30 days — where we are and what's next`,
    body: `${ctx.clientName},

30 days ago you started with us. Here's what happened:

✅ Kickoff: ${ctx.milestone1Result}
✅ Quick Win: ${ctx.quickWinResult}
✅ Metric progress: ${ctx.metricResult}
✅ Next phase: ${ctx.nextPhaseAligned}

Quick NPS: ${ctx.npsLink}

Next phase (days 31-90):
- Continued cadence
- Expansion conversation
- Next big milestone

${ctx.csLeadName} stays your main point of contact.`,
  };
}