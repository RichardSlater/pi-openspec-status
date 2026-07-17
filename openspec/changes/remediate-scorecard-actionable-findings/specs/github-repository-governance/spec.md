## ADDED Requirements

### Requirement: Scorecard governance limitation and reassessment guidance
The repository SHALL document Scorecard findings that cannot be immediately resolved by committed files or a single-maintainer operating model. The guidance SHALL distinguish existing branch safeguards from unavailable independent-review evidence, identify the repository-age maintenance assessment as time-bound, and identify OpenSSF Best Practices enrollment as an optional external governance initiative.

#### Scenario: A maintainer reviews unresolved Scorecard alerts
- **WHEN** a Scorecard alert concerns independent approval history, reviewer availability, repository age, or external program participation
- **THEN** maintainer guidance explains why it remains unresolved
- **AND** it identifies the condition or review point required to reassess it
- **AND** it does not claim that a code-only change resolves the alert

#### Scenario: Independent maintainers become available
- **WHEN** the project gains sufficient independent maintenance capacity
- **THEN** maintainers reassess branch-review requirements, CODEOWNERS enforcement, stale-review dismissal, and last-push approval before changing repository rules
