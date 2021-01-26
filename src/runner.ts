import { Automata } from "./Automata";
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
export function graphRun(g: Readonly<Graph>, start: string, string: string): Set<string> {
	if (string.length === 0) {
		return new Set<string>([start]);
	}
	else {
		const s = string[0];
		const rest = string.substring(1);

		const nextStates = step(g, start, s);
		const finalStates = new Set<string>();
		for (const state of nextStates) {
			graphRun(g, state, rest).forEach(s => finalStates.add(s));
		}
		return finalStates;
	}
}

/**
 * Runs the automata from start with the provided string. Returns the state(s)
 * it's left in.
 * @param a      The automata.
 * @param string The string.
 */
export function automataRun(a: Readonly<Automata>, string: string): Set<string>;
/**
 * Runs the automata from the provided starting state with the provided string.
 * Returns the state(s) it's left in.
 * @param a             The automata.
 * @param startingState The starting state.
 * @param string        The string.
 */
export function automataRun(a: Readonly<Automata>, startingState: string, string: string): Set<string>;
export function automataRun(a: Readonly<Automata>, startingOrString: string, string?: string): Set<string> {
	let starting: string;
	[starting, string] = string == null ? [a.starting, startingOrString] : [startingOrString, string];
	return graphRun(a.states, starting, string);
}