#!/usr/bin/env bash
# GATE_LEVEL: P0
# GATE_VERIFY: SkillGap must rank repeated workflows by evidence and show the difference from frequency-only backlog grooming.
set -euo pipefail

cd /Users/karlkarl/Documents/vibe_coding/skillgap
mkdir -p generated

node cli.js inspect fixtures --json > generated/inspection.json
node cli.js rank fixtures > generated/ranking.md
node cli.js compare fixtures > generated/comparison.md
node cli.js ablate fixtures > generated/ablation.md

grep -q '"workflowCount": 3' generated/inspection.json
grep -q '"workflow": "support-ticket-triage"' generated/inspection.json
grep -q '^1\. support-ticket-triage$' generated/ranking.md
grep -q 'top workflow: deploy-hotfix' generated/comparison.md
grep -q 'tied workflows at the top: 2' generated/comparison.md
grep -q 'top workflow: support-ticket-triage' generated/comparison.md
grep -q 'top evidence score: 36' generated/comparison.md
grep -q 'top workflow: support-ticket-triage' generated/ablation.md

echo 'skillgap mvp gate passed'
