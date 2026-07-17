## 1. Confirm policy inputs

- [x] 1.1 Confirm the MIT license copyright holder and year or year range with the maintainer.
- [x] 1.2 Record the owner and review date for the post-90-day Scorecard maintenance reassessment.

## 2. Harden workflow permissions

- [x] 2.1 Set CodeQL's top-level permissions to read-only and scope `security-events: write` to its analysis job.
- [x] 2.2 Set Publish Package's top-level permissions to read-only while preserving job-scoped OIDC publication permissions.
- [x] 2.3 Validate workflow syntax and confirm CodeQL SARIF upload and npm provenance publishing retain their required permissions.

## 3. Establish machine-detectable licensing

- [x] 3.1 Add the root `LICENSE` file with the confirmed standard MIT license notice and text.
- [x] 3.2 Verify package metadata, README, and the root license artifact consistently identify MIT.

## 4. Add input-boundary property tests

- [x] 4.1 Add `fast-check` as a development dependency and update the lockfile without changing the standard test command.
- [x] 4.2 Add bounded, reproducible property tests for CLI payload validators and change-name validation.
- [x] 4.3 Add bounded, reproducible property tests for display sanitization and task Markdown parsing invariants.
- [x] 4.4 Confirm a direct TypeScript `fast-check` import is executed by the standard test suite and property-test failures preserve reproduction data.

## 5. Document and verify Scorecard posture

- [x] 5.1 Update maintainer guidance to distinguish current protections from the single-maintainer limitations on independent review and stricter branch-review scoring.
- [x] 5.2 Document the post-90-day Maintained reassessment and optional future OpenSSF Best Practices ownership decision.
- [x] 5.3 Run type checking, linting, and the complete test suite, including property tests.
- [ ] 5.4 Have the maintainer review the next Scorecard SARIF results and record which alerts resolved versus which remain intentionally deferred.
