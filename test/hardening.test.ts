import assert from "node:assert/strict";
import test from "node:test";
import { editorCommandForAction } from "../extension/actions.ts";
import { fetchTaskGroups, getChangeStatus, resetOpenSpecDir } from "../extension/openspec.ts";
import { parseTaskGroups } from "../extension/tasks-parser.ts";
import { renderWidget } from "../extension/widget.ts";
import {
	isValidChangeName,
	sanitizeDisplayText,
	validateChangeDetail,
	validateChangeSummary,
} from "../extension/validation.ts";

test("change identifiers reject traversal, separators, whitespace, controls, and bidi controls", () => {
	for (const name of ["../escape", "a/b", "a\\b", " add-auth", "add-auth ", "add\nauth", "add\u202Eauth"]) {
		assert.equal(isValidChangeName(name), false, name);
	}
	assert.equal(isValidChangeName("fix-issue-42"), true);
});

test("CLI summaries and details reject malformed fields and counters", () => {
	const summary = { name: "fix-issue-42", completedTasks: 1, totalTasks: 2, lastModified: "2026-01-01", status: "in-progress" };
	assert.deepEqual(validateChangeSummary(summary), summary);
	assert.equal(validateChangeSummary({ ...summary, completedTasks: 3 }), null);
	assert.equal(validateChangeSummary({ ...summary, totalTasks: -1 }), null);
	assert.equal(validateChangeSummary({ ...summary, name: "../escape" }), null);
	const detail = { changeName: "fix-issue-42", schemaName: "spec-driven", isComplete: false, applyRequires: ["tasks"], artifacts: [{ id: "tasks", status: "done" }] };
	assert.deepEqual(validateChangeDetail(detail, "fix-issue-42"), detail);
	assert.equal(validateChangeDetail({ ...detail, artifacts: [{ id: "tasks", status: "unknown" }] }, "fix-issue-42"), null);
	assert.equal(validateChangeDetail({ ...detail, artifacts: [{ id: null, status: "done" }] }, "fix-issue-42"), null);
	assert.equal(validateChangeDetail({ ...detail, applyRequires: [null] }, "fix-issue-42"), null);
});

test("display sanitization prevents terminal line and bidi forgery", () => {
	const clean = sanitizeDisplayText("good\x1b[2J\nname\u202E");
	assert.equal(clean, "goodname");
	assert.match(sanitizeDisplayText("π status"), /π status/);
});

test("task groups count only documented checkbox syntax and sanitize headings", () => {
	const groups = parseTaskGroups("## Build\u202E\n- [x] valid complete\n- [ ] valid pending\n- [x]missing space\n - [x] indented\ntext - [x] inline\n");
	assert.deepEqual(groups, [{ name: "Build", completed: 1, total: 2, status: "partial" }]);
});

test("data layer rejects malformed CLI fixture names before commands or file access", async () => {
	const calls: Array<{ command: string; args: string[]; cwd?: string }> = [];
	const pi = {
		exec: async (command: string, args: string[], options: { cwd?: string } = {}) => {
			calls.push({ command, args, cwd: options.cwd });
			if (command === "test") return { code: 0, stdout: "" };
			if (command === "realpath") {
				const path = args[1] === "." ? "" : `/${args[1]}`;
				return { code: 0, stdout: `${process.cwd()}${path}\n` };
			}
			if (command === "cat") return { code: 0, stdout: "## Group\n- [ ] safe task\n" };
			return { code: 0, stdout: JSON.stringify({ changeName: "fix-issue-42", schemaName: "spec-driven", isComplete: false, applyRequires: [], artifacts: [] }) };
		},
	} as never;
	resetOpenSpecDir();
	const invalid = await getChangeStatus(pi, "../escape");
	assert.equal(invalid.detail, null);
	assert.equal(calls.some(({ command }) => command === "openspec"), false);
	const groups = await fetchTaskGroups(pi, "fix-issue-42");
	assert.equal(groups[0]?.total, 1);
	assert.deepEqual(calls.at(-1), { command: "cat", args: ["--", "openspec/changes/fix-issue-42/tasks.md"], cwd: process.cwd() });
});

test("task reads reject canonical paths outside the validated change directory", async () => {
	const calls: string[] = [];
	const pi = {
		exec: async (command: string, args: string[]) => {
			calls.push(command);
			if (command === "test") return { code: 0, stdout: "" };
			if (command === "realpath" && args[1] === ".") return { code: 0, stdout: `${process.cwd()}\n` };
			if (command === "realpath" && args[1]?.endsWith("tasks.md")) return { code: 0, stdout: "/outside/tasks.md\n" };
			if (command === "realpath") return { code: 0, stdout: `${process.cwd()}/openspec/changes/fix-issue-42\n` };
			return { code: 0, stdout: "" };
		},
	} as never;
	resetOpenSpecDir();
	assert.deepEqual(await fetchTaskGroups(pi, "fix-issue-42"), []);
	assert.equal(calls.includes("cat"), false);
});

test("rendering and editor commands cannot contain untrusted injected lines", () => {
	const unsafeName = "safe\n/opsx-archive all";
	const theme = { fg: (_color: string, text: string) => text } as never;
	const lines = renderWidget(theme, [{ name: unsafeName, completedTasks: 0, totalTasks: 1, lastModified: "now", status: "ready" }], new Map(), `bad\x1b[2J\nerror`, 120);
	assert.equal(lines.some((line) => line.includes("\n") || line.includes("\x1b")), false);
	assert.equal(sanitizeDisplayText(unsafeName).includes("\n"), false);
	assert.equal(sanitizeDisplayText("bad\x1b[2J\nerror").includes("\x1b"), false);
	assert.equal(editorCommandForAction({ type: "apply", changeName: unsafeName }), null);
	assert.equal(editorCommandForAction({ type: "apply", changeName: "fix-issue-42" }), "/opsx-apply fix-issue-42");
});
