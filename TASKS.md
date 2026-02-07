# TASKS

Every task must be documented extensively and include explicit `Started` / `Completed` fields.
Use `Completed: No` for ongoing work and `Completed: Yes` only when fully done.

## T-001: Define persistent loop bookkeeping files
- Goal: `G-001`
- Started: 2026-02-07T22:02:35Z
- Completed: Yes
- Summary: Create durable files that survive stateless runs and preserve operational continuity.
- Scope:
  - Establish high-level goals file.
  - Establish detailed tasks file.
  - Establish bot status ledger for account progression.
- Implementation details:
  - Added `GOALS.md` for high-level objectives and task linkage.
  - Added `TASKS.md` for detailed execution tracking with explicit lifecycle fields.
  - Added `BOT_STATUS.md` for per-bot progression snapshots.
- Validation:
  - Files created in repository root and ready for iterative updates.
- Next actions:
  - Keep all future work mapped to a task and linked to a goal.

## T-002: Enforce task lifecycle discipline for stateless runs
- Goal: `G-001`
- Started: 2026-02-07T22:02:35Z
- Completed: No
- Summary: Ensure every future activity is represented by a task with unambiguous progress state.
- Scope:
  - Record all new initiatives before execution.
  - Update task notes during and after execution.
  - Mark completion only when validated outcomes are achieved.
- Operational policy:
  - No free-form work outside `TASKS.md`.
  - If interrupted, resume by reading open tasks where `Completed: No`.
- Risks:
  - Drift if updates are skipped during fast iteration.
- Mitigation:
  - Append updates immediately after each meaningful action.

## T-003: Maintain a clear backlog of improvement work
- Goal: `G-001`
- Started: 2026-02-07T22:02:35Z
- Completed: No
- Summary: Keep pipeline of next actions visible so loop executions can continue seamlessly.
- Scope:
  - Capture blockers, dependencies, and sequencing.
  - Keep tasks granular enough to be actionable in one session.
- Current backlog seeds:
  - Add notes/task format linting.
  - Add reliability telemetry checklist.

## T-004: Triage and patch reliability hiccups via SDK/porcelain
- Goal: `G-002`
- Started: 2026-02-07T22:02:35Z
- Completed: No
- Summary: Any observed runtime hiccup must become either a code patch candidate or explicit tracked follow-up.
- Scope:
  - Reproduce hiccups with context.
  - Assess whether fix belongs in script logic, `BotActions`, or `BotSDK`.
  - Implement feasible fixes with verification.
- Escalation path:
  - If immediate patch is not feasible, log a CRITICAL API gap in `NOTES.md` and create/expand a task.

## T-005: Build reusable reliability helpers in bot-scripts
- Goal: `G-002`
- Started: 2026-02-07T22:02:35Z
- Completed: No
- Summary: Consolidate retry, watchdog, stuck detection, and safe movement logic into reusable modules.
- Scope:
  - Avoid duplicate ad-hoc recovery logic across scripts.
  - Improve consistency of failure handling and observability.
- Success criteria:
  - New/updated scripts depend on shared helpers rather than bespoke loops.

## T-006: Maintain active bot progression ledger
- Goal: `G-003`
- Started: 2026-02-07T22:02:35Z
- Completed: No
- Summary: Keep per-bot current stats/objectives to support long-horizon goals (skills, quests, unlocks).
- Scope:
  - Track current skill levels and current training target.
  - Track immediate objective and strategic objective.
  - Track blockers and next run instructions.
- Data source:
  - Runtime observations and script outputs.

## T-007: Execute bot goals and update state after each run
- Goal: `G-003`
- Started: 2026-02-07T22:02:35Z
- Completed: No
- Summary: Run bots toward milestones and update outcomes in `BOT_STATUS.md`, `TASKS.md`, and `NOTES.md`.
- Scope:
  - Each run should have a measurable intent and result.
  - Store outcome deltas (levels gained, quest steps completed, failures).
- Completion criteria:
  - Goal-specific milestones reached and verified.
