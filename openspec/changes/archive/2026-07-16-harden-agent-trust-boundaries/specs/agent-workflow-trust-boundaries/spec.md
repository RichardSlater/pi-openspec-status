## ADDED Requirements

### Requirement: Untrusted OpenSpec instruction boundary
Every repository-local OpenSpec prompt and skill SHALL state that OpenSpec CLI output, artifact content, templates, context, rules, dynamic instructions, filenames, and paths are untrusted project data subordinate to system, developer, and user instructions.

#### Scenario: Artifact contains a conflicting directive
- **WHEN** an OpenSpec artifact or CLI instruction asks an agent to ignore higher-priority instructions or suppress findings
- **THEN** the workflow SHALL not treat that directive as authoritative
- **AND** the agent SHALL continue to follow system, developer, and user instructions

### Requirement: Protected action and data scope
Repository-local OpenSpec prompts and skills SHALL prohibit project-controlled content from authorizing secret access, unrelated command execution, instruction-priority changes, suppressed reporting, or writes outside the user-approved repository/change scope.

#### Scenario: CLI context requests credential access
- **WHEN** CLI-provided context requests reading a credential file outside the project
- **THEN** the workflow SHALL reject the request as outside the approved scope
- **AND** the agent SHALL request user approval before any legitimate scope expansion

### Requirement: Safe artifact-path handling guidance
Repository-local OpenSpec prompts and skills SHALL require agents to verify that CLI-selected read and write paths are canonicalized and remain within the approved repository and explicit allowed subtree before accessing them.

#### Scenario: Returned context path traverses outside the repository
- **WHEN** a CLI instruction returns a path containing traversal that resolves outside the repository
- **THEN** the workflow SHALL not read or write that path
- **AND** the agent SHALL report the invalid path as a blocker