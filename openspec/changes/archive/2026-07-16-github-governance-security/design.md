## Context

This TypeScript pi extension publishes to npm through a tag-triggered workflow. Its existing release workflow already uses pinned action commits, least-privilege job permissions, `npm ci --ignore-scripts`, and the repository's `typecheck`, `lint`, and `test` scripts. It does not yet define a security reporting channel, contributor process, automated update policy, pull-request verification workflow, CodeQL analysis, dependency review, or continuous OpenSSF Scorecard assessment.

The change must protect a small npm package without adding secrets or weakening its existing trusted-publishing release path. Version-controlled configuration can establish a secure baseline; settings that GitHub stores outside the repository must be documented for maintainers to enable.

## Goals / Non-Goals

**Goals:**

- Make dependency updates predictable and reviewable with grouped npm and GitHub Actions Dependabot pull requests and a five-day cooldown.
- Verify the package in a separate, read-only CI workflow before changes merge.
- Add complementary dependency, source-code, and repository-practice security checks using GitHub-native tooling.
- Publish clear contribution, disclosure, ownership, and repository-settings guidance without exposing secrets or private contact details.
- Preserve the existing tag-based npm publishing workflow and its security controls.

**Non-Goals:**

- Replacing branch-protection, secret scanning, or private vulnerability reporting settings that must be configured in the GitHub UI.
- Guaranteeing that third-party action commit SHAs remain current; Dependabot will propose updates for review.
- Adding runtime telemetry, application authentication, or a new release process.
- Automatically merging security or dependency pull requests.

## Decisions

### Keep governance and automation version-controlled under standard GitHub paths

Add GitHub-recognized files under `.github/` for Dependabot, workflows, templates, ownership, and maintainership guidance; add `SECURITY.md` at the repository root. Use issue forms/templates and a pull-request template to collect reproducible reports, contributor expectations, and verification evidence.

- **Why:** These files are reviewed alongside code and are recognized directly by GitHub.
- **Alternative considered:** A README-only policy. Rejected because GitHub does not surface it in the security advisory or new-issue flows.

### Separate verification from publishing and use read-only permissions

Create a pull-request and main-branch verification workflow that uses a pinned checkout and Node setup action, `npm ci --ignore-scripts`, then the existing typecheck, lint, and test commands; include a package-content check where practical. Give the workflow only `contents: read` and avoid secrets, publishing, or write tokens.

- **Why:** Pull-request validation must be safe for untrusted contributions and independent of release credentials.
- **Alternative considered:** Reusing the publish workflow. Rejected because tag-triggered publishing has different privileges and artifact handling.

### Layer GitHub security automation with least privilege

Configure CodeQL for JavaScript/TypeScript on pushes, pull requests, and a schedule. Configure dependency review for pull requests with read-only permissions. Run OpenSSF Scorecard on a schedule and protected branch pushes with the documented minimal permissions, uploading SARIF results where the action requires it. Pin all third-party actions to full commit SHAs and let Dependabot maintain them.

- **Why:** The checks cover distinct risks: vulnerable dependency changes, source-code patterns, and repository hardening practices.
- **Alternative considered:** A single generic security workflow. Rejected because CodeQL, dependency review, and Scorecard have different event, permission, and result-upload requirements.

### Make Dependabot updates grouped and deliberately paced

Configure weekly npm and GitHub Actions ecosystems with review-friendly groups, a five-day minimum release age/cooldown where Dependabot supports it, and explicit pull-request limits. Group routine updates by ecosystem while allowing security-sensitive updates to remain visible for independent triage.

- **Why:** Grouping reduces maintenance noise; cooldowns reduce exposure to freshly published compromised or withdrawn packages.
- **Alternative considered:** Daily individual updates. Rejected because it increases review load and churn for a small project.

### Document GitHub UI settings separately from repository files

Include a maintainer checklist for branch protection/rulesets, required status checks, CodeQL and dependency-review enablement, private vulnerability reporting, secret scanning and push protection, and security alert triage.

- **Why:** These settings cannot reliably be enforced from repository contents, and documenting them prevents a false claim that checked-in files alone secure the repository.
- **Alternative considered:** Omit UI guidance. Rejected because key GitHub security controls would remain undiscoverable and inconsistently enabled.

## Risks / Trade-offs

- [GitHub-hosted actions or Scorecard capabilities change] → Pin action revisions, use Dependabot for updates, and keep workflow configuration aligned with each action's current documentation during maintenance.
- [Five-day cooldown is unavailable or differs by Dependabot ecosystem] → Use the native `cooldown` option where supported; otherwise document the intended review hold and avoid implying an unenforceable guarantee.
- [Security workflows generate findings that require maintainer time] → Assign CODEOWNERS/security contacts, document triage expectations, and start with default language analysis rather than custom queries.
- [External GitHub settings are disabled despite committed workflow files] → Include an explicit setup checklist and make required CI checks part of branch protection.
- [Pull-request workflow executes unsafe dependency lifecycle code] → Use `npm ci --ignore-scripts` and no secrets or write permissions.

## Migration Plan

1. Add the governance documents and GitHub configuration in one pull request.
2. Verify workflows on a non-release branch and review generated Dependabot, CodeQL, dependency-review, and Scorecard results.
3. A repository administrator enables the documented GitHub Advanced Security/security settings and branch rules, then requires the verification check before merge.
4. Monitor the first update cycle and tune grouping/limits only if review volume or update latency proves unsuitable.
5. Roll back by reverting the configuration pull request; disable any newly configured required checks in GitHub first so existing pull requests are not blocked.

## Open Questions

- Which GitHub account(s) or team(s) should be listed as `CODEOWNERS` and security contacts?
- Is GitHub Advanced Security enabled for this repository, and which CodeQL/secret-scanning features are available under its plan?
- Which default branch name and branch ruleset should receive the verification workflow's required status check?
