## Why

The widget currently shows `apply: tasks` on the task progress line, which is not useful — it always says the same thing for spec-driven changes. The overlay preview pane duplicates this pattern. Meanwhile, tasks.md contains `##`-headed task groups (e.g., "Data layer", "Widget rendering") that give a much clearer picture of progress. Showing group-level completion status in the overlay would help users understand *what exactly* remains to be done, not just the raw count.

## What Changes

- **Widget**: Remove the `apply: <artifacts>` suffix from the task progress line in both single-change and preview renderers. Line 3 becomes `Tasks: ████░░░░░░ 3/7` with no suffix.
- **Overlay preview pane**: Replace the flat task progress line with a multi-line task group breakdown. Each `##`-headed group in tasks.md becomes a row showing group name, completion count (e.g., `3/5`), and a status indicator icon (● complete, ◷ partial, ○ none done).
- **New task group parser**: Parse `tasks.md` directly to extract heading groups and their checkbox completion status. Falls back gracefully to the existing `openspec status --json` data when grouping is unavailable (e.g., no tasks.md, parsing failure, no groups found).

## Capabilities

### New Capabilities

- `task-group-progress`: Parse tasks.md to extract per-group task completion status and render group-level progress in the overlay. Provide a status icon per group and a fallback path when grouping cannot be determined.

### Modified Capabilities

- `status-widget`: Remove the `applyRequires` hint from the widget's single-change task progress line. The progress bar with counter is retained; only the `apply: ...` suffix is dropped.
- `widget-interaction`: Replace the flat `apply: ...` pattern in the overlay preview pane with the task group breakdown.

## Impact

- **extension/widget.ts**: Remove `applyHint` construction in `renderSingleChange` and `renderPreviewPane` in overlay.ts (deduplicate).
- **extension/overlay.ts**: Replace `renderPreviewPane` task line with group rendering logic. Add `renderTaskGroups` helper that consumes parsed group data.
- **extension/types.ts**: Add `TaskGroup` interface (`name: string`, `completed: number`, `total: number`, `status: 'complete' | 'partial' | 'none'`). Extend `WidgetState` or `ChangeDetail` to carry optional task group data.
- **New `extension/tasks-parser.ts`**: Parse `tasks.md` content, extract `##` headings as group names, count `- [x]` / `- [ ]` within each group. Export `parseTaskGroups(content: string): TaskGroup[]`.
- **extension/openspec.ts** (or new module): Function to read `tasks.md` from a change directory, invoke the parser, and merge results into the data layer. Fall back gracefully.
- **extension/index.ts**: Updated refresh logic to also fetch task group data.
- **Specs**: Update `status-widget` and `widget-interaction` specs to reflect the removal (widget) and addition (overlay).
