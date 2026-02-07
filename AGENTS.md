# AGENTS.md

## Purpose
This repository is a RuneScape bot creation environment. Agents in this repo must produce reliable, long-running automation scripts using the local SDK.

## Canonical Data Sources
- RuneScape game/reference data is in `./runescape-data`.
- SDK architecture and behavior references:
  - `sdk/README.md`
  - `sdk/API.md`
  - `sdk/SDK_DESIGN.md`
  - `scripts/script_best_practices.md`

## Script Location Rules
- All new reusable scripts and helpers must live in `./bot-scripts`.
- Existing scripts in `./scripts` may be referenced for patterns, but new script assets should not be created there.
- Prefer shared utilities in `./bot-scripts` over one-off logic duplicated across scripts.

## Bot Configuration Standard
- For every newly created bot configuration (`bot.env`), set `SERVER=localhost:8888`.
- Treat any other default server value in new bot setup as incorrect unless explicitly overridden by user instruction.

## SDK Model (Must Follow)
- `BotSDK` is plumbing: low-level packet-like actions, resolves on ACK.
- `BotActions` is porcelain: domain-aware actions, resolves on effect completion.
- Keep game intelligence in script/porcelain logic, not in assumptions about a single linear flow.

## Reliability Requirements (Non-Linear by Default)
Scripts must never assume the happy path. Every loop must support interruption, recovery, and retries.

### Mandatory checks in long-running scripts
1. Continuously dismiss blocking UI (level-up dialogs, modal dialogs, shop/bank leftovers).
2. Re-read state frequently; do not trust stale references to NPC/loc entities.
3. Use explicit timeouts for each phase and for the whole script.
4. Detect progress (XP, inventory, position, objective counters) and track last-progress timestamps.
5. Trigger recovery paths when no progress is detected.
6. Handle movement failures with retries/fallback movement and re-pathing.
7. Handle disconnected or missing state (`state == null`, `!inGame`) gracefully.
8. Fail fast with clear error messages when recovery budget is exhausted.

### Recovery expectations
- Retry interactions with bounded attempts.
- Reposition when targets are missing/unreachable.
- Re-scan nearby entities instead of reusing old IDs/options.
- Clear unexpected UI before reattempting actions.
- Abort cleanly on sustained stuckness rather than infinite stalling.

## Reusable Script Baseline
New scripts in `./bot-scripts` should reuse common helpers for:
- `sleep` / paced polling
- bounded retry
- progress watchdog
- stuck detection
- safe walk wrappers
- dialog/UI clearing loops

## Style Guidelines for Durable Bots
- Prefer state-based guards over fixed delays.
- Use tick-aware message checks when reading `gameMessages`.
- Keep loops idempotent and resumable.
- Log decisions and recovery events clearly for debugging.
- Validate prerequisites (items, skills, location) before each phase, not only at startup.

## Definition of Done for Bot Scripts
A script is not done unless it:
- survives transient failures without manual intervention,
- avoids indefinite stalls,
- exits with explicit reason on unrecoverable states,
- and can be reused as a component in other `./bot-scripts` flows.

## Flawless Reliability Policy
- The target for all scripts is flawless long-running operation, not "mostly works".
- Any observed hiccup (stall, recovery loop failure, missed interaction, desync, or manual babysitting requirement) must trigger immediate follow-up:
  - first, determine whether the issue should be fixed in `BotSDK`/`BotActions` and patch it when feasible;
  - otherwise, add a timestamped note in `NOTES.md` with concrete failure symptoms, likely cause, and explicit manual follow-up required.
- Hiccups must not be normalized as acceptable behavior; they are either patched or explicitly tracked for SDK/API improvement.

## SDK Change Workflow
- For SDK changes, prefer working in a dedicated git worktree when practical to isolate scope.
- Use iterative commits only: keep each commit small, reviewable, and focused on a single logical change.
- Never batch large unrelated SDK edits into one commit.
- If follow-up fixes are needed, add additional small commits instead of inflating an in-flight change.

## Data Source Policy (Local-First, No Internet)
- Default to local repository data only (`runescape-data`, SDK docs, local code, and local logs).
- Do not use internet sources unless explicitly directed by the user for a specific task.
- If a task appears to require internet data to proceed, treat that as a `CRITICAL` system/data gap:
  - log it in `NOTES.md` as `CRITICAL`,
  - describe exactly what local data is missing,
  - propose the local dataset/tooling change needed to remove internet dependence.

## RuneScape Data Quality Requirements
- Correct misinformation and fill missing information in `runescape-data` whenever discovered.
- If instructions reference a world person/place/thing and its position is unknown, resolve it and add structured location data.
- Required position format for new location facts: `(x, y, z)` plus any relevant context (area, floor/plane meaning, nearby landmarks, prerequisites, interaction notes).
- Prefer edits that make data reusable by future agents (clear canonical naming, cross-links, and retrieval-friendly structure).
- When new coordinates or corrections are added, log the update in `NOTES.md` with what changed and why.

## Notes Log Requirements (`NOTES.md`)
- Maintain and continuously append to `./NOTES.md` during work in this repository.
- Every entry must be timestamped in UTC ISO-8601 format (example: `2026-02-07T21:56:31Z`).
- Each timestamped entry must include:
  - things that are working,
  - things that are not working,
  - things that need improvement.
- If a missing or inadequate Bot SDK API is discovered, add a clearly labeled `CRITICAL` note with:
  - the exact missing `BotSDK`/`BotActions` API,
  - why it blocks or degrades script reliability/productivity,
  - the concrete workflow affected.
