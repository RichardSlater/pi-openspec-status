## ADDED Requirements

### Requirement: Grouped and cooled-down dependency updates
The repository SHALL configure Dependabot for npm and GitHub Actions updates on a regular schedule, group compatible updates by ecosystem, limit concurrently open update pull requests, and enforce a five-day update cooldown/minimum release age where the selected ecosystem supports Dependabot's native configuration.

#### Scenario: Routine npm updates are available
- **WHEN** Dependabot detects compatible npm dependency updates that satisfy the configured five-day minimum age
- **THEN** it creates or updates a grouped npm pull request within the configured open-pull-request limit

#### Scenario: Recently published dependency update is detected
- **WHEN** Dependabot detects an eligible update that is less than five days old in an ecosystem supporting the cooldown configuration
- **THEN** Dependabot does not propose that update until the configured cooldown has elapsed

### Requirement: Pull-request verification
The repository SHALL run a verification workflow on pull requests and protected-branch pushes that installs dependencies without lifecycle scripts and executes the package's type checking, linting, and test commands.

#### Scenario: Pull request passes repository checks
- **WHEN** a pull request triggers the verification workflow
- **THEN** the workflow runs `npm ci --ignore-scripts`, type checking, linting, and tests with read-only repository access

### Requirement: Dependency change review
The repository SHALL run GitHub dependency review for pull requests that change dependency manifests or lockfiles and SHALL surface newly introduced vulnerable dependencies according to the configured fail policy.

#### Scenario: Pull request introduces a vulnerable dependency
- **WHEN** dependency review identifies a newly introduced dependency that violates the configured vulnerability policy
- **THEN** the dependency-review check reports the violation and prevents a successful verification result

### Requirement: CodeQL source analysis
The repository SHALL run CodeQL analysis for JavaScript/TypeScript on pull requests, protected-branch pushes, and a recurring schedule, and SHALL publish results to GitHub code scanning when the repository supports result upload.

#### Scenario: CodeQL finds a source-code issue
- **WHEN** CodeQL detects a security or quality finding in the extension source
- **THEN** the finding is available to maintainers through the workflow result or GitHub code-scanning interface

### Requirement: OpenSSF Scorecard monitoring
The repository SHALL run OpenSSF Scorecard on a recurring schedule and protected-branch pushes, using the action's documented least-privilege permissions and publishing the resulting assessment for maintainer review.

#### Scenario: Scheduled repository posture assessment runs
- **WHEN** the configured Scorecard schedule occurs
- **THEN** Scorecard evaluates the repository and makes its results available to maintainers
