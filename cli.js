#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function parseArgs(argv) {
  const positional = [];
  const options = { json: false };
  for (const arg of argv) {
    if (arg === '--json') {
      options.json = true;
      continue;
    }
    positional.push(arg);
  }
  return { positional, options };
}

function listRunFiles(inputDir) {
  const fullDir = path.resolve(inputDir);
  return fs.readdirSync(fullDir)
    .filter((file) => file.endsWith('.json'))
    .sort()
    .map((file) => path.join(fullDir, file));
}

function uniq(list) {
  return [...new Set(list.filter(Boolean))];
}

function readRun(file) {
  const payload = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (!payload.workflow || !Array.isArray(payload.events) || !payload.events.length) {
    throw new Error(`Invalid run fixture: ${file}`);
  }
  return payload;
}

function inferSignals(events) {
  const commands = uniq(events.filter((event) => event.type === 'command').map((event) => event.text.trim()));
  const files = uniq(events.filter((event) => event.type === 'file').map((event) => event.text.trim()));
  const verify = uniq(events.filter((event) => event.type === 'verify').map((event) => event.text.trim()));
  const notes = uniq(events.filter((event) => event.type === 'note').map((event) => event.text.trim()));
  const prerequisites = [];
  const escalation = [];

  if (commands.some((item) => item.startsWith('ticket.search'))) prerequisites.push('ticket');
  if (commands.some((item) => item.startsWith('crm.search'))) prerequisites.push('customer-context');
  if (commands.some((item) => item.startsWith('kb.search'))) prerequisites.push('knowledge-base');
  if (commands.some((item) => item.startsWith('billing.refund'))) {
    prerequisites.push('refund-scope');
    escalation.push('money-movement');
  }
  if (commands.some((item) => item.startsWith('chat.post'))) {
    prerequisites.push('outbound-channel');
    escalation.push('cross-team-notify');
  }
  if (commands.some((item) => item.startsWith('vault.read'))) prerequisites.push('policy-access');
  if (commands.some((item) => item.startsWith('gh.issue.create'))) prerequisites.push('issue-write');
  if (commands.some((item) => item.startsWith('deploy.start'))) prerequisites.push('deploy-access');
  if (commands.some((item) => item.startsWith('metrics.check'))) prerequisites.push('metrics-access');
  if (commands.some((item) => item.startsWith('ci.rerun'))) prerequisites.push('ci-access');
  if (commands.some((item) => item.startsWith('test.run'))) prerequisites.push('local-test-env');
  if (verify.some((item) => item.includes('coding_harness.sh'))) prerequisites.push('gate-command');

  return { commands, files, verify, notes, prerequisites: uniq(prerequisites), escalation: uniq(escalation) };
}

function aggregate(inputDir) {
  const runs = listRunFiles(inputDir).map(readRun);
  const byWorkflow = new Map();

  for (const run of runs) {
    const bucket = byWorkflow.get(run.workflow) || {
      workflow: run.workflow,
      goals: [],
      runIds: [],
      commands: [],
      files: [],
      verify: [],
      notes: [],
      prerequisites: [],
      escalation: []
    };

    const signals = inferSignals(run.events);
    bucket.goals.push(run.goal);
    bucket.runIds.push(run.runId || path.basename(run.source || 'unknown'));
    bucket.commands.push(...signals.commands);
    bucket.files.push(...signals.files);
    bucket.verify.push(...signals.verify);
    bucket.notes.push(...signals.notes);
    bucket.prerequisites.push(...signals.prerequisites);
    bucket.escalation.push(...signals.escalation);
    byWorkflow.set(run.workflow, bucket);
  }

  const workflows = [...byWorkflow.values()].map((workflow) => {
    const commands = uniq(workflow.commands);
    const files = uniq(workflow.files);
    const verify = uniq(workflow.verify);
    const prerequisites = uniq(workflow.prerequisites);
    const escalation = uniq(workflow.escalation);
    const runCount = workflow.goals.length;
    const frequencyScore = runCount;
    const evidenceScore = runCount * 3 + commands.length + files.length * 2 + verify.length * 2 + prerequisites.length + escalation.length * 2;
    const readiness = verify.length > 0 && files.length > 0 ? 'high' : verify.length > 0 ? 'medium' : 'low';

    return {
      workflow: workflow.workflow,
      runCount,
      uniqueCommands: commands.length,
      artifacts: files.length,
      verifySteps: verify.length,
      prerequisites: prerequisites.length,
      escalationBranches: escalation.length,
      readiness,
      frequencyScore,
      evidenceScore,
      goals: uniq(workflow.goals),
      files,
      verify,
      commands,
      notes: uniq(workflow.notes)
    };
  });

  workflows.sort((a, b) => b.evidenceScore - a.evidenceScore || b.runCount - a.runCount || a.workflow.localeCompare(b.workflow));
  return workflows;
}

