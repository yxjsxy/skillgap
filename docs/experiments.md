# SkillGap Experiments

## Question

If a team has multiple successful agent workflows, is frequency alone enough to decide what should become a reusable skill next, or does an evidence-weighted ranking produce a better promotion candidate?

## Baseline and adjacent approaches

Most teams still use one of three lightweight approaches:
1. count repeated workflows manually
2. prioritize the workflow people remember most vividly
3. jump straight into a transcript-to-skill generator without candidate selection

Adjacent systems cover nearby needs:
- Hermes Agent persists memory and can create skills after complex tasks
- agent-skill-creator and similar tools help package a known workflow into a reusable skill
- manual review can work, but gets noisy as successful runs pile up

SkillGap focuses on the missing backlog-grooming step: rank which workflow is most ready for promotion.

## Experiment setup

### Corpus
The bundled corpus includes 5 successful runs:
- `support-ticket-triage`: 2 runs
- `deploy-hotfix`: 2 runs
- `flaky-test-recovery`: 1 run

### Metrics
- run count per workflow
- unique command count
- artifact count
- verification step count
- prerequisite breadth
- escalation branch count
- evidence score

### Scoring
Full evidence score:
- `runs*3 + commands + artifacts*2 + verify*2 + prerequisites + escalation*2`

Frequency-only baseline:
- `runs`

Ablated score:
- `runs*3 + commands + prerequisites`

## Comparison experiment

Commands:

```bash
node cli.js inspect fixtures --json > generated/inspection.json
node cli.js rank fixtures > generated/ranking.md
node cli.js compare fixtures > generated/comparison.md
```

Observed result:
- workflow count: 3
- frequency-only top tie count: 2
- frequency-only lexical winner: `deploy-hotfix`
- SkillGap top workflow: `support-ticket-triage`
- top evidence score: 36
- top workflow verify steps: 3
- top workflow artifacts: 2

Interpretation:
- frequency alone cannot choose between deploy and support because both repeat twice
- the support workflow carries a richer proof trail, broader prerequisites, and a stronger escalation branch, which makes it the better next skill candidate
- this is the difference between “often repeated” and “ready to codify”

## Ablation

Command:

```bash
node cli.js ablate fixtures > generated/ablation.md
```

Observed result:
- full-score top workflow: `support-ticket-triage`
- ablated top workflow: `support-ticket-triage`
- however, the gap narrows when artifact and verification weighting are removed

Interpretation:
- even in this tiny corpus, validation evidence is doing meaningful work
- without that weighting, deploy and support look much closer than they should
- artifact and verify signals are worth preserving if the goal is skill promotion rather than rough workflow counting

## Takeaways

1. repeated success is necessary but not sufficient for promotion into a skill
2. proof trail matters, especially verification and reusable artifacts
3. candidate selection should happen before transcript-to-skill generation
4. SkillGap pairs naturally with tools like Run2Skill instead of replacing them

## Limits

- fixtures are synthetic but realistic, not mined from raw public transcripts
- scores are heuristic and hand-designed
- corpus is small, so results show decision quality patterns rather than broad statistical significance
- next step should be transcript adapters and a larger public corpus with human preference labels
