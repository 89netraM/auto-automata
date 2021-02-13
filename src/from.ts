import { Alternative, Reference, RegularExpression, Sequence, Star, Symbol } from "./RegularExpressions";
import { Automata } from "./Automata";
import { Graph } from "./Graph";
import { Nil } from "./RegularExpressions/Nil";
import { Empty } from "./RegularExpressions/Empty";

class StateNameGenerator {
	public static generateName(number: number): string {
		const bigString = number.toString();
		let nameString = "s";
		for (let i = 0; i < bigString.length; i++) {
			nameString += String.fromCodePoint(bigString.codePointAt(i) + 0x2050);
		}
		return nameString;
	}

	public constructor(
		public number: number,
	) { }

	public toString(): string {
		return StateNameGenerator.generateName(this.number);
	}
}

export function fromRegularExpression(regularExpression: RegularExpression): Automata;
export function fromRegularExpression(regularExpression: RegularExpression, step: (a: Automata) => void): Automata;
export function fromRegularExpression(regularExpression: RegularExpression, step?: (a: Automata) => void): Automata {
	const stateMap = new Array<[StateNameGenerator, { [pathName: string]: Set<StateNameGenerator> }]>();

	const stateNames = new Array<StateNameGenerator>();
	const getStateAfter = (previous: StateNameGenerator): StateNameGenerator => {
		const next = new StateNameGenerator(previous.number + 1);
		for (const generator of stateNames) {
			if (generator.number > previous.number) {
				generator.number++;
			}
		}
		stateNames.push(next);
		return next;
	};

	const starting = new StateNameGenerator(0);
	const accepting = getStateAfter(starting);

	const generateStates = (): Graph => {
		const states: Graph = {};
		for (const [name, transitionMap] of stateMap) {
			const transitions = {};
			for (const path in transitionMap) {
				transitions[path] = new Set<string>([...transitionMap[path]].map(g => g.toString()));
			}
			states[name.toString()] = transitions;
		}
		return states;
	};
	const generateAutomata = (): Automata => {
		const states = generateStates();
		const alphabet = new Set<string>();
		for (const state of Object.values(states)) {
			for (const transitionName in state) {
				if (transitionName !== Graph.Epsilon) {
					alphabet.add(transitionName);
				}
			}
		}
		return {
			alphabet,
			accepting: new Set<string>([ accepting.toString() ]),
			starting: starting.toString(),
			states: {
				[accepting.toString()]: { },
				...states
			},
		};
	};

	const setState = (name: StateNameGenerator, value: typeof stateMap[number][1]): void => {
		const entry = stateMap.find(([n, _]) => n.number === name.number);
		if (entry == null) {
			stateMap.push([name, value]);
		}
		else {
			entry[1] = value;
		}
	};

	const callStep = () => {
		if (step != null) {
			step(generateAutomata());
		}
	};

	const addToStates = (start: StateNameGenerator, exp: RegularExpression, end: StateNameGenerator): void => {
		if (exp instanceof Alternative) {
			const aStart = getStateAfter(start);
			const aEnd = getStateAfter(aStart);
			const bStart = getStateAfter(aEnd);
			const bEnd = getStateAfter(bStart);
			setState(aStart, {
				[exp.left.format()]: new Set([aEnd]),
			});
			setState(bStart, {
				[exp.right.format()]: new Set([bEnd]),
			});
			setState(start, {
				[Graph.Epsilon]: new Set([aStart, bStart]),
			});
			setState(aEnd, {
				[Graph.Epsilon]: new Set([end]),
			});
			setState(bEnd, {
				[Graph.Epsilon]: new Set([end]),
			});
			callStep();
			addToStates(aStart, exp.left, aEnd);
			addToStates(bStart, exp.right, bEnd);
		}
		else if (exp instanceof Sequence) {
			const aEnd = getStateAfter(start);
			const bStart = getStateAfter(aEnd);
			setState(start, {
				[exp.left.format()]: new Set([aEnd]),
			});
			setState(aEnd, {
				[Graph.Epsilon]: new Set([bStart]),
			});
			setState(bStart, {
				[exp.right.format()]: new Set([end]),
			});
			callStep();
			addToStates(start, exp.left, aEnd);
			addToStates(bStart, exp.right, end);
		}
		else if (exp instanceof Star) {
			const innerStart = getStateAfter(start);
			const innerEnd = getStateAfter(innerStart);
			setState(start, {
				[Graph.Epsilon]: new Set([innerStart, end]),
			});
			setState(innerStart, {
				[exp.exp.format()]: new Set([innerEnd]),
			});
			setState(innerEnd, {
				[Graph.Epsilon]: new Set([innerStart, end]),
			});
			callStep();
			addToStates(innerStart, exp.exp, innerEnd);
		}
		else if (exp instanceof Empty) {
			setState(start, {});
			callStep();
		}
		else if (exp instanceof Nil) {
			setState(start, {
				[Graph.Epsilon]: new Set([end]),
			});
		}
		else if (exp instanceof Symbol) {
			setState(start, {
				[exp.symbol]: new Set([end]),
			});
		}
		else if (exp instanceof Reference) {
			setState(start, {
				[exp.name]: new Set([end]),
			});
		}
	};

	setState(starting, {
		[regularExpression.format()]: new Set([accepting]),
	});
	callStep();
	addToStates(starting, regularExpression, accepting);
	stateMap.push([accepting, {}]);

	return generateAutomata();
}