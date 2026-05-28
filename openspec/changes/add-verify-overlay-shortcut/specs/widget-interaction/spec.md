## MODIFIED Requirements

### Requirement: Letter key actions on selected change
The user SHALL trigger OpenSpec prompt templates by pressing a single letter key while the overlay is open. The verify action key SHALL only be active when the `opsx-verify` command is registered in the current pi session (detected via `pi.getCommands()`).

#### Scenario: Apply action on selected change
- **WHEN** the user presses `a` while a change is selected
- **THEN** the overlay closes and the editor is pre-filled with `/opsx-apply <change-name>`

#### Scenario: Verify action on selected change when available
- **WHEN** the user presses `v` while a change is selected AND `opsx-verify` is registered via `pi.getCommands()`
- **THEN** the overlay closes and the editor is pre-filled with `/opsx-verify <change-name>`

#### Scenario: Verify key ignored when not available
- **WHEN** the user presses `v` while a change is selected AND `opsx-verify` is NOT registered
- **THEN** the keypress is ignored (no action taken, overlay remains open)

#### Scenario: Explore action on selected change
- **WHEN** the user presses `e` while a change is selected
- **THEN** the overlay closes and the editor is pre-filled with `/opsx-explore <change-name>`

#### Scenario: Archive action on selected change
- **WHEN** the user presses `c` while a change is selected
- **THEN** the overlay closes and the editor is pre-filled with `/opsx-archive <change-name>`

### Requirement: Action hints displayed
The overlay SHALL display a hint bar showing available action keys and their functions. The verify hint SHALL only appear when the `opsx-verify` command is registered (detected via `pi.getCommands()`).

#### Scenario: Full hint bar with changes (verify available)
- **WHEN** the overlay is open, active changes exist, AND `opsx-verify` is registered
- **THEN** the hint bar shows "a apply · v verify · e explore · c archive · p propose new · esc cancel"

#### Scenario: Full hint bar with changes (verify unavailable)
- **WHEN** the overlay is open, active changes exist, AND `opsx-verify` is NOT registered
- **THEN** the hint bar shows "a apply · e explore · c archive · p propose new · esc cancel"

#### Scenario: Empty state hint bar
- **WHEN** the overlay is open and no active changes exist
- **THEN** the hint bar shows "p propose new · esc cancel" with other action labels shown in muted/dim style
