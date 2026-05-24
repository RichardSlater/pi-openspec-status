## MODIFIED Requirements

### Requirement: Preview pane for selected change
The overlay SHALL display a preview pane showing detailed information about the currently selected change, including schema name, artifact statuses with full names, and task progress.

#### Scenario: Preview pane shows selected change details
- **WHEN** a change is selected in the overlay
- **THEN** the preview pane shows the change name, schema name, artifact statuses with full names and colored icons
- **AND** the preview pane shows task group progress when task group data is available, with each group on its own line showing the group name, completion count, and a status icon (● complete, ◷ partial, ○ not started)
- **AND** the preview pane falls back to a flat task progress bar with completed/total count when task group data is unavailable

#### Scenario: Preview pane updates on selection change
- **WHEN** the user navigates from one change to another
- **THEN** the preview pane updates to show details for the newly selected change, including task group progress or flat fallback as appropriate
