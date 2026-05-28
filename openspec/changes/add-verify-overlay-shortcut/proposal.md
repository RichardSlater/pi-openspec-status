## Why

The overlay currently surfaces four OpenSpec actions via hotkeys: apply (`a`), explore (`e`), archive (`c`), and propose (`p`). With the introduction of the verify workflow (invoked via `/opsx-verify`), users need a way to launch verification from the overlay without typing the full command. Adding a `v` hotkey provides parity with the other actions and streamlines the verify-before-archive flow.

## What Changes

- **Add `v` hotkey to the overlay** dispatching `/opsx-verify <change-name>`, only when the verify command is registered in the current pi session
- **Conditional rendering**: The `v` hint in the overlay's action bar only appears when `pi.getCommands()` includes `opsx-verify`
- **New `OverlayAction` variant**: `{ type: "verify"; changeName: string }` added to the action union type
- **Detection mechanism**: Use `pi.getCommands()` (synchronous, zero-I/O) instead of filesystem checks — this is the canonical way to determine command availability and handles user/project/package scope correctly

## Capabilities

### New Capabilities
<!-- No new capabilities — this extends existing interaction patterns -->

### Modified Capabilities
- `widget-interaction`: The overlay now conditionally renders a `v verify` hint and handles the `v` keystroke. The `OverlayAction` type and dispatch logic gain a `verify` variant.

## Impact

- **extension/types.ts**: `OverlayAction` union type gains `{ type: "verify"; changeName: string }`
- **extension/overlay.ts**: `OpenSpecOverlay` constructor receives `hasVerify: boolean`; `renderHintBar()` conditionally includes `v verify`; `handleInput()` accepts `"v"` for selected change
- **extension/interaction.ts**: calls `pi.getCommands()` to detect `opsx-verify` availability, passes result to `OpenSpecOverlay`, dispatches verify action to `ctx.ui.setEditorText("/opsx-verify ...")`
