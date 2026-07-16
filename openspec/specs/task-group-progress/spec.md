## Purpose

Provide accurate, readable OpenSpec task-group progress in the overlay while preserving the flat fallback when no groups are available.
## Requirements
### Requirement: Task group progress data
The extension SHALL parse `tasks.md` from each active change's directory to extract task groups — `##`-headed sections with their checkbox completion status.

#### Scenario: tasks.md with heading groups
- **WHEN** a change's `tasks.md` contains `## 1. Data layer` followed by three tasks (all `- [x]`) and `## 2. Widget rendering` followed by four tasks (two `- [x]`, two `- [ ]`)
- **THEN** the parser produces two groups: "1. Data layer" with `completed: 3, total: 3` and "2. Widget rendering" with `completed: 2, total: 4`

#### Scenario: tasks.md with no `##` headings
- **WHEN** a change's `tasks.md` contains checkbox tasks but no `##`-level headings
- **THEN** the parser indicates no groups were found, triggering the flat fallback display

#### Scenario: tasks.md does not exist or is empty
- **WHEN** a change has no `tasks.md` file or the file is empty
- **THEN** the parser returns an empty group list, triggering the flat fallback display

#### Scenario: tasks.md has content before the first heading
- **WHEN** `tasks.md` has text or an unchecked preview at the top before the first `##` heading
- **THEN** the parser skips pre-heading content and groups tasks under their respective `##` sections only

#### Scenario: tasks.md parse error
- **WHEN** reading or parsing `tasks.md` throws an error
- **THEN** the parser catches the error and returns empty, triggering the flat fallback display

### Requirement: Task group rendering in overlay preview pane
The overlay preview pane SHALL display task group progress for the selected change instead of the flat `apply:` suffixed task line.

#### Scenario: Multiple task groups
- **WHEN** a change has three task groups ("Data layer" 5/5 done, "Rendering" 2/4 partial, "Testing" 0/3 not started)
- **THEN** the preview pane shows each group on its own line with a status icon: `● Data layer: 5/5`, `◷ Rendering: 2/4`, `○ Testing: 0/3`
- **AND** each line is indented under an "Tasks:" header line
- **AND** the status icons use the existing theme color conventions (success for done, accent for partial, muted for not started)

#### Scenario: Single task group
- **WHEN** a change has only one task group
- **THEN** the group is displayed the same way as in the multi-group case — consistent rendering regardless of group count

#### Scenario: No task groups (flat fallback)
- **WHEN** no `tasks.md` exists, no headings found, or parsing fails
- **THEN** the preview pane shows the flat fallback line: `Tasks: ████░░░░░░ 3/7` with no `apply:` suffix

#### Scenario: Group rendering adapts to narrow terminals
- **WHEN** the overlay width is narrow
- **THEN** group names are truncated to fit, and progress counters are preserved

### Requirement: Group status indicators
Each task group SHALL be displayed with a status icon indicating its completion level, consistent with existing artifact icon conventions.

#### Scenario: Complete group
- **WHEN** a group has all tasks completed (`completed === total && total > 0`)
- **THEN** it displays `●` in theme success color

#### Scenario: Partially complete group
- **WHEN** a group has some but not all tasks completed (`completed > 0 && completed < total`)
- **THEN** it displays `◷` in theme accent color

#### Scenario: Not started group
- **WHEN** a group has no tasks completed (`completed === 0`)
- **THEN** it displays `○` in theme muted color

#### Scenario: Empty group (no tasks)
- **WHEN** a group has zero tasks (`total === 0`)
- **THEN** it displays `—` in theme muted color and the text "no tasks" instead of a counter

### Requirement: Bounded task-group presentation
The task-group parser and overlay SHALL treat group names and task-file content as untrusted display input. Group names SHALL be sanitized and bounded before display, and group counts SHALL only represent the documented supported checkbox syntax.

#### Scenario: Task heading contains visual control characters
- **WHEN** a `##` task-group heading contains terminal escape, line-control, or bidirectional formatting characters
- **THEN** the overlay SHALL display only a sanitized bounded group name
- **AND** the heading SHALL not alter other task-group lines or UI controls

#### Scenario: Unsupported checkbox-like syntax is present
- **WHEN** `tasks.md` contains checkbox-like lines outside the parser's documented supported syntax
- **THEN** the extension SHALL not count those lines as completed tasks
- **AND** task-group presentation and documentation SHALL not imply that the recognized count is a complete audit of all task-like content

### Requirement: Progress is not verification
Task-group completion presentation SHALL communicate tracked OpenSpec progress only and SHALL not represent completed checkboxes as code verification, testing, or security review.

#### Scenario: All recognized tasks are checked
- **WHEN** every recognized checkbox in a task group is complete
- **THEN** the overlay SHALL show the group as complete progress
- **AND** it SHALL not claim that the group was tested, verified, or security reviewed
