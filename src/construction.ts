import { Automata } from "./Automata";
import { Graph } from "./Graph";

// Steps for the algorithm from https://condor.depaul.edu/glancast/444class/docs/nfa2dfa.html

interface SubState {
	name: string,
	states: Set<string>;
	accepting: boolean;
}

const SubState = {
	construct: (starting: string | ReadonlySet<string>, a: Readonly<Automata>): SubState => {
		const states = Graph.epsilonClosure(a.states, starting);
		return {
			name: SubState.name(states),
			states,
			accepting: [...states].some(s => a.accepting.has(s)),
		}
	},
	name: (states: Iterable<string>): string => [...states].sort().join(","),
};

/**
 * Takes an automata *N* and constructs a DFA *D* such that *L(N) = L(D)*.
 * @param a The input automata, either a NFA or a ε-NFA.
 */
export function constructSubset(a: Readonly<Automata>): Automata {
	const states = { };
	const accepting = new Set<string>();

	const startingState = SubState.construct(a.starting, a);
	const queue = new Array<SubState>(startingState);
	while (queue.length > 0) {
		const state = queue.shift();
		states[state.name] = {};
		for (const symbol of a.alphabet) {
			const reachableStates = new Set<string>();
			for (const current of state.states) {
				Graph.step(a.states, current, symbol).forEach(s => reachableStates.add(s));
			}
			states[state.name][symbol] = new Set([reachableStates.size > 0 ? SubState.name(reachableStates) : Graph.Empty]);

			if (state.accepting) {
				accepting.add(state.name);
			}

			if (reachableStates.size > 0) {
				const nextState = SubState.construct(reachableStates, a);
				if (!(nextState.name in states)) {
					queue.push(nextState);
				}
			}
		}
	}

	states[Graph.Empty] = {};
	for (const symbol of a.alphabet) {
		states[Graph.Empty][symbol] = new Set([Graph.Empty]);
	}

	return {
		starting: startingState.name,
		accepting,
		states,
		alphabet: new Set(a.alphabet),
	};
}