## 1. Type Definition

- [x] 1.1 Add `{ type: "verify"; changeName: string }` variant to `OverlayAction` union type in `extension/types.ts`

## 2. Overlay Component

- [x] 2.1 Add `hasVerify: boolean` parameter to `OpenSpecOverlay` constructor in `extension/overlay.ts`
- [x] 2.2 Update `renderHintBar()` to conditionally include `v verify` entry between apply and explore when `hasVerify` is true
- [x] 2.3 Update `handleInput()` to accept `"v"` keystroke and dispatch `{ type: "verify", changeName }` when `hasVerify` is true and a change is selected

## 3. Interaction Orchestration

- [x] 3.1 Call `pi.getCommands()` in the shortcut handler in `extension/interaction.ts` and check if any command named `opsx-verify` with `source === "skill"` exists
- [x] 3.2 Pass `hasVerify` boolean to `OpenSpecOverlay` constructor
- [x] 3.3 Add `case "verify"` to the action dispatch switch to call `ctx.ui.setEditorText("/opsx-verify ${actionResult.changeName}")`

## 4. Verification

- [x] 4.1 Manually test with verify skill installed: confirm `v` hint appears and dispatches `/opsx-verify <change-name>`
- [x] 4.2 Manually test without verify skill: confirm `v` hint does NOT appear and hint bar matches existing layout
- [x] 4.3 Verify existing hotkeys (`a`, `e`, `c`, `p`, `esc`, arrows) all continue to work correctly
