## MODIFIED Requirements

### Requirement: Single change display
When exactly one active change exists, the widget SHALL render three lines showing detailed information.

#### Scenario: Single active change with full artifacts
- **WHEN** one active change named "add-auth" has all artifacts done (proposal, design, specs, tasks) and 3 of 7 tasks completed
- **THEN** line 1 shows the change name, schema name, and an overall status icon (✓ for complete, ◷ for in-progress)
- **AND** line 2 shows each artifact name with a status icon (● done, ○ ready, ◌ blocked), separated by at least one space
- **AND** line 3 shows a task progress bar with completed/total count