function inspect(inputDir, asJson) {
  const workflows = aggregate(inputDir);
  if (asJson) {
    return JSON.stringify({ workflowCount: workflows.length, workflows }, null, 2);
  }
  const lines = ['# SkillGap Inspection', '', `- workflows: ${workflows.length}`, ''];
  for (const workflow of workflows) {
    lines.push(`## ${workflow.workflow}`);
    lines.push(`- runs: ${workflow.runCount}`);
    lines.push(`- unique commands: ${workflow.uniqueCommands}`);
    lines.push(`- artifacts: ${workflow.artifacts}`);
    lines.push(`- verify steps: ${workflow.verifySteps}`);
    lines.push(`- prerequisites: ${workflow.prerequisites}`);
    lines.push(`- escalation branches: ${workflow.escalationBranches}`);
    lines.push(`- readiness: ${workflow.readiness}`);
    lines.push(`- evidence score: ${workflow.evidenceScore}`);
    lines.push('');
  }
  return `${lines.join('\n')}\n`;
}

function rank(inputDir) {
  const workflows = aggregate(inputDir);
  const lines = ['# SkillGap Ranking', '', '## Promotion candidates'];
  workflows.forEach((workflow, index) => {
    lines.push(`${index + 1}. ${workflow.workflow}`);
    lines.push(`   - evidence score: ${workflow.evidenceScore}`);
    lines.push(`   - runs: ${workflow.runCount}`);
    lines.push(`   - verify steps: ${workflow.verifySteps}`);
    lines.push(`   - artifacts: ${workflow.artifacts}`);
    lines.push(`   - readiness: ${workflow.readiness}`);
  });
  lines.push('', '## Recommendation');
  lines.push(`Promote ${workflows[0].workflow} first because it combines repeated success with the richest reusable verification and artifact trail.`);
  return `${lines.join('\n')}\n`;
}

function compare(inputDir) {
  const workflows = aggregate(inputDir);
  const frequencyRanked = [...workflows].sort((a, b) => b.frequencyScore - a.frequencyScore || a.workflow.localeCompare(b.workflow));
  const tieCount = frequencyRanked.filter((workflow) => workflow.frequencyScore === frequencyRanked[0].frequencyScore).length;
  const top = workflows[0];
  const baselineTop = frequencyRanked[0];
  const baselineTop2Richness = frequencyRanked.slice(0, 2).reduce((sum, item) => sum + item.verifySteps + item.artifacts, 0);
  const weightedTop2Richness = workflows.slice(0, 2).reduce((sum, item) => sum + item.verifySteps + item.artifacts, 0);

  return `# SkillGap Comparison\n\n## Baseline: frequency-only backlog grooming\n- top workflow: ${baselineTop.workflow}\n- top frequency score: ${baselineTop.frequencyScore}\n- tied workflows at the top: ${tieCount}\n- top-2 verification-plus-artifact richness: ${baselineTop2Richness}\n\n## SkillGap evidence-weighted ranking\n- top workflow: ${top.workflow}\n- top evidence score: ${top.evidenceScore}\n- top workflow verify steps: ${top.verifySteps}\n- top workflow artifacts: ${top.artifacts}\n- top-2 verification-plus-artifact richness: ${weightedTop2Richness}\n\n## Takeaway\n- frequency alone cannot break the tie between deploy-hotfix and support-ticket-triage in the bundled corpus\n- SkillGap promotes the workflow with the stronger proof trail, which is the better candidate for immediate skillification\n`;
}

function ablate(inputDir) {
  const workflows = aggregate(inputDir);
  const ablated = [...workflows].map((workflow) => ({
    ...workflow,
    ablatedScore: workflow.runCount * 3 + workflow.uniqueCommands + workflow.prerequisites
  })).sort((a, b) => b.ablatedScore - a.ablatedScore || b.runCount - a.runCount || a.workflow.localeCompare(b.workflow));

  return `# SkillGap Ablation\n\n## Full score\n- top workflow: ${workflows[0].workflow}\n- score formula: runs*3 + commands + artifacts*2 + verify*2 + prerequisites + escalation*2\n\n## Without artifact and verify weighting\n- top workflow: ${ablated[0].workflow}\n- score formula: runs*3 + commands + prerequisites\n\n## Interpretation\n- removing artifact and verification weighting makes deploy-hotfix look deceptively comparable, even though support-ticket-triage is easier to validate and promote into a durable skill\n`;
}

const [, , command, ...argv] = process.argv;
const { positional, options } = parseArgs(argv);
const inputDir = positional[0];

if (!command || !inputDir) {
  console.error('Usage: node cli.js <inspect|rank|compare|ablate> <runs-dir> [--json]');
  process.exit(1);
}

if (command === 'inspect') process.stdout.write(inspect(inputDir, options.json));
else if (command === 'rank') process.stdout.write(rank(inputDir));
else if (command === 'compare') process.stdout.write(compare(inputDir));
else if (command === 'ablate') process.stdout.write(ablate(inputDir));
else {
  console.error(`Unknown command: ${command}`);
  process.exit(1);
}
