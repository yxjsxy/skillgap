# SkillGap

Find which repeated agent workflow has the strongest evidence for becoming a reusable skill. SkillGap ranks structured successful-run records and produces a promotion brief; it does not generate or install skills.

## What it does

- scans a directory of successful run fixtures
- clusters runs by workflow
- measures repeat frequency, artifacts, verification trail, prerequisite breadth, and escalation branches
- ranks which workflows are most ready for promotion into a reusable skill
- emits a promotion brief for the top workflow so the next packaging step is obvious
- compares evidence-weighted ranking against a frequency-only baseline
- runs an ablation to show why verification and artifact weighting matter

## Requirements

Node.js 18 or newer and Git. These commands use Node built-ins; no hosted service or API key is needed.

## Quick start

```bash
git clone https://github.com/yxjsxy/skillgap.git
cd skillgap
node cli.js inspect fixtures
mkdir -p generated
node cli.js inspect fixtures --json > generated/inspection.json
node cli.js rank fixtures > generated/ranking.md
node cli.js compare fixtures > generated/comparison.md
node cli.js ablate fixtures > generated/ablation.md
node cli.js brief fixtures > generated/promotion-brief.md
```

## Use your own data

Pass a directory of JSON run records. Each record needs a `workflow` and a nonempty `events` array. Event types such as `command`, `file`, `verify`, and `note` carry text evidence; the bundled `fixtures/` show the input format. Raw chat transcripts require conversion before use.

## Read the results

`inspect` exposes collected signals; `rank` lists evidence-weighted candidates; `compare` contrasts frequency-only ranking; `ablate` removes evidence weights; `brief` produces a Markdown authoring handoff. Scores are heuristic priorities, not a guarantee that a workflow is safe to automate.

## Limitations

- current input format is structured JSON fixtures, not raw OpenClaw or Hermes transcripts
- scoring is heuristic, not a learned ranking model
- the promotion brief is recommendation-quality, not a fully generated `SKILL.md`
- tiny bundled corpus proves the workflow, not broad external generalization
- next step should be transcript adapters and larger public benchmark corpora

## Examples and evaluation

The bundled `fixtures/` provide reproducible examples. See [experiment notes](docs/experiments.md) for the historical benchmark setup and its limits; those fixture results are not guarantees for other inputs.
