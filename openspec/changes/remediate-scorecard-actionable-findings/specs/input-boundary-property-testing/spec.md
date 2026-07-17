## ADDED Requirements

### Requirement: Property-based testing of untrusted input boundaries
The repository SHALL execute property-based tests through its standard test command using a directly imported, maintained JavaScript/TypeScript property-testing library. The tests SHALL exercise arbitrary strings and JSON-like values at the OpenSpec CLI validation, display sanitization, change-name validation, and task Markdown parsing boundaries.

#### Scenario: Arbitrary CLI payload is validated
- **WHEN** a generated JSON-like value is supplied to a CLI summary or detail validator
- **THEN** validation does not throw
- **AND** it returns either `null` or a value satisfying the documented structural and counter invariants

#### Scenario: Arbitrary display text is sanitized
- **WHEN** a generated string containing ordinary Unicode, terminal controls, or directional controls is supplied to display sanitization
- **THEN** sanitization does not throw
- **AND** the result is bounded to the documented display length
- **AND** the result contains no terminal or directional controls accepted as unsafe by the display boundary

#### Scenario: Arbitrary task Markdown is parsed
- **WHEN** generated Markdown-like text is supplied to the task-group parser
- **THEN** parsing does not throw
- **AND** every returned group has non-negative counters with completed tasks no greater than total tasks
- **AND** each returned status agrees with its counters

### Requirement: Reproducible property-test failures
The property-test configuration SHALL use bounded generation and a documented stable run count suitable for the repository's normal verification workflow. A failing generated case SHALL retain the property-testing framework's reproduction information in test output.

#### Scenario: A generated counterexample fails a property
- **WHEN** a property-based assertion fails in local or CI verification
- **THEN** the test command fails
- **AND** its output identifies the generated counterexample and framework reproduction data needed to rerun it
