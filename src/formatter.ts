import { Automata } from "./Automata";

export function formatTable(a: Automata): string {
	return [
		`\t\t${[...a.alphabet].join("\t")}`,
		...Object.entries(a.states).map(
			([key, value]) =>
				(a.starting === key ? "→ " : "") +
				(a.accepting.has(key) ? "* " : "") +
				key + "\t" +
				[...a.alphabet].map(
					l => l in value ? `{${[...value[l]].join(", ")}}` : "∅"
				).join("\t")
		)
	].join("\n");
}