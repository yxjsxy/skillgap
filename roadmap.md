# SkillGap Roadmap

## 当前状态：🚧 活跃开发中
- 项目定位：skill promotion backlog groomer，帮 agent builder 从一堆成功 run 里判断“下一份最值得沉淀成 skill 的 workflow 是谁”
- 完成度：43%
- 当前状态：MVP 已可运行，包含 workflow inspection、promotion ranking、frequency baseline comparison、artifact/verify ablation、README、实验日志和 harness gate

## 项目介绍
SkillGap 面向已经有成功 agent run、也知道 skill 很重要，但每次都拍脑袋决定先沉淀哪个 workflow 的团队。它不替代 memory，也不替代 transcript-to-skill generator，而是补上前面的那一步：先把 skill promotion backlog 排清楚。

## 已实现功能
- successful run corpus 扫描
- workflow 聚类
- evidence-weighted promotion score
- frequency-only baseline comparison
- ablation for artifact/verify weighting
- JSON inspection output
- README + docs/experiments.md
- harness gate

## 未实现功能

### P0
- OpenClaw transcript adapter
- Hermes transcript adapter
- promotion brief export

### P1
- score explanation per workflow
- Run2Skill export bridge
- repo-wide skill coverage heatmap

### P2
- GitHub Action
- hosted dashboard
- promotion trend reports

## 技术栈
- Node.js
- 零依赖 CLI

## 运行方式
- `node cli.js inspect fixtures`
- `node cli.js inspect fixtures --json`
- `node cli.js rank fixtures`
- `node cli.js compare fixtures`
- `node cli.js ablate fixtures`

## 验收
- `bash ~/.openclaw/workspace/scripts/coding_harness.sh gates/skillgap-mvp.sh 3`
