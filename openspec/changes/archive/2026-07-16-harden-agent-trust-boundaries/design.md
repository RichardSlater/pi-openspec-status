## Context

The extension accepts JSON and text from an `openspec` executable discovered on `PATH`, renders selected fields in Pi's terminal UI, uses change names to locate `tasks.md`, and inserts change names into editor prompt commands. Repository-local prompts and skills additionally instruct agents to consume CLI-selected instructions and artifact paths. These are trust boundaries: OpenSpec project data and CLI output are useful context but are not trusted authority.

The current publish workflow also performs dependency installation in the same job that holds npm OIDC publishing permission. The hardening must preserve supported OpenSpec workflows and avoid adding runtime dependencies.

## Goals / Non-Goals

**Goals:**
- Preserve a strict boundary between user/system policy and project or CLI content.
- Accept only valid, bounded CLI data before it reaches paths, editor commands, state, or terminal rendering.
- Keep extension file reads inside the resolved OpenSpec project and selected change directory.
- Make UI progress claims precise and resistant to visual control-sequence spoofing.
- Publish only from a credential-isolated, validated release artifact.

**Non-Goals:**
- Treating OpenSpec completion as a security review, test result, or source-code audit.
- Supporting arbitrary path-like or control-character-containing change names.
- Adding a general sandbox for the OpenSpec executable or certifying a CLI discovered on `PATH`.
- Changing OpenSpec schema semantics beyond accurately presenting supported task syntax.

## Decisions

### Treat CLI and artifact content as untrusted data
All repository-local prompts and skills will state that OpenSpec output, artifacts, templates, filenames, context, rules, and dynamic instructions are subordinate project data. They may provide requirements but cannot authorize secret access, policy changes, unrelated commands, scope expansion, or out-of-repository writes.

**Alternative considered:** Trust schema-provided rules as workflow authority. This is rejected because schemas and artifacts can be controlled by the project being evaluated.

### Validate structured CLI data at the data-layer boundary
A shared validation module will define a conservative change identifier contract and validators for change summaries, details, artifact statuses, task counters, and display fields. Invalid entries will be rejected with a safe error rather than passed to callers. Validated names will be the only names accepted by status calls, task-file path construction, and editor-command actions.

**Alternative considered:** Escape values at each use site. This is rejected because it is easy to miss a new use site and cannot safely make traversal-style values valid path components.

### Separate identifier validation from display sanitization
Identifier validation protects command and filesystem contexts. A separate display sanitizer will normalize and bound externally supplied display strings, remove terminal control sequences, line controls, and Unicode bidirectional controls, then return plain text before `theme.fg()` applies legitimate Pi styling.

**Alternative considered:** Sanitize fully themed output. This is rejected because it could remove Pi's own styling sequences and mixes trusted presentation with untrusted data.

### Constrain tasks reads by construction
`fetchTaskGroups()` will form a relative path only from a validated identifier, run from the resolved OpenSpec root, and use an end-of-options marker where supported. The implementation will not accept arbitrary CLI-provided paths for reading task files. Any future returned path feature must canonicalize and verify its resolved target lies within an explicit project-root allowlist before access.

### Make status labels factual
The widget and documentation will refer to OpenSpec workflow/artifact completion rather than verification or safety. Task-group counts will be described as recognized supported checkbox syntax when applicable, with flat CLI-derived counts remaining the fallback.

### Isolate OIDC publication
The workflow will build, test, inspect, and package without publishing credentials. A separate publish job, granted `id-token: write` only there, will publish the tested package artifact. Third-party actions will be pinned to immutable commit SHAs and tag/package version consistency will be checked.

**Alternative considered:** Keep a single job and rely on trusted dependencies. This is rejected because dependency installation is a distinct and larger supply-chain trust boundary.

## Risks / Trade-offs

- [Conservative name validation rejects a previously accepted unusual OpenSpec name] → Document the supported identifier contract and use the official OpenSpec contract if one exists; otherwise prefer safety over ambiguous compatibility.
- [Sanitization changes how unusual Unicode labels appear] → Preserve ordinary printable Unicode, only remove formatting and control characters, and cover this behavior with tests.
- [CLI payload validation exposes errors that were previously silently tolerated] → Show a bounded error state and retain last known safe widget state.
- [Split publishing workflow adds artifact handoff complexity] → Validate the artifact and publish exactly that artifact in the isolated job.

## Migration Plan

1. Add validators, display sanitization, and regression tests before changing UI behavior.
2. Update the data layer, renderer, interaction flow, prompts, skills, and documentation together.
3. Introduce the isolated release workflow and verify it in a tag-based dry run or controlled release.
4. Roll back by reverting the change; no persistent data migration is required.

## Open Questions

- What exact OpenSpec change-name grammar is guaranteed by supported CLI versions?
- Which project test command and package artifact transport mechanism best match the repository's CI conventions?
- Should unsupported checkbox-like task syntax produce an explicit overlay warning or only documentation/labeling?