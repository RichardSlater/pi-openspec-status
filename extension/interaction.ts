/**
 * OpenSpec Widget Interaction
 *
 * Interactive overlay for navigating and acting on OpenSpec changes from the status widget.
 * Provides keyboard-driven navigation (arrow keys), preview pane, and action keys (a/e/c/p).
 */

import type { ExtensionAPI, Theme } from "@earendil-works/pi-coding-agent";
import { matchesKey, Key, truncateToWidth, visibleWidth, type TUI } from "@earendil-works/pi-tui";
import type { ChangeSummary, ChangeDetail } from "./types.ts";
import { fetchActiveChanges } from "./openspec.ts";

// ── Constants ──────────────────────────────────────────────────────────────────

const MAX_PROGRESS_BAR_WIDTH = 20;

// ── Action type ────────────────────────────────────────────────────────────────

export type OverlayAction =
	| { type: "apply"; changeName: string }
	| { type: "explore"; changeName: string }
	| { type: "archive"; changeName: string }
	| { type: "propose" }
	| { type: "cancel" };

// ── OpenSpecOverlay Component ──────────────────────────────────────────────────

class OpenSpecOverlay {
	private changes: ChangeSummary[];
	private details: Map<string, ChangeDetail>;
	private selectedIndex: number;
	private theme: Theme;
	private onAction: (action: OverlayAction) => void;
	private error: string | null;

	// Render cache
	private cachedWidth?: number;
	private cachedLines?: string[];

	constructor(
		changes: ChangeSummary[],
		details: Map<string, ChangeDetail>,
		theme: Theme,
		onAction: (action: OverlayAction) => void,
		error: string | null,
	) {
		this.changes = changes;
		this.details = details;
		this.theme = theme;
		this.onAction = onAction;
		this.error = error;
		this.selectedIndex = changes.length > 1 ? 0 : 0; // Pre-select first change
	}

	// ── Input handling ───────────────────────────────────────────────────────

	handleInput(data: string): void {
		// Arrow key navigation (tasks 3.1, 5.2)
		if (matchesKey(data, Key.up)) {
			if (this.changes.length > 1 && this.selectedIndex > 0) {
				this.selectedIndex--;
				this.invalidate();
			}
		} else if (matchesKey(data, Key.down)) {
			if (this.changes.length > 1 && this.selectedIndex < this.changes.length - 1) {
				this.selectedIndex++;
				this.invalidate();
			}
		} else if (data === "a" && this.changes.length > 0) {
			// Apply (task 3.2)
			this.onAction({ type: "apply", changeName: this.changes[this.selectedIndex]!.name });
		} else if (data === "e" && this.changes.length > 0) {
			// Explore (task 3.3)
			this.onAction({ type: "explore", changeName: this.changes[this.selectedIndex]!.name });
		} else if (data === "c" && this.changes.length > 0) {
			// Archive (task 3.4)
			this.onAction({ type: "archive", changeName: this.changes[this.selectedIndex]!.name });
		} else if (data === "p") {
			// Propose (task 3.5)
			this.onAction({ type: "propose" });
		} else if (matchesKey(data, Key.escape)) {
			// Escape (task 3.6)
			this.onAction({ type: "cancel" });
		}
	}

	// ── Rendering ────────────────────────────────────────────────────────────

