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

export function fromAutomata(a: Automata): RegularExpression;
export function fromAutomata(a: Automata, step: (a: Automata) => void): RegularExpression;
export function fromAutomata(a: Automata, step?: (a: Automata) => void): RegularExpression {
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
		expressions.set(key, exp.simplify());
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

	/**
	 * If a `step` function was provided, creates an automata for the
	 * "current" step and calls `step` with it.
	 */
	const callStep = (): void => {
		if (step != null) {
			const a: Automata = {
				starting: startingStateName,
				accepting: new Set<string>([acceptingStateName]),
				states: {
					[acceptingStateName]: {},
				},
				alphabet: new Set<string>(),
			};

			for (const [from, to] of paths) {
				const exp = expressions.get(makeKey(from, to)).simplify().format();
				a.alphabet.add(exp);

				if (!(from in a.states)) {
					a.states[from] = {};
				}
				const set = exp in a.states[from] ? a.states[from][exp] : new Set<string>();
				set.add(to);
				a.states[from][exp] = set;
			}

			step(a);
		}
	};

	// Eliminate states
	callStep();
	const stateConnections: { [stateName: string]: number } = {};
	for (const [from, to] of paths) {
		if (from !== startingStateName) {
			stateConnections[from] = from in stateConnections ? stateConnections[from] + 1 : 1;
		}
		if (to !== from && to !== acceptingStateName) {
			stateConnections[to] = to in stateConnections ? stateConnections[to] + 1 : 1;
		}
	}
	for (const state of Object.keys(a.states).sort((a, b) => stateConnections[a] - stateConnections[b])) {
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
		callStep();
	}

	const finalKey = makeKey(startingStateName, acceptingStateName);
	if (expressions.size === 1 && expressions.has(finalKey)) {
		return expressions.get(finalKey).simplify();
	}
	else {
		return null;
	}
}