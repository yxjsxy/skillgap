# Skill Promotion Brief

## Recommended workflow
support-ticket-triage

Evidence score: 36
Run count: 2
Readiness: high

## Why this is ready now
SkillGap ranks support-ticket-triage above deploy-hotfix because it has the strongest combination of repeat frequency, reusable artifacts, verification trail, prerequisite breadth, and escalation evidence.
The top recommendation is not based on recency or lexical order. It is based on proof density that a future agent or teammate can actually reuse.

## Reusable proof trail
- Goals: Resolve a customer login regression and record a durable fix path. | Handle an escalated refund ticket that needs billing evidence and customer notification.
- Artifacts: docs/login-regression.md | reports/refund-7780.md
- Verification: grep -q '401 fixed' docs/login-regression.md | bash ~/.openclaw/workspace/scripts/coding_harness.sh gates/support-ticket-triage.sh 3 | grep -q 'invoice_7780' reports/refund-7780.md
- Commands: ticket.search ACME-4421 | kb.search login regression 401 | crm.search customer=acme | gh.issue.create regression-note | ticket.search ACME-7780 | billing.refund invoice_7780 | chat.post refunds-room | vault.read STRIPE_REFUND_POLICY
- Prerequisites: ticket | customer-context | knowledge-base | issue-write | gate-command | refund-scope | outbound-channel | policy-access
- Escalation branches: money-movement | cross-team-notify

## Why the baseline falls short
A frequency-only backlog groomer sees a tie at 2 runs and cannot justify why support-ticket-triage should be promoted before deploy-hotfix.
SkillGap breaks that tie using validation evidence and artifact richness, which is exactly what matters when turning a workflow into a durable skill.

## Suggested next step
Feed support-ticket-triage into Run2Skill or another transcript-to-skill compiler, then keep deploy-hotfix as the next candidate once its proof trail improves.

