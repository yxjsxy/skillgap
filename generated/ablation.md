# SkillGap Ablation

## Full score
- top workflow: support-ticket-triage
- score formula: runs*3 + commands + artifacts*2 + verify*2 + prerequisites + escalation*2

## Without artifact and verify weighting
- top workflow: support-ticket-triage
- score formula: runs*3 + commands + prerequisites

## Interpretation
- removing artifact and verification weighting makes deploy-hotfix look deceptively comparable, even though support-ticket-triage is easier to validate and promote into a durable skill
