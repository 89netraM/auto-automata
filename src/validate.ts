import { Automata } from "./Automata";
import { Graph } from "./Graph";

export interface ValidatorError {
	path: Array<string>;
	error: string;
}

/**
 * Validates an automatas starting, accepting, and state against itself and its
 * alphabet. Returns `true` or a string describing the error.
 * @param a The automata.
 */
export function automataValidate(a: Readonly<Automata>): true | Array<ValidatorError> {
	const errors = new Array<ValidatorError>();

	if (a.starting == null) {
		errors.push({
			path: ["start"],
			error: `no starting state selected`
		});
	}
	else if (!(a.starting in a.states)) {
		errors.push({
			path: ["start"],
			error: `the starting state "${a.starting}" does not exists`
		});
	}
	for (const targetStateName of a.accepting) {
		if (!(targetStateName in a.states)) {
			errors.push({
				path: ["accepting"],
				error: `the accepting state "${targetStateName}" does not exists`
			});
		}
	}

	const stateErrors = graphValidate(a.states, a.alphabet);
	if (typeof stateErrors !== "boolean") {
		errors.push(...stateErrors.map(e => { e.path.unshift("states"); return e; }));
	}

	return errors.length === 0 || errors;
}

/**
 * Validates a graph against itself and a alphabet.
 * Returns `true` or a string describing the error.
 * @param g The graph.
 * @param a The alphabet.
 */
export function graphValidate(g: Readonly<Graph>, a: ReadonlySet<string>): true | Array<ValidatorError> {
	const errors = new Array<ValidatorError>();

	for (const stateName in g) {
		for (const symbol in g[stateName]) {
			if (!a.has(symbol) && symbol !== Graph.Epsilon) {
				errors.push({
					path: [stateName],
					error: `"${symbol}" is not part of the alphabet`
				});
			}
			for (const targetStateName of g[stateName][symbol]) {
				if (!(targetStateName in g)) {
					errors.push({
						path: [stateName, symbol],
						error: `no state named "${targetStateName}" exists`
					});
				}
			}
		}
	}

	return errors.length === 0 || errors;
}