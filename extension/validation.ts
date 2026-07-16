/**
 * Trust boundary for data received from the OpenSpec CLI and task files.
 *
 * Supported change identifiers are lower-case kebab-case ASCII: `add-auth`,
 * `fix-issue-42`. They are deliberately restricted so they can safely serve as
 * a single path component and as part of an editor command.
 */

import type { ArtifactStatus, ChangeDetail, ChangeSummary } from "./types.ts";

export const CHANGE_NAME_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const MAX_CHANGE_NAME_LENGTH = 80;
export const MAX_DISPLAY_TEXT_LENGTH = 160;

const CONTROL_OR_BIDI = /[\u0000-\u001f\u007f-\u009f\u061c\u200e\u200f\u202a-\u202e\u2066-\u2069]/g;
const UNSAFE_CONTROL_OR_BIDI = /[\u0000-\u001f\u007f-\u009f\u061c\u200e\u200f\u202a-\u202e\u2066-\u2069]/;
const ANSI_ESCAPE = /\x1b(?:\][^\x07\x1b]*(?:\x07|\x1b\\)|\[[0-?]*[ -/]*[@-~]|[()][0-2]?[^\x1b]|[\x1b][\x1b]?)/g;
const UNSAFE_ANSI_ESCAPE = /\x1b(?:\][^\x07\x1b]*(?:\x07|\x1b\\)|\[[0-?]*[ -/]*[@-~]|[()][0-2]?[^\x1b]|[\x1b][\x1b]?)/;
const ARTIFACT_ID_PATTERN = /^[a-z][a-z0-9-]{0,79}$/;

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isSafeNonEmptyText(value: unknown, maxLength = MAX_DISPLAY_TEXT_LENGTH): value is string {
	return typeof value === "string"
		&& value.length > 0
		&& value.length <= maxLength
		&& !UNSAFE_CONTROL_OR_BIDI.test(value)
		&& !UNSAFE_ANSI_ESCAPE.test(value);
}

function isCounter(value: unknown): value is number {
	return typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
}

/** Remove terminal and directional controls while retaining ordinary Unicode. */
export function sanitizeDisplayText(value: unknown, maxLength = MAX_DISPLAY_TEXT_LENGTH): string {
	const text = typeof value === "string" ? value : "";
	const clean = text.replace(ANSI_ESCAPE, "").replace(CONTROL_OR_BIDI, "").trim();
	return clean.length <= maxLength ? clean : `${clean.slice(0, Math.max(0, maxLength - 1))}…`;
}

/** True only for a documented, single-component OpenSpec change name. */
export function isValidChangeName(value: unknown): value is string {
	return typeof value === "string"
		&& value.length > 0
		&& value.length <= MAX_CHANGE_NAME_LENGTH
		&& value.trim() === value
		&& CHANGE_NAME_PATTERN.test(value);
}

function validateArtifact(value: unknown): ArtifactStatus | null {
	if (!isRecord(value) || typeof value.id !== "string" || !ARTIFACT_ID_PATTERN.test(value.id)) return null;
	if (value.status !== "done" && value.status !== "ready" && value.status !== "blocked") return null;
	return { id: value.id, status: value.status };
}

/** Validate one item from `openspec list --json`. */
export function validateChangeSummary(value: unknown): ChangeSummary | null {
	if (!isRecord(value) || !isValidChangeName(value.name)) return null;
	if (!isCounter(value.completedTasks) || !isCounter(value.totalTasks) || value.completedTasks > value.totalTasks) return null;
	if (!isSafeNonEmptyText(value.lastModified) || !isSafeNonEmptyText(value.status)) return null;
	return {
		name: value.name,
		completedTasks: value.completedTasks,
		totalTasks: value.totalTasks,
		lastModified: value.lastModified,
		status: value.status,
	};
}

/** Validate a complete `openspec status --json` payload before callers use it. */
export function validateChangeDetail(value: unknown, expectedName: string): ChangeDetail | null {
	if (!isRecord(value) || value.changeName !== expectedName || !isValidChangeName(value.changeName)) return null;
	if (!isSafeNonEmptyText(value.schemaName) || typeof value.isComplete !== "boolean") return null;
	if (!Array.isArray(value.applyRequires) || !value.applyRequires.every((id) => typeof id === "string" && ARTIFACT_ID_PATTERN.test(id))) return null;
	if (!Array.isArray(value.artifacts)) return null;
	const artifacts = value.artifacts.map(validateArtifact);
	if (artifacts.some((artifact) => artifact === null)) return null;
	return {
		changeName: value.changeName,
		schemaName: value.schemaName,
		isComplete: value.isComplete,
		applyRequires: value.applyRequires as string[],
		artifacts: artifacts as ArtifactStatus[],
	};
}

/** Return a bounded message that never reflects untrusted CLI text. */
export function safeError(message: string): string {
	return sanitizeDisplayText(message, MAX_DISPLAY_TEXT_LENGTH) || "OpenSpec returned invalid data";
}