	render(width: number): string[] {
		if (this.cachedLines && this.cachedWidth === width) {
			return this.cachedLines;
		}

		const th = this.theme;
		const innerW = Math.max(1, width - 2);
		const lines: string[] = [];

		// Top border with title (task 2.5)
		lines.push(this.renderTopBorder(innerW, th));

		if (this.error && this.changes.length === 0) {
			// Error state (task 5.3)
			lines.push(this.renderLine(th.fg("warning", `⚠ ${this.error}`), innerW, th));
		} else if (this.changes.length === 0) {
			// Empty state (task 5.1)
			lines.push(this.renderLine(th.fg("muted", "No active OpenSpec changes"), innerW, th));
			lines.push(this.renderLine("", innerW, th));
		} else {
			// Change list section
			lines.push(this.renderLine(th.fg("muted", " Changes"), innerW, th));
			for (let i = 0; i < this.changes.length; i++) {
				lines.push(this.renderChangeRow(i, innerW, th));
			}

			// Preview pane for selected change (task 2.3)
			const selectedChange = this.changes[this.selectedIndex];
			const selectedDetail = selectedChange ? this.details.get(selectedChange.name) : undefined;
			if (selectedChange && selectedDetail) {
				lines.push(this.renderLine("", innerW, th));
				lines.push(this.renderLine(th.fg("muted", " Preview"), innerW, th));
				lines.push(...this.renderPreviewPane(selectedChange, selectedDetail, innerW, th));
			}
		}

		// Action hint bar (task 2.4)
		lines.push(this.renderLine("", innerW, th));
		lines.push(this.renderLine(this.renderHintBar(th), innerW, th));

		// Bottom border (task 2.5)
		lines.push(th.fg("border", `╰${"─".repeat(innerW)}╯`));

		this.cachedLines = lines;
		this.cachedWidth = width;
		return lines;
	}

	invalidate(): void {
		this.cachedWidth = undefined;
		this.cachedLines = undefined;
	}

	// ── Render helpers ───────────────────────────────────────────────────────

	private renderTopBorder(innerW: number, th: Theme): string {
		const title = "OpenSpec Actions";
		const titleStr = truncateToWidth(` ${title} `, innerW);
		const titleW = visibleWidth(titleStr);
		const leftDash = Math.floor((innerW - titleW) / 2);
		const rightDash = Math.max(0, innerW - titleW - leftDash);
		return (
			th.fg("border", `╭${"─".repeat(leftDash)}`) +
			th.fg("accent", titleStr) +
			th.fg("border", `${"─".repeat(rightDash)}╮`)
		);
	}

	private renderLine(content: string, innerW: number, th: Theme): string {
		return th.fg("border", "│") + truncateToWidth(content, innerW, "…", true) + th.fg("border", "│");
	}

	private renderChangeRow(index: number, innerW: number, th: Theme): string {
		const change = this.changes[index]!;
		const detail = this.details.get(change.name);
		const isSelected = index === this.selectedIndex;

		// Selection prefix (task 2.2)
		const prefix = isSelected ? th.fg("accent", "> ") : "  ";

		// Status icon
		const statusIcon = this.changeStatusIcon(change, detail, th);

		// Change name - truncated to fit
		const maxNameWidth = Math.max(10, Math.floor(innerW * 0.25));
		const truncatedName = truncateToWidth(change.name, maxNameWidth, "…");

		// Artifact initials (task 2.1)
		let artifactStr = "";
		if (detail) {
			artifactStr = this.renderArtifactPart(detail, false, th);
		}

		// Task counter (task 2.1)
		const taskCounter = th.fg("text", `${change.completedTasks}/${change.totalTasks}`);

		// Blocked hint
		let blockedHint = "";
		if (detail && !detail.isComplete) {
			const blockedArtifacts = detail.artifacts.filter((a) => a.status === "blocked");
			if (blockedArtifacts.length > 0) {
				blockedHint = ` ${th.fg("warning", `(blocked: ${blockedArtifacts.map((a) => a.id).join(", ")})`)}`;
			}
		}

		const row = `${prefix}${statusIcon} ${truncatedName}  ${artifactStr}  ${taskCounter}${blockedHint}`;
		return this.renderLine(row, innerW, th);
	}

	private renderPreviewPane(change: ChangeSummary, detail: ChangeDetail, innerW: number, th: Theme): string[] {
		const lines: string[] = [];

		// Line 1: Status icon + change name + schema
		const statusIcon = this.changeStatusIcon(change, detail, th);
		const nameLine = `${statusIcon} ${th.fg("text", change.name)} ${th.fg("muted", `(${detail.schemaName})`)}`;
		lines.push(this.renderLine(nameLine, innerW, th));

		// Line 2: Artifact statuses (full names)
		const artifactStr = this.renderArtifactPart(detail, true, th);
		lines.push(this.renderLine(th.fg("muted", "Artifacts: ") + artifactStr, innerW, th));

		// Line 3: Task progress bar
		const taskBar = this.progressBar(change.completedTasks, change.totalTasks, th);
		const applyHint =
			detail.applyRequires.length > 0
				? ` · ${th.fg("muted", `apply: ${detail.applyRequires.join(", ")}`)}`
				: "";
		lines.push(this.renderLine(th.fg("muted", "Tasks: ") + taskBar + applyHint, innerW, th));

		return lines;
	}

