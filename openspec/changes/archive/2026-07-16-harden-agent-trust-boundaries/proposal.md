## Why

The extension and its repository-local OpenSpec workflows consume CLI output and project-controlled artifacts as operational input. Without explicit trust boundaries, malformed or hostile names, paths, instructions, and terminal text can misdirect an agent, escape intended file scope, or forge status UI. The publishing workflow also installs dependencies in a job that holds publishing credentials.

## What Changes

- Establish explicit prompt-injection and scope-boundary rules for every repository-local OpenSpec prompt and skill.
- Validate OpenSpec CLI response data, especially change identifiers, before it is used in paths, commands, state, or UI.
- Constrain extension task-file access to the resolved project and validated change directories.
- Sanitize externally supplied display strings before terminal rendering or editor-command construction.
- Clarify that completion is OpenSpec workflow progress, not security, test, or verification status; make task-progress limitations visible.
- Split unprivileged package build/testing from OIDC-authorized publishing, pin GitHub Actions, and validate release contents and version metadata.

## Capabilities

### New Capabilities

- `agent-workflow-trust-boundaries`: Repository-local OpenSpec prompts and skills safely handle project-controlled instructions and artifact paths.
- `release-pipeline-hardening`: Package publication separates untrusted dependency installation from publishing credentials and validates release inputs.

### Modified Capabilities

- `status-widget`: CLI-derived status data is validated and safely rendered, and completion semantics are accurately represented.
- `widget-interaction`: Interactive actions only construct editor commands from validated change identifiers.
- `task-group-progress`: Parsed task-group progress communicates supported syntax and does not overstate completion.

## Impact

Affected areas include `.pi/prompts/`, `.pi/skills/`, the extension's OpenSpec data layer, widget/overlay rendering, interaction command construction, task parsing, tests, package metadata/documentation, and `.github/workflows/publish.yml`. No new runtime dependency is expected.