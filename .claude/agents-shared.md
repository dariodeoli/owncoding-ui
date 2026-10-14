# Shared rules for every owncoding-ui role

Repo: owncoding-ui — shared React 18 component library (JSX, Tailwind preset, CSS tokens in src/styles) consumed by MobOS, ScaleOS, LedBox, PagaYa and Agendese. Gallery (vite) published at https://controlaria.online. Rules of record: docs/REGLAS.md, docs/ACCESIBILIDAD.md, docs/MODOS-DE-TRABAJO.md.

## Shared rules
- Work only inside your scope. If a change needs another area, stop and report it as a handoff for the integrator.
- Never push, publish, tag, bump the version or deploy the gallery. Commit locally on your branch only. The integrator owns main and `hd`.
- Small conventional commits matching repo style (`feat(area): ...`, `fix(area): ...`, `Refs #NNN`). No Co-Authored-By or AI attribution lines.
- Public API is a contract: never rename or remove an export or a prop. New behavior is additive and opt-in, or the default changes only when visually compatible for every consumer.
- UI copy in Spanish as in the existing components. Identifiers and comments follow repo conventions (Spanish comments are the norm here).
- Real bug: fix the source and keep or add a test. Stale test: update it to the shipped behavior keeping its intent. Never delete assertions or `.skip` just to go green.
- Shell: rg/fd/eza or the Read/Edit tools (no cat/grep/find/sed/ls). Chromium/Playwright commands may need to run outside the sandbox.

## Before you report (QA acceptance — meet all of these first)
- Re-read the task's acceptance criteria and list each one with pass/fail.
- No weakened, deleted or skipped assertions; new behavior has tests.
- No breaking change to exports/props; `npm run test:types` passes.
- UI: light and dark, contrast >= 4.5 for text and >= 3 for borders/focus indicators, 44px touch targets on mobile, 375px without horizontal scroll, keyboard + visible focus, reduced-motion respected.
- Bundle budget respected (`npm run check:bundle`).
- Errors are logged, never silently swallowed.

## Token economy
- Use the brief you were given; do not re-explore the whole repo. Read only files you will change or must understand.
- Screenshots only for final verification, max 6 key screenshots per task.
- While iterating run only the related tests (`npx vitest run <path>`).
- Run the full `npm test` exactly once, at the end. The writer is the only role that runs the full suite; QA and the integrator run only related tests, and the release script runs it again.
- Fix rounds: if you are under ~300k tokens you may be resumed with your context (do not re-read what you know). Above ~300k the fix goes to a fresh agent with a short brief, not to you.
- Max 3 agents running at once on this machine; under heavy load tests time out, so do not re-run a timed-out suite blindly: report it.
- Report your approximate token use in the report.

## Verification (always, in the foreground)
- `npm test` -> 0 failed
- `npm run test:types`
- `npm run build`
- `npm run check:bundle`
- Extra checks listed for your role.

## Report format
1. Status: done | partial | blocked
2. Branch / worktree and commits (hash + subject)
3. What changed and why (short, per goal)
4. Verification: `<command>: <observed result>`
5. Handoffs and open questions (max 3)
