# Handoff owncoding-ui (actualizado 2026-10-14)

Read `AGENTS.md` at the repo root first: it is the full operating guide (roles, models, flow, sala, release/deploy, checks, security).

Short handoff so a new session can continue without the long thread.

## Team
- Roles: `.claude/agents/ocui-*.md` + shared rules `.claude/agents-shared.md` (token economy, QA criteria, max 3 agents, fresh agent above ~300k, max 6 screenshots, full suite only by the writer and release script).
- Model per role: forms/shell/domain/infra/qa sonnet, mapper haiku, architect opus.
- Session cwd is not a git repo: Agent `isolation: worktree` fails; create slots with `git worktree add -b slot/<area> ../owncoding-ui-<area> origin/main`.
- Live board: unified sala https://claude.ai/artifact/NvU6kwMEAoTv4cUqw4KLHx (since 2026-10-13). Write only to `apps/owncoding-ui/{agents,events,releases,meta}` and the `apps/owncoding-ui` doc; optional `model` and `tokens` per agent. Format: agendese/.claude/traspaso/GUIA-EQUIPO-DE-AGENTES.md §4. The old owncoding-ui sala (9CPHoiA6...) is no longer used.

## Last release
- v0.68.0 (tag, main 7105f01) published 2026-10-13: forms redesign + opt-in `FormulariosPro`, shell objects for OwnData. CI green; gallery serving 0.68.0/7105f01 after a manual Coolify redeploy (the push did not trigger it).
- Slot worktrees and branches removed. OwnData was sent the tag and SHA.

## Follow-ups (GitHub issues, 2026-10-13)
- #24 OwnData real RUC in the gallery: migration 016, pk_ key, revoke the exposed od_test key.
- #25 Shell gaps reported by OwnData (es/en texts, SelectorEspacio, person Avatar, NavLateral).
- #26 Gallery deploy does not fire on push (Coolify).
- #27 Opt-in floating labels.
- #28 Load-sensitive 5s test timeouts.
- #29 Bancard and Coodeñe compact logos illegible with current official assets.
- #30 Pending accessibility checks (autofill/:has() in Safari/Firefox, Switch focus, spinners, light brand colors).
