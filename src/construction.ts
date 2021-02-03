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

function cartesianProduct(a: ReadonlySet<string>, b: ReadonlySet<string>): Set<string> {
	const set = new Set<string>();
	for (const aName of a) {
		for (const bName of b) {
			set.add(SubState.name([aName, bName]));
		}
	}
	return set;
}

export function constructProduct(a: Automata, b: Automata): Automata | null {
	if (Graph.isDFA(a.states) && Graph.isDFA(b.states) &&
		[...a.alphabet].every(l => b.alphabet.has(l)) &&
		[...b.alphabet].every(l => a.alphabet.has(l))) {
		const starting = SubState.name([a.starting, b.starting]);
		const accepting = cartesianProduct(a.accepting, b.accepting);

		const states: Graph = {};
		for (const aState in a.states) {
			for (const bState in b.states) {
				const transitions = {};
				for (const l of a.alphabet) {
					transitions[l] = cartesianProduct(a.states[aState][l], b.states[bState][l]);
				}
				states[SubState.name([aState, bState])] = transitions;
			}
		}

		return {
			starting,
			accepting,
			states,
			alphabet: a.alphabet,
		}
	}
	else {
		return null;
	}
}