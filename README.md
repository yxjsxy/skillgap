# SkillGap

SkillGap ranks which repeated successful agent workflows should be promoted into reusable skills next.

A lot of agent teams already have the raw material for better behavior: successful runs, incident notes, deploy logs, CI fixes, and repeated operator playbooks. The hard part is not generating one more transcript summary. The hard part is deciding which workflow has enough repeated evidence that it deserves to become a durable `SKILL.md` right now.

That is the gap SkillGap closes.

## Why this should exist

Projects like Hermes Agent are making autonomous skill creation and memory much more visible. That is great, but it leaves one practical backlog question unresolved for teams sitting on a pile of successful runs:

Which workflow should we promote into a reusable skill first?

Today the usual baseline is still one of these:
- count repeated workflows manually in transcripts or notes
- prioritize whatever somebody remembers was painful last week
- feed an arbitrary transcript into a skill generator without checking if the workflow is mature enough yet

SkillGap gives you a deterministic local answer before you invest time in authoring or generating the skill.

## What it does

- scans a directory of successful run fixtures
- clusters runs by workflow
- measures repeat frequency, artifacts, verification trail, prerequisite breadth, and escalation branches
- ranks which workflows are most ready for promotion into a reusable skill
- compares evidence-weighted ranking against a frequency-only baseline
- runs an ablation to show why verification and artifact weighting matter

## Baseline and positioning

### What it is not
- not a memory system
- not a skill generator
- not a hosted workflow mining platform

### What it complements
- **Hermes Agent**: impressive at persisting memory and creating skills after complex tasks, but it does not tell a team which workflow in a backlog of successful runs is the best next candidate to promote
- **agent-skill-creator** and transcript-to-skill tools: useful when you already know what you want to package, but they assume candidate selection has happened
- **manual transcript review**: still common, but noisy and easy to bias toward recency instead of evidence

SkillGap sits one step earlier in the loop. It tells you where to spend your skill-authoring energy.

## Quick start

```bash
cd ~/Documents/vibe_coding/skillgap
node cli.js inspect fixtures
node cli.js inspect fixtures --json > generated/inspection.json
node cli.js rank fixtures > generated/ranking.md
node cli.js compare fixtures > generated/comparison.md
node cli.js ablate fixtures > generated/ablation.md
```

## Example result

Bundled corpus result:
- 3 workflows in the run corpus
- `support-ticket-triage` ranked first
- `deploy-hotfix` tied on frequency but lost on proof richness
- frequency-only backlog grooming left a top tie unresolved
- evidence-weighted ranking selected the workflow with the strongest validation trail

## How to validate

```bash
bash ~/.openclaw/workspace/scripts/coding_harness.sh gates/skillgap-mvp.sh 3
```

## Experiments and comparison

### Comparison target
SkillGap is explicitly compared against a frequency-only baseline because that is the most common lightweight heuristic teams use when deciding what to codify next.

### Bundled experiment
The bundled corpus contains:
- 2 successful `support-ticket-triage` runs
- 2 successful `deploy-hotfix` runs
- 1 successful `flaky-test-recovery` run

This matters because support and deploy tie on repeat count. A naive frequency-only ranking cannot tell you which one is more ready to become a durable skill.

### Observed results
- frequency-only top tie count: 2
- frequency-only top candidate: `deploy-hotfix` by lexical tiebreak, not evidence
- SkillGap top candidate: `support-ticket-triage`
- top evidence score: 36
- top workflow verify steps: 3
- top workflow artifacts: 2
- top-2 verification-plus-artifact richness: 9 vs 9 in this tiny corpus, but SkillGap still breaks the tie in favor of the workflow with the denser proof trail and broader prerequisites

### Ablation
When artifact and verification weighting are removed, `deploy-hotfix` becomes deceptively competitive. That is exactly the failure mode SkillGap is designed to avoid.

See `docs/experiments.md` for setup, metrics, limits, and interpretation.

## Architecture

- `cli.js` parses successful run fixtures and emits inspection, ranking, comparison, and ablation reports
- `fixtures/` bundles a tiny run corpus across support, deploy, and CI stabilization workflows
- `generated/` stores machine-readable and markdown experiment artifacts
- `docs/experiments.md` records baseline, experiment design, results, and limits
- `gates/skillgap-mvp.sh` is the formal harness gate

## Why open source developers might care

The narrative is simple:
- your best workflows are already hiding in your successful runs
- not every repeated workflow deserves a skill yet
- frequency alone is too weak a heuristic
- you should promote the workflow with the best proof trail first

That story plays well on GitHub, X, and HN because it is specific, easy to demo, and relevant to the current wave of agent tooling.

## Limitations

- current input format is structured JSON fixtures, not raw OpenClaw or Hermes transcripts
- scoring is heuristic, not a learned ranking model
- tiny bundled corpus proves the workflow, not broad external generalization
- next step should be transcript adapters and larger public benchmark corpora

## Roadmap

### P0
- OpenClaw transcript adapter
- Hermes-style transcript adapter
- emit a `promotion-brief.md` for the top workflow

### P1
- score explanation per workflow step cluster
- repo-wide skill coverage heatmap
- export top candidate directly into Run2Skill input format

### P2
- GitHub Action
- hosted dashboard
- skill promotion trend reports over time
