## Context

The status widget (`extension/widget.ts`) renders a read-only display of active OpenSpec changes above the pi editor using `ctx.ui.setWidget()`. It has no keyboard input handling.

Pi's TUI system provides two relevant patterns:
- **`setWidget()`** — for persistent, non-interactive displays (currently used)
- **`ctx.ui.custom()` with `{ overlay: true }`** — for temporary interactive overlays that take keyboard focus (used by pi's model selector, session picker, etc.)

The user wants to bridge these: keep the passive widget, but add a keyboard shortcut that opens an interactive overlay for acting on changes. The overlay should navigate changes with arrow keys, trigger OpenSpec prompt templates with letter keys, and pre-fill the editor on selection.

The existing `extension/openspec.ts` data layer already fetches `ChangeSummary[]` and `Map<string, ChangeDetail>` — the overlay can reuse this directly.

## Goals / Non-Goals

**Goals:**
- Register a keyboard shortcut that opens an interactive overlay listing active changes
- Arrow key navigation with a selected change highlighted
- Detail preview pane showing artifact/task status for the selected change
- Letter keys `a`/`e`/`c` trigger actions on the selected change; `p` always available for new proposals
- Pre-fill editor with the appropriate prompt template command on action
- Respect the empty state (no active changes)
- Only allow interaction when the agent is idle

**Non-Goals:**
- Modifying the read-only widget rendering or its refresh behavior
- Editing artifacts or tasks from the overlay (actions delegate to prompt templates)
- Displaying archived changes
- Keyboard shortcuts for the individual actions (these are handled by the overlay's letter keys)
- Supporting interaction during active agent processing

## Decisions

### Architecture: Overlay, not widget modification

**Decision**: Keep the existing `setWidget()` for the read-only dashboard. Add a separate overlay component opened via `pi.registerShortcut()`.

**Alternatives considered**:
- **Make the widget itself interactive**: Would require replacing `setWidget` with `ctx.ui.custom()`, losing the persistent-above-editor placement. Would need a focus-toggle mechanism between editor and widget, adding complexity. Arrow key conflicts with editor cursor movement.
- **Register individual shortcuts per action**: Four separate shortcuts (`ctrl+shift+a`, etc.) is discoverability-poor and doesn't leverage the widget's visual context.

**Rationale**: The overlay pattern is well-established in pi (model selector, session picker). It cleanly separates concerns: the widget is a dashboard, the overlay is a control panel you summon on demand.

### File architecture

```
extension/
├── index.ts          # Gains shortcut registration call
├── interaction.ts    # NEW: Overlay component + shortcut handler
├── openspec.ts       # Unchanged (reused for data fetching)
├── widget.ts         # Unchanged
└── types.ts          # Unchanged (existing types are sufficient)
```

**Rationale**: `interaction.ts` is a new, self-contained module. It imports from `openspec.ts` for data and from `types.ts` for type definitions. `index.ts` only needs to call the registration function from `interaction.ts`. This keeps the interaction logic isolated and testable.

### Shortcut key

**Decision**: Use `ctrl+alt+o` (mnemonic: OpenSpec).

**Alternatives considered**:
- `ctrl+o`: Already bound to `app.tools.expand` in pi
- `ctrl+shift+o`: Conflicts with terminal pane split keybinding in many terminals
- `ctrl+g`: Already bound to `app.editor.external`

**Rationale**: `ctrl+alt+o` is available and doesn't conflict with any built-in pi binding or common terminal shortcuts.

### Overlay component structure

```
┌────────────────────────────────────────────┐
│  DynamicBorder (top)                       │
│  Title: "OpenSpec Actions"                 │
│                                            │
│  ── Change List ─────────────────────────  │
│  > ◷ my-feature    P● D● S● T○   3/7     │  ← selected row, highlighted
│    ✗ bugfix        P● D◌ S○ T○   0/0     │
│                                            │
│  ── Preview Pane ────────────────────────  │
│  ◷ my-feature (spec-driven)               │
│  Artifacts: proposal● design● specs● T○   │
│  Tasks: ████████░░ 3/7                     │
│                                            │
│  ── Actions ─────────────────────────────  │
│  a apply  ·  e explore  ·  c archive      │
│  p propose new  ·  esc cancel              │
│                                            │
│  DynamicBorder (bottom)                    │
└────────────────────────────────────────────┘
```

**Decision**: Build a custom component (not reuse `SelectList`) because we need custom key handling for letter keys and a preview pane that `SelectList` doesn't support out of the box.

**Alternatives considered**:
- **SelectList with key interception**: Wrap SelectList and intercept a/e/c/p keys, passing only arrows/enter/escape to SelectList. This is fragile — if SelectList's key handling changes, the interception breaks. And the preview pane would need to be a separate component composed alongside SelectList, creating layout complexity.
- **Full custom component**: More code upfront but simpler long-term maintenance and full control over rendering and input.

**Rationale**: The custom component is ~150-200 lines of straightforward code. Reusing the existing widget rendering functions for the preview pane keeps code DRY.

### Reusing widget rendering

The preview pane in the overlay renders the same information as the single-change widget mode. Rather than duplicating rendering logic, the overlay imports `renderSingleChange` from `widget.ts` and renders it within the preview pane area.

The change list rows reuse the per-change rendering pattern from `renderMultiChange` but with an added selection indicator (`> ` prefix for the selected row).

### Pre-fill mechanism

**Decision**: Use `ctx.ui.setEditorText(text)` to pre-fill the editor. The overlay closes first, then the editor is set.

**Action → pre-fill mapping**:

| Key | Action | Pre-filled text |
|-----|--------|-----------------|
| `a` | Apply | `/opsx-apply <change-name>` |
| `e` | Explore | `/opsx-explore <change-name>` |
| `c` | Archive | `/opsx-archive <change-name>` |
| `p` | Propose | `/opsx-propose ` (blank change name, cursor at end) |

**Rationale**: Pre-filling lets the user review, add context, or cancel before submitting. It's the simplest integration point — no need to programmatically trigger agent turns or inject messages.

### Idle check

**Decision**: In the shortcut handler, check `ctx.isIdle()`. If the agent is processing, show a notification and return without opening the overlay.

**Rationale**: The overlay interaction is a user-driven action. During agent processing, the user might press the shortcut accidentally, and changing the editor text mid-turn could cause unexpected behavior.

### Empty state

When no active changes exist, the overlay shows:
- "No active OpenSpec changes" message
- Only `p` (propose new) and `esc` (cancel) as available actions
- Other action keys are shown in muted/dim style to indicate unavailability

### When only one change exists

The overlay still shows a list (of 1 item). The change is pre-selected. Arrow keys are no-ops. The preview pane shows the same detail as the single-change widget. All action keys except `p` act on that change.

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| `ctx.ui.setEditorText()` may not work on all pi versions | Document the minimum pi version. The API is stable and used by other extensions (plan-mode). |
| Overlay renders stale data if CLI hasn't refreshed | Fetch fresh data when the overlay opens via the existing `fetchActiveChanges()` function. |
| Arrow key handling conflicts with SelectList-like components | Since we're building a custom component, we control all key handling. No conflict. |
| Pre-filling editor might surprise users who had content typed | Acceptable trade-off. The shortcut is a deliberate action, and the user can still edit the pre-filled text. |
| Shortcut collisions with user customizations | The shortcut can be changed via `keybindings.json` like any other pi keybinding. Document the binding ID. |

## Open Questions

- None at this stage — the design emerged from the exploration session and covers all decision points.
