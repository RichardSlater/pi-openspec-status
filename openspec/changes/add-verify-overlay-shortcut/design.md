## Context

The `OpenSpecOverlay` component (invoked via `Ctrl+Alt+O`) presents an action bar at the bottom listing available OpenSpec workflows. Currently it always shows: `a apply`, `e explore`, `c archive`, `p propose`, `esc cancel`. The verify workflow (`/opsx-verify`) needs a `v` hotkey — but only when the verify command is actually registered in the current pi session.

The existing interaction architecture:
- `interaction.ts` orchestrates: fetch data → show loading → show overlay → dispatch action
- `OpenSpecOverlay` in `overlay.ts` receives data via constructor, renders a hint bar with hardcoded actions
- `OverlayAction` in `types.ts` defines the dispatchable action types
- `pi.getCommands()` is a sync ExtensionAPI method that returns all registered slash commands with provenance metadata

## Goals / Non-Goals

**Goals:**
- Add `v` hotkey to overlay that dispatches `/opsx-verify <change-name>`
- Conditionally show `v` only when `opsx-verify` is registered via `pi.getCommands()`
- Follow existing patterns: hint bar rendering, `handleInput()`, action dispatch

**Non-Goals:**
- Change-stage awareness (hiding `v` based on selected change completion state) — deferred
- Modifying the inline widget (this is overlay-only)
- Adding verify to the widget's render hint area (widget has no action bar)

## Decisions

### Decision 1: Use `pi.getCommands()` for detection

**Alternatives considered:**
- File-based check (`test -f .pi/skills/openspec-verify-change/SKILL.md`): brittle, doesn't handle user-scoped installs, requires async I/O
- Prompt file check: same problems, less semantically correct
- OpenSpec schema check: verify isn't a schema, it's a workflow action

**Choice:** `pi.getCommands()` — it's synchronous, zero-I/O, and is the canonical source of truth for what commands pi can invoke. It correctly handles all scopes (user/project/temporary), all origins (package/top-level), and name collisions.

```typescript
const commands = pi.getCommands();
const hasVerify = commands.some(
  c => c.name === "opsx-verify" && c.source === "skill"
);
```

The `source === "skill"` guard prevents false positives from bare extension commands that happen to share the name.

### Decision 2: Detect lazily on each overlay open

**Alternative considered:** Detect at session_start and cache.

**Choice:** Detect per-open in `interaction.ts`. `pi.getCommands()` is sync and trivial — the cost is negligible. This also means if commands change during a session (e.g., `/reload` picks up new skills), the next overlay open reflects it immediately. No cache invalidation to manage.

### Decision 3: Pass `hasVerify` as a constructor parameter

**Alternative considered:** Pass the full commands list and let the overlay decide.

**Choice:** Pass a simple boolean `hasVerify`. The overlay doesn't need to know about the commands API or provenance — it just needs to know "should I show the v hint, yes or no?" This keeps the overlay decoupled from pi API details.

### Decision 4: `v` placement in the hint bar

The hint bar groups actions logically: change-specific actions first (`apply`, `explore`, `archive`), then global actions (`propose`), then `esc cancel`. Verify is a change-specific action (you verify a specific change), so it belongs in the first group:

```
a apply · v verify · e explore · c archive · p propose · esc cancel
```

When verify is not available, the bar stays unchanged:
```
a apply · e explore · c archive · p propose · esc cancel
```

## Risks / Trade-offs

- **Name collision risk**: If multiple extensions register commands named `opsx-verify`, pi suffixes them (`opsx-verify:1`, `opsx-verify:2`). Filtering by `c.source === "skill"` avoids matching bare extension commands, but skips `source === "prompt"` entries. A prompt-only verify (without a skill) wouldn't show. **Mitigation:** This matches the existing pattern — all other overlay actions (apply, explore, archive, propose) also use skills. A prompt without a skill is an incomplete installation.

- **Tight coupling to command name string**: If the verify command is renamed, the overlay won't detect it. **Mitigation:** The name `opsx-verify` is the stable convention; all other actions follow the same `opsx-<verb>` pattern.
