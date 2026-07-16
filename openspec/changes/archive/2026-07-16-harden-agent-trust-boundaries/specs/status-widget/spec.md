## ADDED Requirements

### Requirement: Validated OpenSpec status data
The extension SHALL validate OpenSpec CLI summaries and status details before using them for state, filesystem access, command construction, or rendering. Change identifiers SHALL conform to the documented supported identifier grammar and SHALL reject path separators, traversal segments, control characters, bidirectional controls, and leading or trailing whitespace.

#### Scenario: CLI returns a traversal-style change name
- **WHEN** `openspec list --json` returns a change name containing `../` or a path separator
- **THEN** the extension SHALL not use that name for status lookup, task-file access, state keys, rendering, or actions
- **AND** the extension SHALL surface a bounded safe error state

#### Scenario: CLI returns malformed status data
- **WHEN** a CLI response has an invalid identifier, artifact status, or task counter
- **THEN** the extension SHALL reject the malformed entry rather than rendering or acting on it
- **AND** the extension SHALL retain any last known safe widget state when available

### Requirement: Safe rendering of external status text
Before terminal rendering, the extension SHALL sanitize CLI-derived change names, schema names, artifact identifiers, task-group names, and error messages into bounded plain display text. Sanitization SHALL remove terminal escape sequences, C0/C1 controls, line controls, and Unicode bidirectional formatting controls before Pi theme styling is applied.

#### Scenario: CLI returns terminal control sequences
- **WHEN** a CLI-derived label contains ANSI, OSC, carriage-return, newline, or bidirectional control sequences
- **THEN** the widget and overlay SHALL render only the sanitized plain-text representation
- **AND** the supplied value SHALL not create, hide, overwrite, or reorder visible UI content

### Requirement: Workflow-completion semantics
The widget SHALL describe OpenSpec completion as workflow or artifact completion and SHALL not represent it as a security review, test result, or independent verification.

#### Scenario: Change is reported complete
- **WHEN** OpenSpec reports `isComplete: true`
- **THEN** the widget SHALL present the completed workflow state
- **AND** the widget SHALL not claim that tests, verification, or security review succeeded