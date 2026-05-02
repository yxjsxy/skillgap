#!/usr/bin/env bash
# GATE_LEVEL: P1
# GATE_VERIFY: SkillGap must emit a promotion brief for the top workflow with recommendation, evidence, verification trail, and next-step guidance.
set -euo pipefail

cd /Users/karlkarl/Documents/vibe_coding/skillgap
mkdir -p generated

node cli.js brief fixtures > generated/promotion-brief.md

grep -q '^# Skill Promotion Brief$' generated/promotion-brief.md
grep -q '^## Recommended workflow$' generated/promotion-brief.md
grep -q 'support-ticket-triage' generated/promotion-brief.md
grep -q 'Evidence score: 36' generated/promotion-brief.md
grep -q '^## Why this is ready now$' generated/promotion-brief.md
grep -q '^## Reusable proof trail$' generated/promotion-brief.md
grep -q 'coding_harness.sh' generated/promotion-brief.md
grep -q '^## Suggested next step$' generated/promotion-brief.md
grep -q 'Run2Skill' generated/promotion-brief.md

echo 'skillgap promotion brief gate passed'
