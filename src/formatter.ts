import { Automata } from "./Automata";
import { Graph } from "./Graph";

export function formatTable(a: Readonly<Automata>): string {
	const transitions = Object.values(a.states).some(s => Graph.Epsilon in s) ? [Graph.Epsilon, ...a.alphabet] : [...a.alphabet];
	const isDFA = Object.values(a.states).every(s =>
		!Object.keys(s).some(k => k === Graph.Epsilon) &&
		Object.values(s).every(set => set.size === 1)
	);
	return [
		`\t${transitions.join("\t")}`,
		...Object.entries(a.states)
			.sort()
			.map(
				([key, value]) =>
					(a.starting === key ? "→ " : "") +
					(a.accepting.has(key) ? "* " : "") +
					key + "\t" +
					transitions.map(
						l => l in value && (value[l].size > 1 || !value[l].has(Graph.Empty)) ?
							!isDFA ? `{${[...value[l]].join(", ")}}` : [...value[l]][0] :
							Graph.Empty
					).join("\t")
			)
	].join("\n");
}