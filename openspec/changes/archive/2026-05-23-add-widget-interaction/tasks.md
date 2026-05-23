## 1. Module setup

- [x] 1.1 Create `extension/interaction.ts` with the `OpenSpecOverlay` component class skeleton
- [x] 1.2 Export a `registerInteractionShortcut(pi: ExtensionAPI)` function from `interaction.ts`
- [x] 1.3 Call `registerInteractionShortcut` from `extension/index.ts`

## 2. Overlay rendering

- [x] 2.1 Implement change list row rendering with status icon, name, artifact initials, and task counter (reuse `renderMultiChange` patterns from `widget.ts`)
- [x] 2.2 Implement visual selection highlight using theme accent colors (e.g., `> ` prefix + accent foreground for selected row)
- [x] 2.3 Implement preview pane rendering showing full artifact names and task progress bar for the selected change (reuse `renderSingleChange` from `widget.ts`)
- [x] 2.4 Implement action hint bar showing available keys at the bottom of the overlay
- [x] 2.5 Add `DynamicBorder` framing and a themed title ("OpenSpec Actions")
- [x] 2.6 Implement render caching (cache by width, invalidate on state change)

## 3. Keyboard input handling

- [x] 3.1 Implement up/down arrow key navigation with boundary clamping (no wrap-around)
- [x] 3.2 Implement `a` key handler: close overlay, pre-fill editor with `/opsx-apply <change-name>`
- [x] 3.3 Implement `e` key handler: close overlay, pre-fill editor with `/opsx-explore <change-name>`
- [x] 3.4 Implement `c` key handler: close overlay, pre-fill editor with `/opsx-archive <change-name>`
- [x] 3.5 Implement `p` key handler: close overlay, pre-fill editor with `/opsx-propose ` (no change name)
- [x] 3.6 Implement `escape` key handler: close overlay without modifying editor
- [x] 3.7 Call `tui.requestRender()` after each input-triggered state change

## 4. Shortcut registration and idle check

- [x] 4.1 Register `ctrl+alt+o` shortcut via `pi.registerShortcut()` in the registration function
- [x] 4.2 Implement `ctx.isIdle()` check — if not idle, show a notification via `ctx.ui.notify()` and return without opening overlay
- [x] 4.3 Fetch fresh change data via `fetchActiveChanges(pi)` when shortcut fires
- [x] 4.4 Open the overlay via `ctx.ui.custom()` with `{ overlay: true }`

## 5. Edge cases

- [x] 5.1 Handle empty state: when `changes.length === 0`, render "No active OpenSpec changes" message and only show `p`/`esc` as available actions
- [x] 5.2 Handle single-change state: pre-select the only change, arrow keys are no-ops
- [x] 5.3 Handle CLI fetch errors in the overlay: display an error indicator instead of the change list
- [x] 5.4 Handle `p` key when no changes exist (pre-fill `/opsx-propose `, no change name needed)

## 6. Polish

- [x] 6.1 Dim/mute unavailable action keys in the hint bar when in empty state (only `p` and `esc` are active)
- [x] 6.2 Ensure overlay adapts to narrow terminal widths (truncate change names, use compact layout)
- [x] 6.3 Test overlay with theme changes (proper `invalidate()` implementation)
