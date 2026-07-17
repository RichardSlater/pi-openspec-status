## Context

The repository has eight OpenSSF Scorecard code-scanning findings. Workflow token permissions, a missing machine-detectable license file, and absent recognized fuzzing can be improved in committed files. Branch-protection and code-review scores cannot be honestly maximized under the current single-maintainer model; the project is also too new for Scorecard's maintenance-age check, and Best Practices participation is an external program.

The extension already exposes pure, security-sensitive trust-boundary functions for OpenSpec CLI JSON and `tasks.md` content. Existing `node:test` hardening tests cover representative hostile inputs but do not explore broad input combinations.

## Goals / Non-Goals

**Goals:**
- Make workflow permission defaults explicit and least-privilege while preserving CodeQL SARIF upload and npm provenance publishing.
- Publish an authoritative MIT license file consistent with existing package metadata and README claims.
- Exercise untrusted input boundaries with repeatable property-based tests that Scorecard can recognize.
- Document which Scorecard outcomes are intentionally deferred and when they will be reassessed.

**Non-Goals:**
- Artificially create commits, reviews, or contributors to raise Scorecard scores.
- Claim independent review controls that a single maintainer cannot operate.
- Adopt OSS-Fuzz, ClusterFuzzLite, or an external Best Practices badge in this change.
- Alter extension runtime behavior or public APIs.

## Decisions

### Use read-only workflow defaults with job-scoped elevation

Set explicit read-only top-level permissions in CodeQL and publish workflows. Move CodeQL's `security-events: write` permission to only its analysis job; retain publishing's `id-token: write` only on the npm publication job.

This gives new jobs a safe default and preserves each existing workflow capability. Granting `write-all` globally or moving all permissions to the workflow level was rejected because it expands the blast radius of a compromised or future job.

### Add direct fast-check property tests to the existing test command

Add `fast-check` as a development dependency and import it directly from a TypeScript test file executed by the existing `node --experimental-strip-types --test` command. Generate arbitrary strings and JSON-like values for `sanitizeDisplayText`, `isValidChangeName`, `validateChangeSummary`, `validateChangeDetail`, and `parseTaskGroups`.

Properties will verify that parsing and validation never throw, accepted values retain their documented structural invariants, output display text remains bounded and free of terminal/directional controls, and task group counters/statuses remain internally consistent. Use bounded generators and an explicit, stable run count so CI remains predictable while failed runs retain fast-check's seed/path reproduction information.

A separate fuzzing service or workflow was rejected: it adds operational overhead without targeting this extension's primary input boundary. Direct fast-check use is recognized by Scorecard and has a clear regression-testing value.

### Publish the canonical MIT license after confirming attribution

Add a root `LICENSE` containing the standard MIT text. The implementation task must use the maintainer-confirmed copyright holder and year/range rather than inferring legal attribution from package metadata.

This resolves the discrepancy between `package.json`/README, which claim MIT, and GitHub/Scorecard, which cannot detect a license artifact.

### Treat unachievable Scorecard criteria as governance evidence, not code defects

Update maintainer guidance to state that review and branch-protection Scorecard signals must be reassessed if independent maintainers become available. Retain and review the existing protections (PRs, signed commits, required verification, deletion and non-fast-forward prevention), but do not configure nominal approval requirements that the lone maintainer would routinely bypass.

Record a post-90-day review for the `Maintained` check and an optional future decision for OpenSSF Best Practices enrollment. The change accepts that these alerts may remain open after implementation.

## Risks / Trade-offs

- [Property tests increase test time and add a dependency] → Use focused, bounded generators and run them through the established test command.
- [Property tests may expose existing edge cases] → Preserve fast-check reproduction details and treat failures as defects to resolve before merging.
- [Scorecard results are asynchronous] → Trigger or await the normal Scorecard workflow after merge and verify the next SARIF upload before considering findings resolved.
- [MIT attribution is legally meaningful] → Obtain maintainer confirmation before creating the license text.
- [Single-maintainer policy cannot satisfy independent-review scoring] → Document the limitation and revisit it when project stewardship changes.

## Migration Plan

1. Merge workflow, license, tests, and governance documentation through the existing protected-branch process.
2. Run type checking, linting, and the full test suite locally and in Verify.
3. Confirm CodeQL and publish workflows retain their required capabilities on their next applicable runs.
4. Review the next Scorecard SARIF results; close or retain alerts based on observed evidence rather than expectation.

Rollback consists of reverting the change if workflow authorization or test-runtime regressions are observed. The license decision should only be merged after attribution is confirmed.

## Open Questions

- What copyright holder and year/range should appear in the MIT license notice?
- What date and owner should be recorded for the post-90-day Scorecard reassessment?
- Should Best Practices enrollment become a separately owned governance initiative when additional maintainers are available?
