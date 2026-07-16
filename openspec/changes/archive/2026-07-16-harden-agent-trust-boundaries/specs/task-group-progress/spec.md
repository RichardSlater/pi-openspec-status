## ADDED Requirements

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