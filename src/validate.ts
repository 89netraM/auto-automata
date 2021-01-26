import { Graph } from "./Graph";

/**
 * Validates a graph against itself and a language.
 * Returns `true` or a string describing the error.
 * @param g The graph.
 * @param l The language.
 */
export function validate(g: Graph, l: ReadonlySet<string>): boolean | string {
	for (const stateName in g) {
		for (const symbol in g[stateName]) {
			if (!l.has(symbol) && symbol !== Graph.Epsilon) {
				return `"${symbol}" is not part of the language`;
			}
			for (const targetStateName of g[stateName][symbol]) {
				if (!(targetStateName in g)) {
					return `no state named "${targetStateName}" exists`;
				}
			}
		}
	}
	return true;
}