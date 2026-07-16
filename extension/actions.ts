import type { OverlayAction } from "./types.ts";
import { isValidChangeName } from "./validation.ts";

/** Construct an editor command only from a validated change identifier. */
export function editorCommandForAction(action: OverlayAction): string | null {
	if (action.type === "propose") return "/opsx-propose ";
	if (action.type === "cancel" || !isValidChangeName(action.changeName)) return null;
	const commands = {
		apply: "/opsx-apply",
		verify: "/opsx-verify",
		explore: "/opsx-explore",
		archive: "/opsx-archive",
	} as const;
	return `${commands[action.type]} ${action.changeName}`;
}
