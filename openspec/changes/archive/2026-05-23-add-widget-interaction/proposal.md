## Why

The OpenSpec status widget is a passive dashboard — it shows change status at a glance but offers no way to act. The user must manually type or recall prompt template commands like `/opsx-apply <change-name>`. This friction breaks flow: the widget shows you what needs attention, but you have to leave it to do anything about it.

Adding keyboard-driven interaction directly from the widget transforms it from a dashboard into a control panel, making the OpenSpec workflow faster and more fluid without adding complexity to the read-only rendering.

## What Changes

- Register a keyboard shortcut (`ctrl+alt+o`) that opens an interactive overlay showing active OpenSpec changes
- Arrow keys navigate the change list; the selected change shows a detail preview pane
- Letter keys trigger OpenSpec actions on the selected change:
  - `a` — apply (start implementing tasks)
  - `e` — explore (think through the change)
  - `c` — archive (finalize and archive)
- `p` — propose a new change (always available, even with no active changes)
- On action, the overlay closes and the editor is pre-filled with the corresponding prompt template command (e.g., `/opsx-apply my-feature`), allowing the user to add extra input before submitting
- The interactive overlay respects the empty state: when no changes exist, only `p` (propose) and `esc` (cancel) are available
- Interaction is only available when the agent is idle (no active turn processing)

## Capabilities

### New Capabilities

- `widget-interaction`: Keyboard-driven overlay for navigating and acting on OpenSpec changes from the status widget

### Modified Capabilities

<!-- None. The read-only widget requirements remain unchanged. Interaction is a new layer. -->

## Impact

- **Extension code**: New file `extension/interaction.ts` containing the overlay component and shortcut registration; `extension/index.ts` gains a shortcut registration call
- **Dependencies**: Uses `@earendil-works/pi-tui` (already available) for `matchesKey`, `Key`, and `SelectList` or custom rendering; uses existing `extension/openspec.ts` for data fetching
- **No external dependencies** added
- **No breaking changes** to the existing widget or its API
