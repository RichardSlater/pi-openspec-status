import assert from "node:assert/strict";
import test from "node:test";
import fc from "fast-check";
import { parseTaskGroups } from "../extension/tasks-parser.ts";
import {
	isValidChangeName,
	MAX_DISPLAY_TEXT_LENGTH,
	sanitizeDisplayText,
	validateChangeDetail,
	validateChangeSummary,
} from "../extension/validation.ts";

const PROPERTY_RUNS = 100;
const JSON_VALUE = fc.jsonValue({ maxDepth: 3 });
const DISPLAY_TEXT = fc
	.array(
		fc.oneof(
			fc.string({ minLength: 1, maxLength: 16 }),
			fc.constantFrom("\x1b[2J", "\n", "\r", "\u202e", "\u2066", "\u200f"),
		),
		{ maxLength: 64 },
	)
	.map((parts) => parts.join(""));

function assertGroupInvariant(group: ReturnType<typeof parseTaskGroups>[number]): void {
	assert.ok(group.completed >= 0);
	assert.ok(group.total >= 0);
	assert.ok(group.completed <= group.total);
	assert.equal(
		group.status,
		group.total === 0 ? "empty" : group.completed === group.total ? "complete" : group.completed === 0 ? "none" : "partial",
	);
}

test("property: untrusted CLI payload validators are total and preserve accepted invariants", () => {
	fc.assert(
		fc.property(JSON_VALUE, (payload) => {
			const summary = validateChangeSummary(payload);
			if (summary) {
				assert.ok(summary.completedTasks >= 0);
				assert.ok(summary.totalTasks >= 0);
				assert.ok(summary.completedTasks <= summary.totalTasks);
				assert.ok(isValidChangeName(summary.name));
			}

			const detail = validateChangeDetail(payload, "valid-change");
			if (detail) {
				assert.equal(detail.changeName, "valid-change");
				assert.ok(detail.artifacts.every(({ status }) => ["done", "ready", "blocked"].includes(status)));
			}
		}),
		{ numRuns: PROPERTY_RUNS },
	);
});

test("property: change-name validation is total for arbitrary strings", () => {
	fc.assert(
		fc.property(fc.string({ maxLength: 256 }), (name) => {
			const result = isValidChangeName(name);
			if (result) assert.match(name, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
		}),
		{ numRuns: PROPERTY_RUNS },
	);
});

test("property: display sanitization is bounded and removes unsafe controls", () => {
	fc.assert(
		fc.property(DISPLAY_TEXT, (text) => {
			const clean = sanitizeDisplayText(text);
			assert.ok(clean.length <= MAX_DISPLAY_TEXT_LENGTH);
			assert.doesNotMatch(clean, /[\u0000-\u001f\u007f-\u009f\u061c\u200e\u200f\u202a-\u202e\u2066-\u2069]/);
			assert.doesNotMatch(clean, /\x1b/);
		}),
		{ numRuns: PROPERTY_RUNS },
	);
});

test("property: task Markdown parsing is total and group counters remain consistent", () => {
	fc.assert(
		fc.property(DISPLAY_TEXT, (markdown) => {
			const groups = parseTaskGroups(markdown);
			for (const group of groups) assertGroupInvariant(group);
		}),
		{ numRuns: PROPERTY_RUNS },
	);
});
