---
name: runescape
description: "Start a local RS-SDK RuneScape session. Load this at the start of EVERY RS-SDK session."
---

## Important: Always Use Gob

**Use `gob` for ALL background processes** — engine, gateway, and bot scripts. Never use `interactive_shell` for these. Gob provides persistent process management with `gob list`, `gob stdout`, `gob stop`, etc.

## Session Startup Flow

**Always follow this flow when starting a session.**

### Step 1: Check for Running Services

```bash
gob list
curl -s http://localhost:8080/ | head -2    # Engine
curl -s http://localhost:7780/ | head -2    # Gateway
```

If both are running, skip to Step 2.

If not running, start them with gob (a `.config/gobfile.toml` exists):
```bash
gob add --description "Game engine on :8080" bash -c 'cd engine && WEB_PORT=8080 exec bun run src/app.ts'
gob add --description "Gateway on :7780" bash -c 'cd gateway && exec bun run gateway.ts'
```

Wait ~5s, then verify with `curl`.

**First time only** — build webclient:
```bash
cd webclient && bun run build
mkdir -p engine/public/client engine/public/bot
cp out/bot/* ../engine/public/bot/
cp out/standard/* ../engine/public/client/
```

### Important: Server Restarts Wipe Progress

The local server does **not** persist character state across restarts. Skills, inventory, position — most or all can reset. When resuming a session, **always check live state via MCP before trusting `progress.md`**. Compare the two and inform the user of any discrepancies. This avoids wasted time running scripts that assume items/levels the bot no longer has.

### Step 2: Read Post Mortems

Always check for lessons from retired bots before doing anything:
```bash
ls bots/post_mortems/ 2>/dev/null
```
If post mortems exist, read them all. They contain hard-won lessons that save time.

### Step 3: Check for Existing Bots

```bash
ls bots/ | grep -v _template | grep -v post_mortems
```

If bots exist, check for progress logs:
```bash
cat bots/{botname}/progress.md
```

Then **ask the user**:

> I found bot `{name}`. Here's where we left off:
> {summary from progress.md}
>
> Do you want to **continue** with this bot or **start fresh** with a new one?

- **Continue**: Read `progress.md`, check bot state via MCP, then ask what they want to do
- **New**: Retire the old bot first (see below), then create a new one

### Retiring a Bot

When a bot is being replaced or abandoned:

1. **Write a post mortem** to `bots/post_mortems/{botname}.md` covering:
   - Peak stats and achievements
   - What worked well (strategies, locations, approaches)
   - What went wrong (failures, blockers, bugs)
   - Lessons learned for the next bot
2. **Delete the bot folder**: `rm -rf bots/{botname}`
3. **Create new bot**: `bun scripts/create-bot.ts {name}`

### Step 4: Connect MCP Server

The MCP server (`rs-agent`) provides fast interactive tools for experimentation. Verify it's connected:
```
mcp({})
```

If not connected or 0 servers:
```
mcp({ connect: "rs-agent" })
```

The MCP config lives at `.pi/mcp.json` (project) and `~/.pi/agent/mcp.json` (global). If neither exists, create `.pi/mcp.json`:
```json
{
  "mcpServers": {
    "rs-agent": {
      "command": "bun",
      "args": ["run", "mcp/server.ts"],
      "cwd": "/Users/haza/Projects/rs-sdk"
    }
  }
}
```

**Note:** The MCP adapter only loads configs at pi startup. If you just added the config, the user needs to restart pi (not just `/reload`).

### Step 5: Bot Environment

The `bot.env` must **NOT** set `SERVER` for local play:
```
BOT_USERNAME=mybot
PASSWORD=secret
SHOW_CHAT=false
```

### Step 6: Browser Login

Tell the user to open `http://localhost:8080/` and log in with the bot credentials. The bot must be logged in via browser before scripts work.

### Step 7: Ask What to Do

Suggest activities based on the bot's current state and progress. Check `learnings/` for tips on specific skills.

