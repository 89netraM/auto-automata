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
	name: (states: Iterable<string>): string => {
		const arr = new Array<string>(...states);
		if (arr.every(s => s === Graph.Empty)) {
			return Graph.Empty;
		}
		else {
			return arr.filter(s => s !== Graph.Empty).sort().join("");
		}
	},
};

/**
 * Takes an automata *N* and constructs a DFA *D* such that *L(N) = L(D)*.
 * @param a The input automata, either a NFA or a ε-NFA.
 */
export function constructSubset(a: Readonly<Automata>): Automata;
/**
 * Takes an automata *N* and constructs a DFA *D* such that *L(N) = L(D)*.
 * @param a    The input automata, either a NFA or a ε-NFA.
 * @param step Called once for each step with the thus far constructed automata.
 */
export function constructSubset(a: Readonly<Automata>, step: (a: Automata) => void): Automata;
export function constructSubset(a: Readonly<Automata>, step?: (a: Automata) => void): Automata {
	const states: Graph = { };
	const accepting = new Set<string>();

	const startingState = SubState.construct(a.starting, a);

	const makeAutomata = (): Automata => {
		const statesClone: Graph = {};
		for (const state in states) {
			statesClone[state] = {};
			for (const symbol in states[state]) {
				statesClone[state][symbol] = new Set<string>(states[state][symbol]);
			}
		}
		return {
			starting: startingState.name,
			accepting: new Set<string>(accepting),
			states: statesClone,
			alphabet: new Set(a.alphabet),
		};
	};

	const queue = new Array<SubState>(startingState);
	states[startingState.name] = {};
	if (startingState.accepting) {
		accepting.add(startingState.name);
	}
	while (queue.length > 0) {
		const state = queue.shift();
		for (const symbol of a.alphabet) {
			const reachableStates = new Set<string>();
			for (const current of state.states) {
				Graph.step(a.states, current, symbol).forEach(s => reachableStates.add(s));
			}
			if (reachableStates.size > 0) {
				const nextState = SubState.construct(reachableStates, a);
				states[state.name][symbol] = new Set([nextState.name]);

				if (!(nextState.name in states)) {
					states[nextState.name] = {};
					if (nextState.accepting) {
						accepting.add(nextState.name);
					}
					queue.push(nextState);
				}
			}
			else {
				states[state.name][symbol] = new Set([Graph.Empty]);
				if (!(Graph.Empty in states)) {
					states[Graph.Empty] = {};
					for (const symbol of a.alphabet) {
						states[Graph.Empty][symbol] = new Set([Graph.Empty]);
					}
				}
			}
		}
		if (step != null) {
			step(makeAutomata());
		}
	}

	return makeAutomata();
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

export function constructProduct(a: Automata, b: Automata): Automata | null;
export function constructProduct(a: Automata, b: Automata, step: (a: Automata) => void): Automata | null;
export function constructProduct(a: Automata, b: Automata, step?: (a: Automata) => void): Automata | null {
	if (Graph.isDFA(a.states) && Graph.isDFA(b.states) &&
		[...a.alphabet].every(l => b.alphabet.has(l)) &&
		[...b.alphabet].every(l => a.alphabet.has(l))) {
		const starting = SubState.name([a.starting, b.starting]);
		const accepting = cartesianProduct(a.accepting, b.accepting);

		const states: Graph = {};

		const makeAutomata = (): Automata => {
			const statesClone: Graph = {};
			for (const state in states) {
				statesClone[state] = {};
				for (const symbol in states[state]) {
					statesClone[state][symbol] = new Set<string>(states[state][symbol]);
				}
			}
			return {
				starting,
				accepting,
				states: statesClone,
				alphabet: new Set(a.alphabet),
			};
		};

		const queue = new Array<[string, string]>();
		const enqueue = (name: string, a: string, b: string): void => {
			if (!(name in states)) {
				queue.push([a, b]);
				states[name] = {};
			}
		};
		enqueue(starting, a.starting, b.starting);
		while (queue.length > 0) {
			const [aState, bState] = queue.shift();
			const transitions = {};
			for (const l of a.alphabet) {
				const aTarget = [...a.states[aState][l]][0];
				const bTarget = [...b.states[bState][l]][0];
				const targetName = SubState.name([aTarget, bTarget]);
				transitions[l] = new Set<string>([targetName]);
				enqueue(targetName, aTarget, bTarget);
			}
			states[SubState.name([aState, bState])] = transitions;

			if (step != null) {
				step(makeAutomata());
			}
		}

		return makeAutomata();
	}
	else {
		console.log(Graph.isDFA(a.states), Graph.isDFA(b.states),
		[...a.alphabet].every(l => b.alphabet.has(l)),
		[...b.alphabet].every(l => a.alphabet.has(l)));
		return null;
	}
}

export function constructSum(a: Readonly<Automata>, b: Readonly<Automata>): Automata | null;
export function constructSum(a: Readonly<Automata>, b: Readonly<Automata>, step: (a: Automata) => void): Automata | null;
export function constructSum(a: Readonly<Automata>, b: Readonly<Automata>, step?: (a: Automata) => void): Automata | null {
	if (Graph.isDFA(a.states) && Graph.isDFA(b.states) &&
		[...a.alphabet].every(l => b.alphabet.has(l)) &&
		[...b.alphabet].every(l => a.alphabet.has(l))) {
		const starting = SubState.name([a.starting, b.starting]);
		const accepting = new Set<string>();

		const states: Graph = {};

		const makeAutomata = (): Automata => {
			const statesClone: Graph = {};
			for (const state in states) {
				statesClone[state] = {};
				for (const symbol in states[state]) {
					statesClone[state][symbol] = new Set<string>(states[state][symbol]);
				}
			}
			return {
				starting,
				accepting: new Set<string>(accepting),
				states: statesClone,
				alphabet: new Set(a.alphabet),
			};
		};

		const queue = new Array<[string, string]>();
		const enqueue = (name: string, aTarget: string, bTarget: string): void => {
			if (!(name in states)) {
				queue.push([aTarget, bTarget]);
				states[name] = {};
				if (a.accepting.has(aTarget) || b.accepting.has(bTarget)) {
					accepting.add(name);
				}
			}
		};
		enqueue(starting, a.starting, b.starting);
		while (queue.length > 0) {
			const [aState, bState] = queue.shift();
			const transitions = {};
			for (const l of a.alphabet) {
				const aTarget = [...a.states[aState][l]][0];
				const bTarget = [...b.states[bState][l]][0];
				const targetName = SubState.name([aTarget, bTarget]);
				transitions[l] = new Set<string>([targetName]);
				enqueue(targetName, aTarget, bTarget);
			}
			states[SubState.name([aState, bState])] = transitions;

			if (step != null) {
				step(makeAutomata());
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