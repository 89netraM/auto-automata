import { Automata } from "./Automata";
import { Graph } from "./Graph";

export function formatTable(a: Readonly<Automata>): string {
	const transitions = Object.keys(a.states).some(k => Graph.Epsilon in a.states[k]) ? [Graph.Epsilon, ...a.alphabet] : [...a.alphabet];
	return [
		`\t\t${transitions.join("\t")}`,
		...Object.entries(a.states)
			.sort()
			.map(
				([key, value]) =>
					(a.starting === key ? "→ " : "") +
					(a.accepting.has(key) ? "* " : "") +
					key + "\t" +
					transitions.map(
						l => l in value && (value[l].size > 1 || !value[l].has(Graph.Empty)) ?
							value[l].size > 1 ? `{${[...value[l]].join(", ")}}` : [...value[l]][0] :
							Graph.Empty
					).join("\t")
			)
	].join("\n");
}