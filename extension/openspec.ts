/** Data layer for OpenSpec CLI interaction. All CLI data is validated here. */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import type { ChangeSummary, ChangeDetail, TaskGroup } from "./types.ts";
import { parseTaskGroups } from "./tasks-parser.ts";
import {
	isValidChangeName,
	safeError,
	validateChangeDetail,
	validateChangeSummary,
} from "./validation.ts";

export interface CliCheckResult {
	available: boolean;
	reason?: string;
}

let _openSpecDir: string | null | undefined;

/** Resolve the project root containing `openspec/changes`, including git fallback. */
export async function resolveOpenSpecDir(pi: ExtensionAPI): Promise<string | null> {
	try {
		const cwdResult = await pi.exec("test", ["-d", "openspec/changes"], { timeout: 5000 });
		if (cwdResult.code === 0) return process.cwd();
	} catch { /* fall through */ }
	try {
		const gitResult = await pi.exec("git", ["rev-parse", "--show-toplevel"], { timeout: 5000 });
		const gitRoot = gitResult.code === 0 ? gitResult.stdout?.trim() : undefined;
		if (gitRoot) {
			const rootCheck = await pi.exec("test", ["-d", `${gitRoot}/openspec/changes`], { timeout: 5000 });
			if (rootCheck.code === 0) return gitRoot;
		}
	} catch { /* no OpenSpec root */ }
	return null;
}

export async function getOpenSpecDir(pi: ExtensionAPI): Promise<string | null> {
	if (_openSpecDir === undefined) _openSpecDir = await resolveOpenSpecDir(pi);
	return _openSpecDir;
}

export function resetOpenSpecDir(): void {
	_openSpecDir = undefined;
}

export async function checkCliAvailable(pi: ExtensionAPI): Promise<CliCheckResult> {
	try {
		const result = await pi.exec("openspec", ["--help"], { timeout: 5000 });
		return result.code === 0
			? { available: true }
			: { available: false, reason: "OpenSpec CLI returned a non-zero exit code" };
	} catch {
		return { available: false, reason: "OpenSpec CLI could not be executed" };
	}
}

async function execOpenSpecJson(
	pi: ExtensionAPI,
	args: string[],
	errorLabel: string,
	cwd?: string,
): Promise<{ data: unknown | null; error: string | null }> {
	try {
		const result = await pi.exec("openspec", args, { timeout: 10000, ...(cwd ? { cwd } : {}) });
		if (result.code !== 0) return { data: null, error: `${errorLabel}: command failed` };
		const stdout = result.stdout?.trim() || "";
		try {
			return { data: JSON.parse(stdout), error: null };
		} catch {
			return { data: null, error: `${errorLabel}: invalid JSON response` };
		}
	} catch {
		return { data: null, error: `${errorLabel}: command failed` };
	}
}

/** Fetch and validate active changes; malformed payloads are rejected wholesale. */
export async function listChanges(pi: ExtensionAPI): Promise<{ changes: ChangeSummary[]; error: string | null }> {
	const dir = await getOpenSpecDir(pi);
	const result = await execOpenSpecJson(pi, ["list", "--json"], "OpenSpec list", dir ?? undefined);
	if (result.error) return { changes: [], error: safeError(result.error) };
	if (!result.data || typeof result.data !== "object" || !Array.isArray((result.data as { changes?: unknown }).changes)) {
		return { changes: [], error: "OpenSpec returned invalid change data" };
	}
	const changes = (result.data as { changes: unknown[] }).changes.map(validateChangeSummary);
	if (changes.some((change) => change === null)) {
		return { changes: [], error: "OpenSpec returned invalid change data" };
	}
	return { changes: changes as ChangeSummary[], error: null };
}

/** Fetch and validate one change status. Invalid names never reach the CLI. */
export async function getChangeStatus(
	pi: ExtensionAPI,
	name: string,
): Promise<{ detail: ChangeDetail | null; error: string | null }> {
	if (!isValidChangeName(name)) return { detail: null, error: "OpenSpec returned an invalid change name" };
	const dir = await getOpenSpecDir(pi);
	const result = await execOpenSpecJson(pi, ["status", "--json", "--change", name], "OpenSpec status", dir ?? undefined);
	if (result.error) return { detail: null, error: safeError(result.error) };
	const detail = validateChangeDetail(result.data, name);
	return detail
		? { detail, error: null }
		: { detail: null, error: "OpenSpec returned invalid status data" };
}

/**
 * Read tasks only from the resolved OpenSpec root and a validated, single-component
 * change identifier. No CLI-provided path is ever accepted for filesystem access.
 */
export async function fetchTaskGroups(pi: ExtensionAPI, changeName: string): Promise<TaskGroup[]> {
	if (!isValidChangeName(changeName)) return [];
	try {
		const dir = await getOpenSpecDir(pi);
		if (!dir) return [];
		const changePath = `openspec/changes/${changeName}`;
		const taskPath = `${changePath}/tasks.md`;
		const [rootResult, changeResult, taskResult] = await Promise.all([
			pi.exec("realpath", ["--", "."], { timeout: 5000, cwd: dir }),
			pi.exec("realpath", ["--", changePath], { timeout: 5000, cwd: dir }),
			pi.exec("realpath", ["--", taskPath], { timeout: 5000, cwd: dir }),
		]);
		if (rootResult.code !== 0 || changeResult.code !== 0 || taskResult.code !== 0) return [];
		const root = rootResult.stdout?.trim();
		const changeDir = changeResult.stdout?.trim();
		const tasksFile = taskResult.stdout?.trim();
		const changesRoot = root ? `${root}/openspec/changes/` : "";
		if (!root || !changeDir || !tasksFile || !changeDir.startsWith(changesRoot) || tasksFile !== `${changeDir}/tasks.md`) return [];
		const result = await pi.exec("cat", ["--", taskPath], { timeout: 5000, cwd: dir });
		return result.code === 0 && result.stdout?.trim() ? parseTaskGroups(result.stdout) : [];
	} catch {
		return [];
	}
}

/** Fetch all active changes and their only validated status/task data. */
export async function fetchActiveChanges(pi: ExtensionAPI): Promise<{
	changes: ChangeSummary[];
	details: Map<string, ChangeDetail>;
	taskGroups: Map<string, TaskGroup[]>;
	error: string | null;
}> {
	const { changes, error: listError } = await listChanges(pi);
	if (listError) return { changes: [], details: new Map(), taskGroups: new Map(), error: listError };
	const details = new Map<string, ChangeDetail>();
	const taskGroups = new Map<string, TaskGroup[]>();
	for (const change of changes) {
		const { detail, error } = await getChangeStatus(pi, change.name);
		if (error || !detail) {
			return { changes: [], details: new Map(), taskGroups: new Map(), error: error ?? "OpenSpec returned invalid status data" };
		}
		details.set(change.name, detail);
		taskGroups.set(change.name, await fetchTaskGroups(pi, change.name));
	}
	return { changes, details, taskGroups, error: null };
}