	private renderHintBar(th: Theme): string {
		const hasChanges = this.changes.length > 0;
		const parts: string[] = [];

		if (hasChanges) {
			// Full hint bar with all actions
			parts.push(th.fg("accent", "a") + th.fg("dim", " apply"));
			parts.push(th.fg("accent", "e") + th.fg("dim", " explore"));
			parts.push(th.fg("accent", "c") + th.fg("dim", " archive"));
		} else {
			// Empty state - dim unused actions (task 6.1)
			parts.push(th.fg("muted", "a apply · e explore · c archive"));
		}
		parts.push(th.fg("accent", "p") + th.fg("dim", " propose new"));
		parts.push(th.fg("accent", "esc") + th.fg("dim", " cancel"));

		return parts.join(th.fg("dim", " · "));
	}

	// ── Status/artifact helpers ──────────────────────────────────────────────

	private changeStatusIcon(change: ChangeSummary, detail?: ChangeDetail, th?: Theme): string {
		const t = th ?? this.theme;
		if (detail?.isComplete) return t.fg("success", "✓");
		if (change.status === "blocked" || change.status === "error") return t.fg("warning", "✗");
		return t.fg("accent", "◷");
	}

	private renderArtifactPart(detail: ChangeDetail, useFullNames: boolean, th?: Theme): string {
		const t = th ?? this.theme;
		return detail.artifacts
			.map((a) => {
				const label = useFullNames ? a.id : a.id.charAt(0).toUpperCase();
				let icon: string;
				switch (a.status) {
					case "done":
						icon = t.fg("success", "●");
						break;
					case "ready":
						icon = t.fg("muted", "○");
						break;
					case "blocked":
						icon = t.fg("warning", "◌");
						break;
					default:
						icon = t.fg("muted", "○");
				}
				return `${label} ${icon}`;
			})
			.join(" ");
	}

	private progressBar(completed: number, total: number, th?: Theme): string {
		const t = th ?? this.theme;
		if (total === 0) return t.fg("muted", "—");

		const barWidth = Math.min(MAX_PROGRESS_BAR_WIDTH, Math.max(4, total));
		const fillCount = total > 0 ? Math.round((completed / total) * barWidth) : 0;
		const emptyCount = barWidth - fillCount;

		const fill = t.fg("accent", "█".repeat(fillCount));
		const empty = t.fg("muted", "░".repeat(emptyCount));
		const counter = t.fg("text", ` ${completed}/${total}`);

		return fill + empty + counter;
	}
}

// ── LoadingOverlay Component ────────────────────────────────────────────────────

/**
 * Lightweight loading overlay with animated spinner and box-drawing borders
 * that match the OpenSpecOverlay visual style.
 */
class LoadingOverlay {
	private tui: TUI;
	private theme: Theme;
	private message: string;
	private frame = 0;
	private interval: ReturnType<typeof setInterval> | null = null;
	private abortController: AbortController;
	private onAbortCb?: () => void;
	private cachedWidth?: number;
	private cachedLines?: string[];

	get signal(): AbortSignal {
		return this.abortController.signal;
	}

	set onAbort(fn: (() => void) | undefined) {
		this.onAbortCb = fn;
	}

	constructor(tui: TUI, theme: Theme, message: string) {
		this.tui = tui;
		this.theme = theme;
		this.message = message;
		this.abortController = new AbortController();
		this.startAnimation();
	}

	private startAnimation(): void {
		this.interval = setInterval(() => {
			this.frame++;
			this.invalidate();
			this.tui.requestRender();
		}, 150);
	}

	handleInput(data: string): void {
		if (matchesKey(data, Key.escape)) {
			this.abortController.abort();
			this.onAbortCb?.();
		}
	}

