## Context

The pi-openspec-status extension currently has two display surfaces: a persistent TUI widget above the editor, and an interactive overlay (dialog) triggered by `Ctrl+Alt+O`. Both show a task progress bar with an `apply: tasks` suffix on the same line. The `applyRequires` field from the schema is always `["tasks"]` for spec-driven changes, making the suffix uninformative.

Meanwhile, `tasks.md` files in OpenSpec changes are organized into `##`-headed sections (groups) with `- [x]` checkbox items under each. This structure encodes per-group completion status that the CLI does not surface.

The goal: remove the useless `apply:` suffix from the widget, and replace it with a meaningful multi-line task group breakdown in the overlay.

## Goals / Non-Goals

**Goals:**
- Remove the `apply: ...` suffix from the widget's task progress line
- Show a task group breakdown in the overlay preview pane with per-group completion status
- Parse `tasks.md` to extract heading groups and checkbox completion counts
- Fall back gracefully to the current flat display when grouping is unavailable

**Non-Goals:**
- Modifying the openspec CLI itself
- Adding task group display to the compact inline widget (too space-constrained)
- Supporting schemas that use a different tracking file name (`tracks` field) — focus on the common `tasks.md` case
- Adding interactive task marking (read-only display)
- Changing the data refresh or event wiring

## Decisions

### Decision 1: Parse tasks.md directly in the extension

**Choice**: Read `openspec/changes/<name>/tasks.md` from disk and parse `##` headings + checkboxes.

**Rationale**: The openspec CLI does not expose task group data. Modifying the CLI would be a separate project. Parsing in-extension is self-contained and simple (~40 lines of regex-based parsing).

**Alternatives considered**:
- *Extend openspec CLI*: Cleaner but heavier — requires a separate release, adds a dependency on CLI version. Rejected for this iteration.
- *Use `openspec instructions --json` + parse tasks.md*: Gets canonical task `done` state from CLI but still needs tasks.md for groups. Double data source adds complexity without benefit. Rejected.

### Decision 2: Fallback to flat display from openspec status

**Choice**: When `tasks.md` cannot be parsed (file missing, no `##` headings found, parse error), fall back to the existing flat `Tasks: ████░░░░░░ 3/7` line in the overlay (without the `apply:` suffix).

**Rationale**: Graceful degradation. The extension already reliably fetches `completedTasks`/`totalTasks` from `openspec status --json`. If group parsing fails, we still show useful progress info rather than nothing.

### Decision 3: Per-group status icon semantics

**Choice**: Three state icons mirroring the existing artifact status pattern:
- `●` (success color): group complete — `completed === total && total > 0`
- `◷` (accent color): group partially complete — `completed > 0 && completed < total`
- `○` (muted color): group not started — `completed === 0`

**Rationale**: Consistent visual language with existing artifact status icons (●/○/◌). Users already understand the color semantics: done = green, in-progress = accent, pending = muted.

### Decision 4: Group discovery from tasks.md only

**Choice**: Groups are determined solely by `##`-level markdown headings in tasks.md. Any content before the first `##` heading is treated as "ungrouped" and either shown as a catch-all "Tasks" group or merged into the flat fallback.

**Rationale**: All existing OpenSpec tasks.md examples use `##` headings for groups (e.g., `## 1. Data layer`). This is the convention. Using `##` avoids false positives from level-3 headings that might appear within task descriptions.

### Decision 5: Parsing in a new dedicated module

**Choice**: Create `extension/tasks-parser.ts` with a single exported function `parseTaskGroups(content: string): TaskGroup[]` and an optional fallback indication.

**Rationale**: Keeps concerns separated. The parser module has no TUI dependencies, making it testable independently. The data-fetching layer (openspec.ts) can call it, and the renderer (overlay.ts) can consume the structured output.

### Decision 6: Data model extension on WidgetState

**Choice**: Extend `WidgetState` to include an optional `taskGroups: Map<string, TaskGroup[]>` (keyed by change name). The parser result is stored alongside existing detail data.

**Rationale**: Task group data is part of the widget state and should be refreshed alongside other data. A Map keyed by change name mirrors the existing `details: Map<string, ChangeDetail>` pattern.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| **Parse fragility**: `tasks.md` format could diverge from our regex expectations (e.g., nested checkboxes, code blocks with `- [ ]`) | Fallback to flat display; warn to console on parse mismatch |
| **File I/O performance**: Reading `tasks.md` per change on every refresh adds disk I/O | The tasks.md files are small (<10KB typically); 30s debounced refresh interval keeps this minimal. On session start, we already fetch from CLI. |
| **Non-tasks.md tracking files**: Some schemas use different `tracks` field names | Only attempt group parsing when the tracking file is `tasks.md` (the default for spec-driven). Skip silently for other filenames. |
| **Overlay height**: Adding N group lines to the overlay could overflow on narrow terminals | Groups are shown only for the selected change (one at a time). Most changes have 3-6 groups — well within typical terminal height. |

## Open Questions

- None — the design is constrained to the existing patterns established by `add-status-widget` and `add-widget-interaction`.
