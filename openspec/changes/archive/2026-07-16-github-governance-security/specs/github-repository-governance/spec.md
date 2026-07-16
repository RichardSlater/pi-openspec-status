## ADDED Requirements

### Requirement: Security vulnerability reporting policy
The repository SHALL publish a root-level `SECURITY.md` that identifies supported release expectations, a private vulnerability reporting path, maintainer response expectations, and guidance not to disclose unpatched vulnerabilities publicly.

#### Scenario: Researcher locates the disclosure process
- **WHEN** a security researcher opens the repository's Security policy view or root documentation
- **THEN** they can find a private reporting path and instructions for responsible disclosure

### Requirement: Contributor and collaboration guidance
The repository SHALL provide version-controlled contribution guidance and pull-request and issue templates that request reproducible information, expected verification, and respectful collaboration.

#### Scenario: Contributor opens a pull request
- **WHEN** a contributor opens a pull request
- **THEN** GitHub presents a template that asks for a change summary, validation evidence, and any security or release impact

### Requirement: Maintainer ownership and GitHub settings guidance
The repository SHALL define a `CODEOWNERS` policy and document the GitHub UI settings administrators MUST configure, including protected-branch rules, required verification status checks, security-alert triage, private vulnerability reporting, secret scanning, and push protection where available.

#### Scenario: Administrator configures repository protections
- **WHEN** an administrator follows the repository maintenance guidance
- **THEN** they can identify the required GitHub settings that cannot be enforced solely by committed files

### Requirement: Secure workflow configuration
All newly introduced GitHub Actions workflows SHALL use least-privilege job permissions, avoid repository secrets for pull-request validation, and pin third-party actions to immutable full commit SHAs.

#### Scenario: Pull-request workflow runs from a fork
- **WHEN** a pull request from an untrusted fork triggers a repository workflow
- **THEN** the workflow runs without write permissions or publishing credentials
