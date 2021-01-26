import { Graph } from "./Graph";

export interface ValidatorError {
	path: Array<string>;
	error: string;
}

/**
 * Validates a graph against itself and a language.
 * Returns `true` or a string describing the error.
 * @param g The graph.
 * @param l The language.
 */
export function validate(g: Graph, l: ReadonlySet<string>): boolean | Array<ValidatorError> {
	const errors = new Array<ValidatorError>();

	if (!(g.start in g.states)) {
		errors.push({
			path: ["start"],
			error: `no state named "${g.start}" exists`
		});
	}
	for (const targetStateName of g.accepting) {
		if (!(targetStateName in g.states)) {
			errors.push({
				path: ["accepting"],
				error: `no state named "${targetStateName}" exists`
			});
		}
	}

	for (const stateName in g.states) {
		for (const symbol in g.states[stateName]) {
			if (!l.has(symbol) && symbol !== Graph.Epsilon) {
				errors.push({
					path: ["states", stateName],
					error: `"${symbol}" is not part of the language`
				});
			}
			for (const targetStateName of g.states[stateName][symbol]) {
				if (!(targetStateName in g.states)) {
					errors.push({
						path: ["states", stateName, symbol],
						error: `no state named "${targetStateName}" exists`
					});
				}
			}
		}
	}

	return errors.length === 0 || errors;
}