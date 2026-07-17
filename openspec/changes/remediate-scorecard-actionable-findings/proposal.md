## Why

OpenSSF Scorecard reports eight open findings for the repository. Three are directly remediable in committed files (workflow permission defaults and license detection), and the extension's untrusted CLI and Markdown input boundary warrants meaningful property-based fuzzing. The remaining findings reflect a single-maintainer operating model, external program participation, or repository age and must be documented and tracked rather than misrepresented as resolved.

## What Changes

- Harden CodeQL and publishing workflows with explicit read-only top-level `GITHUB_TOKEN` permission defaults and narrowly scoped job-level write permissions.
- Add the authoritative MIT license text at the repository root so declared package licensing is machine-detectable and unambiguous.
- Add property-based tests with `fast-check` for untrusted OpenSpec CLI payload validation, display sanitization, change-name validation, and task Markdown parsing.
- Document the single-maintainer rationale and reassessment path for Scorecard branch-protection and code-review findings, the repository-age maintenance finding, and optional OpenSSF Best Practices participation.

## Capabilities

### New Capabilities
- `input-boundary-property-testing`: Defines property-based testing of untrusted OpenSpec CLI and task-file input boundaries.
- `repository-license-identification`: Defines the authoritative, machine-detectable MIT license artifact for the distributed extension.

### Modified Capabilities
- `automated-dependency-security`: Clarifies read-only workflow defaults with job-scoped write permissions for CodeQL and publishing workflows.
- `github-repository-governance`: Documents the single-maintainer Scorecard review/protection limitations and mandatory reassessment posture for non-code findings.

## Impact

- Affects `.github/workflows/codeql.yml` and `.github/workflows/publish.yml`.
- Adds a root-level `LICENSE` and the `fast-check` development dependency with corresponding lockfile changes and property-based tests.
- Updates maintainer governance guidance; no runtime extension API or user-facing widget behavior changes.
- Requires a repository administrator/maintainer to review Scorecard results after merging, while acknowledging that independent-review and project-age signals cannot be immediately satisfied by code changes.
