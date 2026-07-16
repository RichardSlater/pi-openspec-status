## Why

The repository has only a publishing workflow and lacks the baseline governance, automated dependency maintenance, security scanning, and policy documentation expected of a maintained public GitHub project. Establishing these safeguards now makes contributions and releases safer while providing a measurable, repeatable security posture.

## What Changes

- Add repository governance files, including contribution guidance, a security vulnerability reporting policy, and GitHub issue and pull-request templates.
- Configure Dependabot for grouped GitHub Actions and npm dependency updates with a five-day cooldown, sensible scheduling, and review-friendly grouping.
- Add GitHub Actions workflows that verify installs, linting, type checking, tests, builds, and package metadata on pull requests and relevant pushes.
- Add CodeQL analysis for JavaScript/TypeScript and dependency-review checks for pull requests.
- Add an OpenSSF Scorecard workflow and public scorecard badge to continuously assess repository security practices.
- Add standard GitHub repository recommendations such as CODEOWNERS, repository settings guidance, and release/security hygiene documentation where supported by version-controlled files.

## Capabilities

### New Capabilities
- `github-repository-governance`: Defines the version-controlled repository governance policies, contribution paths, and GitHub collaboration templates.
- `automated-dependency-security`: Defines automated dependency update, verification, static analysis, dependency review, and OpenSSF Scorecard protections for the repository.

### Modified Capabilities

- None.

## Impact

- Adds files under `.github/` and root-level governance documentation such as `SECURITY.md`.
- Extends CI coverage beyond the existing publishing workflow and introduces GitHub-maintained security actions.
- Adds Dependabot-authored pull requests and GitHub security findings that maintainers must review and triage.
- May require repository-level configuration for branch protection, security features, CODEOWNERS enforcement, and secret-free workflow permissions; accompanying guidance will document these settings.
