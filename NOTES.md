# NOTES

## 2026-02-07T21:56:31Z
- Working: Standing notes file initialized.
- Not working: N/A yet.
- Needs improvement: Capture concrete runtime observations after each script/test run.
- CRITICAL API wishlist: When a bot script surfaces repeated SDK friction, add a timestamped CRITICAL note here with the exact missing BotSDK/BotActions API and the blocking workflow.

## 2026-02-07T21:57:06Z
- Working:  now documents mandatory  handling (append-only workflow, UTC timestamps, required categories, and CRITICAL SDK API note format).
- Not working: No automation enforces note quality/format yet.
- Needs improvement: Add a lightweight lint/check to validate  entry structure in CI.

## 2026-02-07T21:57:11Z
- Working: AGENTS.md now documents mandatory NOTES.md handling (append-only workflow, UTC timestamps, required categories, and CRITICAL SDK API note format).
- Not working: No automation enforces note quality/format yet.
- Needs improvement: Add a lightweight lint/check to validate NOTES.md entry structure in CI.

## 2026-02-07T21:58:51Z
- Working: AGENTS.md now includes a Flawless Reliability Policy requiring every hiccup to be patched in SDK/porcelain where feasible, or documented for manual follow-up.
- Not working: No automated detector currently flags hiccups; detection depends on runtime observation and logs.
- Needs improvement: Add structured hiccup telemetry and an issue template so failures map directly to SDK/API patch candidates.
- CRITICAL API wishlist: A first-class SDK hiccup-report API (phase, last-progress-ts, recovery-attempt-count, blocking-UI snapshot) would reduce diagnosis time and make automated recovery tuning possible.

## 2026-02-07T22:03:09Z
- Working: Added persistent loop tracking files GOALS.md, TASKS.md, and BOT_STATUS.md with explicit goal-task linkage and Started/Completed lifecycle fields.
- Not working: Bot progression values are still mostly unknown until new runs capture verified skill snapshots.
- Needs improvement: Automate synchronization so each bot run appends deltas to BOT_STATUS.md and links to a TASKS.md update automatically.
- CRITICAL API wishlist: A single BotSDK API for atomic skill snapshot + quest progress + location state export would reduce bookkeeping errors and make stateless continuation reliable.

## 2026-02-07T22:05:29Z
- Working: Added SDK commit discipline to AGENTS.md (prefer worktrees for SDK changes and enforce small iterative commits).
- Not working: No automatic guard currently blocks oversized commits.
- Needs improvement: Add a pre-commit or CI check that flags unusually large SDK diffs for manual split.

## 2026-02-07T22:16:43Z
- Working: `runescape-data` is readable and currently symlinked to `../runescape-graph`; directory listing succeeds.
- Not working: N/A for this check.
- Needs improvement: Add a startup validation task that asserts required data symlinks/paths exist before bot runs.

## 2026-02-07T22:17:24Z
- Working: Confirmed local orange dye acquisition path from quest data (Aggie creates red/yellow dyes, then combine to orange).
- Not working: Item obtain pages are currently generic templates and do not include concrete acquisition steps.
- Needs improvement: Enrich runescape-data item obtain nodes with explicit ingredient + NPC + coin-cost instructions.

## 2026-02-07T22:18:16Z
- Working: Added local-first/no-internet policy to AGENTS.md with explicit CRITICAL handling when internet data is needed.
- Not working: No automatic guard currently prevents accidental internet dependency during task execution.
- Needs improvement: Add a workflow check that requires documenting local-source provenance before answering data questions.
- CRITICAL: Requiring internet data for routine gameplay guidance is a system data coverage bug; missing local dataset slices should be identified and backfilled into runescape-data.

## 2026-02-07T22:41:33Z
- Working: Added runescape-data quality policy to AGENTS.md requiring correction of misinformation and filling missing world data, including mandatory (x, y, z) capture when unknown.
- Not working: No schema/lint currently enforces coordinate completeness or structured location metadata consistency.
- Needs improvement: Add a runescape-data validation rule that rejects new/updated world entities lacking canonical name + (x, y, z) + context fields.

## 2026-02-07T22:47:41Z
- Working: Added Bot Configuration Standard to AGENTS.md requiring SERVER=localhost:8888 for all newly created bots.
- Not working: Existing bots may still contain non-standard server settings and need audit/remediation.
- Needs improvement: Add a bot creation/check script that enforces SERVER=localhost:8888 in new bot.env files automatically.
