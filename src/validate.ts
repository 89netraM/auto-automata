import { Graph } from "./Graph";

/**
 * Validates a graph against itself and a language.
 * Returns `true` or a string describing the error.
 * @param g The graph.
 * @param l The language.
 */
export function validate(g: Graph, l: ReadonlySet<string>): boolean | string {
	for (const stateName in g) {
	for (const stateName in g.states) {
		for (const symbol in g.states[stateName]) {
			if (!l.has(symbol) && symbol !== Graph.Epsilon) {
				return `"${symbol}" is not part of the language`;
			}
			for (const targetStateName of g.states[stateName][symbol]) {
				if (!(targetStateName in g.states)) {
					return `no state named "${targetStateName}" exists`;
				}
			}
		}
	}
	return true;
}