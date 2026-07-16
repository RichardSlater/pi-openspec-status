## ADDED Requirements

### Requirement: Safe editor action construction
The overlay SHALL construct apply, verify, explore, and archive editor commands only from a change identifier that has passed the extension's identifier validation. It SHALL never insert unvalidated CLI-derived text into the editor.

#### Scenario: Selected change has an invalid identifier
- **WHEN** an overlay action is requested for a change name that fails identifier validation
- **THEN** the overlay SHALL not pre-fill an OpenSpec action command
- **AND** the extension SHALL notify the user that the change data is invalid

#### Scenario: Selected change has a valid identifier
- **WHEN** the user selects a valid change identifier and presses an available action key
- **THEN** the overlay SHALL pre-fill only the expected slash command followed by that validated identifier
- **AND** the editor text SHALL contain no additional CLI-derived lines or commands

### Requirement: Safe interactive display text
The overlay SHALL use sanitized display text for all externally derived change, schema, artifact, task-group, and error values.

#### Scenario: Change name contains a control sequence
- **WHEN** the overlay receives a change name containing terminal control characters
- **THEN** the overlay SHALL not render the unsanitized sequence
- **AND** navigation, selection, and action hints SHALL remain visually intact