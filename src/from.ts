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

export function fromRegularExpression(regularExpression: RegularExpression, alphabet: Set<string>): Automata {
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

	const setState = (name: StateNameGenerator, value: typeof stateMap[number][1]): void => {
		const entry = stateMap.find(([n, _]) => n.number === name.number);
		if (entry == null) {
			stateMap.push([name, value]);
		}
		else {
			entry[1] = value;
		}
	};

	const addToStates = (start: StateNameGenerator, exp: RegularExpression): StateNameGenerator => {
		if (exp instanceof Alternative) {
			const aStart = getStateAfter(start);
			const bStart = getStateAfter(aStart);
			const aEnd = addToStates(aStart, exp.left);
			const bEnd = addToStates(bStart, exp.right);
			setState(start, {
				[Graph.Epsilon]: new Set([aStart, bStart]),
			});
			const end = getStateAfter(bEnd);
			setState(aEnd, {
				[Graph.Epsilon]: new Set([end]),
			});
			setState(bEnd, {
				[Graph.Epsilon]: new Set([end]),
			});
			return end;
		}
		else if (exp instanceof Sequence) {
			const aEnd = addToStates(start, exp.left);
			const bStart = getStateAfter(aEnd);
			setState(aEnd, {
				[Graph.Epsilon]: new Set([bStart]),
			});
			return addToStates(bStart, exp.right);
		}
		else if (exp instanceof Star) {
			const innerStart = getStateAfter(start);
			const end = getStateAfter(innerStart);
			const innerEnd = addToStates(innerStart, exp.exp);
			setState(start, {
				[Graph.Epsilon]: new Set([innerStart, end]),
			});
			setState(innerEnd, {
				[Graph.Epsilon]: new Set([innerStart, end]),
			});
			return end;
		}
		else if (exp instanceof Empty) {
			const end = getStateAfter(start);
			setState(start, {});
			return end;
		}
		else if (exp instanceof Nil) {
			const end = getStateAfter(start);
			setState(start, {
				[Graph.Epsilon]: new Set([end]),
			});
			return end;
		}
		else if (exp instanceof Symbol) {
			const end = getStateAfter(start);
			setState(start, {
				[exp.symbol]: new Set([end]),
			});
			return end;
		}
		else if (exp instanceof Reference) {
			const end = getStateAfter(start);
			setState(start, {
				[exp.name]: new Set([end]),
			});
			return end;
		}
	};

	const starting = new StateNameGenerator(0);
	const accepting = addToStates(starting, regularExpression);
	stateMap.push([accepting, {}]);

	return {
		alphabet,
		accepting: new Set<string>([accepting.toString()]),
		starting: starting.toString(),
		states: generateStates(),
	};
}