import { Graph } from "./Graph";

/**
 * Takes one step thorough the automata represented by the graph, returning the
 * next state(s).
 * @param g       The graph.
 * @param current The current state.
 * @param symbol  The symbol.
 */
export function step(g: Readonly<Graph>, current: string, symbol: string): Set<string> {
	if (current in g) {
		const nextStates = new Set<string>();

		if (symbol in g[current]) {
			g[current][symbol].forEach(s => nextStates.add(s));
		}

		if (Graph.Epsilon in g[current]) {
			g[current][Graph.Epsilon].forEach(s => step(g, s, symbol).forEach(s => nextStates.add(s)));
		}

		return nextStates;
	}
	else {
		throw new Error(`the current state "${current}" is not part of the graph`);
	}
}

/**
 * Runs the automata represented by the graph as far as possible, returning the
 * state(s) it is left in after the string is empty.
 * @param g      The graph.
 * @param start  The starting state.
 * @param string The string.
 */
export function run(g: Readonly<Graph>, start: string, string: string): Set<string> {
	if (string.length === 0) {
		return new Set<string>([start]);
	}
	else {
		const s = string[0];
		const rest = string.substring(1);

		const nextStates = step(g, start, s);
		const finalStates = new Set<string>();
		for (const state of nextStates) {
			run(g, state, rest).forEach(s => finalStates.add(s));
		}
		return finalStates;
	}
}