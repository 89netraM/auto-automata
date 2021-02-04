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

	private static idRecord: number = 0;
	private static generateId(): number {
		return StateNameGenerator.idRecord++;
	}

	public readonly id: number;

	public constructor(
		public number: number,
	) {
		this.id = StateNameGenerator.generateId();
	}

	public toString(): string {
		return StateNameGenerator.generateName(this.number);
	}
}

export function fromRegularExpression(regularExpression: RegularExpression, alphabet: Set<string>): Automata;
export function fromRegularExpression(regularExpression: RegularExpression, alphabet: Set<string>, step: (a: Automata) => void): Automata;
export function fromRegularExpression(regularExpression: RegularExpression, alphabet: Set<string>, step?: (a: Automata) => void): Automata {
	const stateMap = new Array<[StateNameGenerator, { [pathName: string]: Map<number, StateNameGenerator> }]>();

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
	const ending = getStateAfter(starting);
	const accepting = new Map<number, StateNameGenerator>([[ending.id, ending]]);

	const generateStates = (): Graph => {
		const states: Graph = {};
		for (const [nameGen, transitionMap] of stateMap) {
			const name = nameGen.toString();
			if (name in states) {
				for (const path in transitionMap) {
					const set = path in states[name] ? states[name][path] : new Set<string>();
					for (const [, targetGen] of transitionMap[path]) {
						set.add(targetGen.toString());
					}
					states[name][path] = set;
				}
			}
			else {
				const transitions = {};
				for (const path in transitionMap) {
					transitions[path] = new Set<string>([...transitionMap[path]].map(([_, g]) => g.toString()));
				}
				states[name.toString()] = transitions;
			}
		}
		return states;
	};

	const addToState = (name: StateNameGenerator, value: { [path: string]: Array<StateNameGenerator> }): void => {
		const entry = stateMap.find(([n, _]) => n.number === name.number);
		if (entry == null) {
			const transitions = {};
			for (const path in value) {
				const map = new Map<number, StateNameGenerator>();
				for (const targetState of value[path]) {
					map.set(targetState.id, targetState);
				}
				transitions[path] = map;
			}
			stateMap.push([name, transitions]);
		}
		else {
			for (const path in value) {
				if (path in entry[1]) {
					for (const targetState of value[path]) {
						entry[1][path].set(targetState.id, targetState);
					}
				}
				else {
					const map = new Map<number, StateNameGenerator>();
					for (const targetState of value[path]) {
						map.set(targetState.id, targetState);
					}
					entry[1][path] = map;
				}
			}
		}
	};
	const removeFromState = (name: StateNameGenerator, value: { [path: string]: Array<StateNameGenerator> }): void => {
		const entry = stateMap.find(([n, _]) => n.number === name.number);
		if (entry != null) {
			for (const path in value) {
				if (path in entry[1]) {
					if (value[path] == null) {
						delete entry[1][path];
					}
					else {
						for (const targetState of value[path]) {
							entry[1][path].delete(targetState.id);
						}
						if (entry[1][path].size === 0) {
							delete entry[1][path];
						}
					}
				}
			}
		}
	};

	const callStep = () => {
		if (step != null) {
			const states = generateStates();
			const alphabet = new Set<string>();
			for (const state of Object.values(states)) {
				for (const transitionName in state) {
					if (transitionName !== Graph.Epsilon) {
						alphabet.add(transitionName);
					}
				}
			}
			if (!(ending.toString() in states)) {
				states[ending.toString()] = {};
			}
			step({
				alphabet,
				accepting: new Set<string>([...accepting].map(([_, v]) => v.toString())),
				starting: starting.toString(),
				states,
			});
		}
	};

	const extendState = (from: StateNameGenerator, to: StateNameGenerator): void => {
		if (to != null) {
			const transitionsMap = stateMap.find(([k, _]) => k.id === from.id)[1];
			const transitions = {};
			for (const path in transitionsMap) {
				transitions[path] = [...transitionsMap[path].values()];
			}
			addToState(to, transitions);
		}
	};

	const addToStates = (start: StateNameGenerator, exp: RegularExpression, end: StateNameGenerator): Array<StateNameGenerator> => {
		if (exp instanceof Alternative) {
			const exps = exp.flat();
			for (const e of exps) {
				addToState(start, {
					[e.format()]: [end],
				});
			}
			callStep();
			const toExtend = new Array<StateNameGenerator>();
			for (const e of exps) {
				removeFromState(start, {
					[e.format()]: [end],
				});
				toExtend.push(
					...addToStates(start, e, end)
				);
			}
			return toExtend;
		}
		else if (exp instanceof Sequence) {
			const exps = exp.flat().filter(e => !e.equals(Nil.Instance));
			if (exps.length === 0) {
				end.number = start.number;
				callStep();
			}
			else if (exps.length === 1) {
				const [a] = exps;
				addToState(start, {
					[a.format()]: [end],
				});
				callStep();
				removeFromState(start, {
					[a.format()]: [end],
				});
				return addToStates(start, a, end);
			}
			else {
				const transitions = new Array<StateNameGenerator>(start);
				for (let i = 0; i < exps.length - 1; i++) {
					transitions.push(getStateAfter(transitions[i]));
				}
				transitions.push(end);

				for (let i = 0; i < exps.length; i++) {
					addToState(transitions[i], {
						[exps[i].format()]: [transitions[i + 1]],
					});
				}
				callStep();
				const toExtend = new Array<StateNameGenerator>();
				let lastExtend = new Array<StateNameGenerator>();
				for (let i = 0; i < exps.length; i++) {
					removeFromState(transitions[i], {
						[exps[i].format()]: [transitions[i + 1]],
					});
					const newExtend = addToStates(transitions[i], exps[i], transitions[i + 1]);
					for (const te of toExtend) {
						extendState(transitions[i], te);
					}
					lastExtend = newExtend;
					toExtend.push(...newExtend);
				}
				callStep();
				return lastExtend;
			}
		}
		else if (exp instanceof Star) {
			addToState(start, {
				[exp.exp.format()]: [end],
			});
			addToState(end, {
				[exp.exp.format()]: [end],
			});
			callStep();
			removeFromState(start, {
				[exp.exp.format()]: [end],
			});
			addToStates(start, exp.exp, end);
			removeFromState(end, {
				[exp.exp.format()]: [end],
			});
			addToStates(end, exp.exp, end);
			return new Array<StateNameGenerator>(start);
		}
		else if (exp instanceof Empty) {
			addToState(start, {});
		}
		else if (exp instanceof Nil) {
			callStep();
			return new Array<StateNameGenerator>(start);
		}
		else if (exp instanceof Symbol) {
			addToState(start, {
				[exp.symbol]: [end],
			});
		}
		else if (exp instanceof Reference) {
			addToState(start, {
				[exp.name]: [end],
			});
		}
		return new Array<StateNameGenerator>();
	};

	addToState(starting, {
		[regularExpression.format()]: [ending],
	});
	callStep();
	removeFromState(starting, {
		[regularExpression.format()]: null,
	});
	const additionalAcceptable = addToStates(starting, regularExpression, ending);
	for (const aa of additionalAcceptable) {
		accepting.set(aa.id, aa);
	}
	addToState(ending, {});

	return {
		alphabet,
		accepting: new Set<string>([...accepting].map(([_, v]) => v.toString())),
		starting: starting.toString(),
		states: generateStates(),
	};
}