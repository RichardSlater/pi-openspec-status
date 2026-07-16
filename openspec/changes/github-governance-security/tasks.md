## 1. Establish repository governance

- [x] 1.1 Add `SECURITY.md` with supported-version guidance, private disclosure instructions, response expectations, and responsible-disclosure rules.
- [x] 1.2 Add contribution guidance plus pull-request and issue templates/forms that collect reproduction, validation, and security-impact details.
- [x] 1.3 Add `.github/CODEOWNERS` using the confirmed maintainer owner/team and maintainer documentation for required GitHub UI security settings and alert triage.
- [x] 1.4 Review governance documents to ensure they contain no private contact information, secrets, or claims about GitHub features that are not enabled.

## 2. Automate dependency maintenance

- [x] 2.1 Add `.github/dependabot.yml` for npm and GitHub Actions with weekly schedules, grouped update rules, open-pull-request limits, and a five-day native cooldown/minimum release age where supported.
- [x] 2.2 Validate Dependabot configuration syntax and confirm grouping preserves separately triageable security updates.

## 3. Add pull-request verification

- [x] 3.1 Add a pinned, read-only verification workflow for pull requests and protected-branch pushes using the project's supported Node version and `npm ci --ignore-scripts`.
- [x] 3.2 Configure the verification workflow to run `npm run typecheck`, `npm run lint`, and `npm test`, plus a package-content check if it can reuse the release validation safely.
- [x] 3.3 Confirm the verification workflow has no publishing step, secrets, write token permissions, or unsafe pull-request target event.

## 4. Add security analysis workflows

- [x] 4.1 Add a pinned CodeQL workflow for JavaScript/TypeScript on pull requests, protected-branch pushes, and a recurring schedule with the minimum required permissions.
- [x] 4.2 Add a pinned dependency-review workflow that fails pull requests introducing dependencies that violate the agreed vulnerability policy.
- [x] 4.3 Add a pinned OpenSSF Scorecard workflow for protected-branch pushes and a recurring schedule, with documented least-privilege permissions and SARIF publication where supported.
- [x] 4.4 Verify every newly introduced action is pinned to a full immutable commit SHA and that Dependabot can maintain GitHub Actions updates.

## 5. Document rollout and validate the change

- [x] 5.1 Update the README with an OpenSSF Scorecard badge and links to the repository's governance and security resources.
- [x] 5.2 Have a repository administrator enable the documented GitHub settings, private vulnerability reporting, relevant security alerts, and required verification status check in branch protection/rulesets.
- [x] 5.3 Validate all YAML and Markdown files, then run `npm ci --ignore-scripts`, `npm run typecheck`, `npm run lint`, and `npm test`.
- [ ] 5.4 Open a test pull request to confirm verification, CodeQL, dependency review, and Scorecard workflows execute with expected permissions and results.
- [ ] 5.5 Review the first Dependabot update cycle and adjust grouping, limits, or schedule only if the documented policy is not met.