---

## MCP First, Scripts Second

**Use MCP (`execute_code`) for:**
- Checking state, inventory, position
- Experimenting with new actions
- Quick one-off tasks
- Exploring and learning game mechanics
- Rapid iteration on approaches

**Use scripts only when:**
- Running long loops (5+ minutes of grinding)
- Proven approach that needs to run unattended
- Reusable automation worth saving to a file

**MCP workflow — explore, then automate:**
1. Use `execute_code` to try things, check results, learn what works
2. Once you have a working approach, write it into a script for long runs

### MCP Quick Reference

```
# Check bot state
mcp({ tool: "rs_agent_execute_code", args: '{"bot_name": "NAME", "code": "return sdk.getState();"}' })

# Run actions
mcp({ tool: "rs_agent_execute_code", args: '{"bot_name": "NAME", "code": "await bot.walkTo(3222, 3218); return sdk.getState().player;"}' })

# List connected bots
mcp({ tool: "rs_agent_list_bots" })
```

---

## Running Scripts (for long grinding sessions)

**Always use `gob add`** (not `gob run`) — scripts hang if the runner doesn't exit:
```bash
gob add --description "Mining run" bun bots/{username}/{script}.ts
gob stdout <id>    # Check output
gob stop <id>      # Stop when done
```

**Always set `disconnectAfter: true`** in `runScript()` options so the process exits cleanly:
```typescript
await runScript(async (ctx) => { ... }, {
  timeout: 5 * 60_000,
  disconnectAfter: true,
});
```

## Brain Dump to Learnings

**After every meaningful discovery**, update the relevant file in `learnings/`:
- New rock IDs, NPC locations, shop inventories, coordinates
- What worked, what failed, and why
- SDK/API quirks and workarounds
- Create new files for new skills (e.g., `learnings/smithing.md`)

Don't wait until end of session — dump knowledge **as you learn it** so it survives MCP timeouts, crashes, and session ends. Future sessions read `learnings/` to avoid re-discovering the same things.

## Updating Progress

**After every script run or session**, update `bots/{username}/progress.md`:
- Current location, stats, inventory highlights
- What was accomplished
- Issues encountered and how they were solved
- What to do next

Keep it concise — cliff notes, not a novel.

## API Gotchas

| Wrong | Right |
|-------|-------|
| `sdk.sendWieldItem()` | `bot.equipItem(/name/i)` |
| `bot.sendSkipTutorial()` | `bot.skipTutorial()` |
| Fishing spots in `nearbyLocs` | Fishing spots in `nearbyNpcs` |
| One long `walkTo` | Walk in steps, open gates/doors |
| Silent failures | Wrap everything in try/catch, log results |
| Mining without checking inventory space | Always drop/check inventory before mining |

- Always call `bot.dismissBlockingUI()` in loops
- Always eat food when HP is low
- Check `learnings/` folder for skill-specific tips
- Start with short runs (1-2 min), extend when proven
- Rocks at SE Varrock mine are distinguished by `id` (2090, 2091, 2092, 2093, 2094, 2095) but not by name — all called "Rocks"

## Troubleshooting

| Problem | Fix |
|---------|-----|
| 404 client.js/deps.js | Build webclient + copy to engine/public/ |
| Connection refused port 80 | Use `WEB_PORT=8080` |
| Status check uses https:// | Remove `SERVER` from bot.env |
| `bun` not found | Prepend `PATH="$HOME/.bun/bin:$PATH"` |
| walkTo fails silently | Walk in steps, open gates |
| Bot stuck in Lumbridge castle | Open doors first: `bot.openDoor(/door/i)` before walking out |
| Pickpocketing fails often at level 1 | Expect many failures/stuns — loop 15-20 times for a few coins |
| MCP shows 0 servers after config change | User must restart pi — `/reload` doesn't reload MCP configs |
| Server restart wipes character progress | Expected with local server — stats/inventory reset on restart |
