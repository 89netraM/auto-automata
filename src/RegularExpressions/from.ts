import { Automata } from "../Automata";
import { Graph } from "../Graph";
import { Alternative } from "./Alternative";
import { Nil } from "./Nil";
import { RegularExpression } from "./RegularExpression";
import { Sequence } from "./Sequence";
import { Star } from "./Star";
import { Symbol } from "./Symbol";

// Steps for the algorithm from http://www.cse.chalmers.se/edu/year/2020/course/TMV028_Automata/lectures/L8.pdf#page=19
// But this first step is from https://www.geeksforgeeks.org/generating-regular-expression-from-finite-automata/

export function fromAutomata(a: Automata): RegularExpression {
	/**
	 * Map from state names (from-to) to the expressions that describe the
	 * transition.
	 */
	const expressions = new Map<string, RegularExpression>();
	/**
	 * A list of edges.
	 */
	let paths = new Array<[string, string]>();

	/**
	 * Creates a key for accessing the expression of the edge between the two
	 * states.
	 * @param from The name of the origin state.
	 * @param to   The name of the target state.
	 */
	const makeKey = (from: string, to: string): string => `${from}-${to}`;
	/**
	 * Inserts the given expression into the
	 * @param from The name of the origin state.
	 * @param exp  The partial expression for this transition.
	 * @param to   The name of the target state.
	 */
	const insertExpressionEdge = (from: string, exp: RegularExpression, to: string): void => {
		const key = makeKey(from, to);
		if (expressions.has(key)) {
			exp = new Alternative(expressions.get(key), exp);
		}
		expressions.set(key, exp);
		addPath(from, to);
	};

	/**
	 * Adds the edge described by the state names to the path list.
	 * @param from The name of the origin state.
	 * @param to   The name of the target state.
	 */
	const addPath = (from: string, to: string): void => {
		if (!paths.some(([f, t]) => f === from && t === to)) {
			paths.push([from, to]);
		}
	};

	let startingStateName = "sₛ";
	while (startingStateName in a.states) {
		startingStateName += "ₛ";
	}
	// From new starting to old starting
	insertExpressionEdge(
		startingStateName,
		Nil.Instance,
		a.starting,
	);

	// Add all existing edges
	for (const fromName in a.states) {
		for (const path in a.states[fromName]) {
			const exp = path === Graph.Epsilon ? Nil.Instance : new Symbol(path);
			for (const toName of a.states[fromName][path]) {
				if (toName !== Graph.Empty) {
					insertExpressionEdge(
						fromName,
						exp,
						toName,
					);
				}
			}
		}
	}

	let acceptingStateName = "sₐ";
	while (acceptingStateName in a.states) {
		acceptingStateName += "ₐ";
	}
	// From all old accepting to new accepting
	for (const stateName of a.accepting) {
		insertExpressionEdge(
			stateName,
			Nil.Instance,
			acceptingStateName,
		);
		addPath(stateName, acceptingStateName);
	}

	// Eliminate states
	for (const state in a.states) {
		const froms: Array<[string, RegularExpression]> = paths
			.filter(([f, t]) => f !== state && t === state)
			.map(([f, t]) => [f, expressions.get(makeKey(f, t))]);
		const tos: Array<[RegularExpression, string]> = paths
			.filter(([f, t]) => f === state && t !== state)
			.map(([f, t]) => [expressions.get(makeKey(f, t)), t]);

		paths = paths.filter(([f, t]) => !(f === state || state === t));

		const selfKey = makeKey(state, state);
		for (let [fromName, exp] of froms) {
			expressions.delete(makeKey(fromName, state));
			if (expressions.has(selfKey)) {
				exp = new Sequence(exp, new Star(expressions.get(selfKey)));
			}
			for (const [thenExp, toName] of tos) {
				expressions.delete(makeKey(state, toName));
				insertExpressionEdge(
					fromName,
					new Sequence(exp, thenExp),
					toName,
				);
			}
		}
		expressions.delete(selfKey);
	}

	const finalKey = makeKey(startingStateName, acceptingStateName);
	if (expressions.size === 1 && expressions.has(finalKey)) {
		return expressions.get(finalKey).simplify();
	}
	else {
		return null;
	}
}