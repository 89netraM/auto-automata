import { Automata } from "./Automata";
import { Graph } from "./Graph";

export function formatTable(a: Readonly<Automata>): string {
	return [
		`\t\t${[...a.alphabet].join("\t")}`,
		...Object.entries(a.states).map(
			([key, value]) =>
				(a.starting === key ? "→ " : "") +
				(a.accepting.has(key) ? "* " : "") +
				key + "\t" +
				[...a.alphabet].map(
					l => l in value && (value[l].size > 1 || !value[l].has(Graph.Empty)) ? `{${[...value[l]].join(", ")}}` : Graph.Empty
				).join("\t")
		)
	].join("\n");
}