	render(width: number): string[] {
		if (this.cachedLines && this.cachedWidth === width) {
			return this.cachedLines;
		}

		const th = this.theme;
		const innerW = Math.max(1, width - 2);
		const spinChars = ["◐", "◓", "◑", "◒"];
		const spin = spinChars[this.frame % spinChars.length]!;

		const lines: string[] = [];

		// Top border — full width, all border color
		lines.push(th.fg("border", "╭" + "─".repeat(innerW) + "╮"));
		// Empty line
		lines.push(th.fg("border", "│") + truncateToWidth("", innerW, "…", true) + th.fg("border", "│"));
		// Spinner + message
		lines.push(th.fg("border", "│") + truncateToWidth(` ${th.fg("accent", spin)} ${this.message}`, innerW, "…", true) + th.fg("border", "│"));
		// Empty line
		lines.push(th.fg("border", "│") + truncateToWidth("", innerW, "…", true) + th.fg("border", "│"));
		// Cancel hint
		lines.push(th.fg("border", "│") + truncateToWidth(th.fg("dim", " esc cancel"), innerW, "…", true) + th.fg("border", "│"));
		// Empty line
		lines.push(th.fg("border", "│") + truncateToWidth("", innerW, "…", true) + th.fg("border", "│"));
		// Bottom border — full width, all border color
		lines.push(th.fg("border", "╰" + "─".repeat(innerW) + "╯"));

		this.cachedLines = lines;
		this.cachedWidth = width;
		return lines;
	}

	invalidate(): void {
		this.cachedWidth = undefined;
		this.cachedLines = undefined;
	}

	dispose(): void {
		if (this.interval) {
			clearInterval(this.interval);
			this.interval = null;
		}
	}
}

// ── Shortcut Registration (task 1.2) ─────────────────────────────────────────

/**
 * Register the ctrl+alt+o shortcut that opens the interactive overlay.
 */
export function registerInteractionShortcut(pi: ExtensionAPI): void {
	pi.registerShortcut(Key.ctrlAlt("o"), {
		description: "Open OpenSpec change list overlay",
		handler: async (ctx) => {
			// Idle check (task 4.2)
			if (!ctx.isIdle()) {
				ctx.ui.notify("OpenSpec overlay unavailable: agent is currently processing", "warning");
				return;
			}

			// Show loading state while fetching changes
			const fetchResult = await ctx.ui.custom<{
				changes: ChangeSummary[];
				details: Map<string, ChangeDetail>;
				error: string | null;
			} | null>(
				(tui, theme, _kb, done) => {
					const loader = new LoadingOverlay(tui, theme, "Loading OpenSpec changes...");
					loader.onAbort = () => done(null);

					fetchActiveChanges(pi)
						.then((result) => done(result))
						.catch(() => done(null));

					return {
						render: (w) => loader.render(w),
						handleInput: (data) => loader.handleInput(data),
						invalidate: () => loader.invalidate(),
					};
				},
				{ overlay: true },
			);

			if (!fetchResult) return;

			const { changes, details, error } = fetchResult;

			// Open the change list overlay (task 4.4)
			const actionResult = await ctx.ui.custom<OverlayAction | null>(
				(_tui, theme, _kb, done) => {
					const overlay = new OpenSpecOverlay(changes, details, theme, (action) => done(action), error);
					return {
						render: (w) => overlay.render(w),
						handleInput: (data) => {
							overlay.handleInput(data);
							_tui.requestRender(); // (task 3.7)
						},
						invalidate: () => overlay.invalidate(),
					};
				},
				{ overlay: true },
			);

			// Handle the action result
			if (!actionResult) return;

			switch (actionResult.type) {
				case "apply":
					ctx.ui.setEditorText(`/opsx-apply ${actionResult.changeName}`);
					break;
				case "explore":
					ctx.ui.setEditorText(`/opsx-explore ${actionResult.changeName}`);
					break;
				case "archive":
					ctx.ui.setEditorText(`/opsx-archive ${actionResult.changeName}`);
					break;
				case "propose":
					ctx.ui.setEditorText("/opsx-propose ");
					break;
				case "cancel":
					// No editor change, just close
					break;
			}
		},
	});
}
