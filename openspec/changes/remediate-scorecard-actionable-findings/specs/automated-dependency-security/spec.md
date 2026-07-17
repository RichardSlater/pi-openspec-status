## MODIFIED Requirements

### Requirement: CodeQL source analysis
The repository SHALL run CodeQL analysis for JavaScript/TypeScript on pull requests, protected-branch pushes, and a recurring schedule. The workflow SHALL declare a read-only top-level `GITHUB_TOKEN` permission default and grant `security-events: write` only to the analysis job that publishes CodeQL results to GitHub code scanning when the repository supports result upload.

#### Scenario: CodeQL finds a source-code issue
- **WHEN** CodeQL detects a security or quality finding in the extension source
- **THEN** the finding is available to maintainers through the workflow result or GitHub code-scanning interface
- **AND** the workflow's other jobs do not inherit `security-events: write`

## ADDED Requirements

### Requirement: Explicit workflow permission defaults
Each repository workflow that does not require global write access SHALL declare an explicit read-only top-level `GITHUB_TOKEN` permission default. A job requiring a write capability for a defined action, including code-scanning result upload or npm provenance publication, SHALL declare only that capability at job scope.

#### Scenario: A publishing workflow runs
- **WHEN** a release tag triggers package publishing
- **THEN** build and validation run with the workflow's read-only default permissions
- **AND** only the package publication job receives the OIDC token permission required for npm provenance publishing
