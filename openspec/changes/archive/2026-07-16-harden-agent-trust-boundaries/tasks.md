## 1. Establish agent workflow trust boundaries

- [x] 1.1 Inventory every repository-local `.pi` prompt and skill that consumes OpenSpec CLI output or artifacts.
- [x] 1.2 Add a consistent untrusted-project-data policy to all applicable prompts and skills.
- [x] 1.3 Require repository and allowed-subtree validation before agent-directed file reads or writes, and user approval for scope expansion.
- [x] 1.4 Review prompt examples and guardrails to ensure they do not elevate schema rules, templates, artifacts, or dynamic instructions over user/system policy.

## 2. Validate OpenSpec data and contain file access

- [x] 2.1 Add a shared input-validation module with a documented supported change-name grammar and typed CLI payload validation.
- [x] 2.2 Validate change summaries, details, artifact statuses, counters, schema fields, and names at the OpenSpec data-layer boundary.
- [x] 2.3 Update status fetching and task-group retrieval to reject invalid names and construct task paths only from validated identifiers rooted at the resolved OpenSpec project.
- [x] 2.4 Ensure invalid CLI payloads produce bounded errors and preserve last known safe state where the widget supports it.
- [x] 2.5 Add regression tests for traversal, separators, whitespace, control characters, bidi controls, invalid counters, and malformed status payloads.

## 3. Sanitize UI and editor-command data

- [x] 3.1 Add a shared display-text sanitizer that removes terminal escapes, line controls, C0/C1 controls, and bidi formatting controls while retaining normal printable Unicode.
- [x] 3.2 Apply display sanitization to every CLI- or task-file-derived label and error before Pi theme styling and terminal truncation.
- [x] 3.3 Restrict overlay apply, verify, explore, and archive command prefill to validated change identifiers only.
- [x] 3.4 Add rendering and interaction tests proving untrusted names cannot forge TUI lines or insert additional editor commands.

## 4. Make progress semantics accurate

- [x] 4.1 Update widget, overlay, and README language to identify completion as OpenSpec workflow/artifact progress rather than test, security, or verification status.
- [x] 4.2 Document the supported task-group heading and checkbox syntax and ensure unsupported checkbox-like content is not represented as comprehensively tracked progress.
- [x] 4.3 Add parser and display tests for supported, unsupported, malformed, and control-character-bearing task group content.

## 5. Harden release automation and metadata

- [x] 5.1 Split package build/test/package-inspection from OIDC-authorized `npm publish` into separate workflow jobs.
- [x] 5.2 Pin GitHub Actions to immutable commit SHAs and retain minimum required permissions per job.
- [x] 5.3 Validate release-tag, package, and lockfile version consistency plus `npm pack --dry-run` contents before publishing the built artifact.
- [x] 5.4 Decide whether dependency lifecycle scripts are required and use `npm ci --ignore-scripts` in the unprivileged build job when compatible.
- [x] 5.5 Align README install examples and peer-dependency compatibility policy with supported releases.

## 6. Verify the hardening change

- [x] 6.1 Run the extension's typecheck, lint, and test commands and fix regressions.
- [x] 6.2 Exercise valid and malformed OpenSpec CLI fixtures to verify safe errors, scoped task access, UI stability, and editor command construction.
- [x] 6.3 Review the final workflow permissions and package tarball before marking the change complete.