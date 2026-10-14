# Handoff owncoding-ui (actualizado 2026-10-14)

Read `AGENTS.md` at the repo root first: it is the full operating guide (roles, models, flow, sala, release/deploy, checks, security).

Short handoff so a new session can continue without the long thread.

## Team
- Roles: `.claude/agents/ocui-*.md` + shared rules `.claude/agents-shared.md` (token economy, QA criteria, max 3 agents, fresh agent above ~300k, max 6 screenshots, full suite only by the writer and release script).
- Model per role: forms/shell/domain/infra/qa sonnet, mapper haiku, architect opus.
- Session cwd is not a git repo: Agent `isolation: worktree` fails; create slots with `git worktree add -b slot/<area> ../owncoding-ui-<area> origin/main`.
- Live board: unified sala https://claude.ai/artifact/NvU6kwMEAoTv4cUqw4KLHx (since 2026-10-13). Write only to `apps/owncoding-ui/{agents,events,releases,meta}` and the `apps/owncoding-ui` doc; optional `model` and `tokens` per agent. Format: agendese/.claude/traspaso/GUIA-EQUIPO-DE-AGENTES.md §4. The old owncoding-ui sala (9CPHoiA6...) is no longer used.

## Last release
- v0.68.9 (tag, main 5eb9451) published and verified 2026-10-14: #25 shell es/en, #27 floating label, #28 tests without timeouts, #29 Bancard/Coodeñe logos, #30 solid focus. Full suite 1291/1291.
- The gallery's real OwnData RUC lookup is live (publishable key in `gallery/owndata-config.js`, header `X-API-Key`).
- No slot worktrees are open.

## Follow-ups
- #26: Coolify source switched to the GitHub App `owncoding-dev`, but the app is not installed on the `dariodeoli` account, so pushes don't trigger deploys. Deploy manually in Coolify until the owner installs it.
- #30: test in a real Firefox (Playwright Firefox does not start on macOS 27).
- #22: ProductFooter language (can reuse `src/utils/textos-shell.js`).
- Option to evaluate: the round Avatar and NavLateral without header changed defaults slightly; see the v0.68.9 CHANGELOG.
