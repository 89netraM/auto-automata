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
	const states: Graph = { };

	const stateNames = new Array<StateNameGenerator>();
	const getStateAfter = (previous: StateNameGenerator): StateNameGenerator => {
		const next = new StateNameGenerator(previous.number + 1);
		for (const generator of stateNames) {
			if (generator.number > previous.number) {
				generator.number++;
				const currentName = generator.toString();
				const nextName = StateNameGenerator.generateName(generator.number + 1);
				for (const state of Object.values(states).filter(s => s != null)) {
					for (const set of Object.values(state).filter(s => s != null)) {
						if (set.has(currentName)) {
							set.delete(currentName);
							set.add(nextName);
						}
					}
				}
				states[nextName] = states[currentName];
				delete states[currentName];
			}
		}
		stateNames.push(next);
		return next;
	};

	const addToStates = (start: StateNameGenerator, exp: RegularExpression): StateNameGenerator => {
		if (exp instanceof Alternative) {
			const aStart = getStateAfter(start);
			const bStart = getStateAfter(aStart);
			const aEnd = addToStates(aStart, exp.left);
			const bEnd = addToStates(bStart, exp.right);
			states[start.toString()] = {
				[Graph.Epsilon]: new Set([ aStart.toString(), bStart.toString() ]),
			};
			const end = getStateAfter(bEnd);
			states[aEnd.toString()] = {
				[Graph.Epsilon]: new Set([ end.toString() ]),
			};
			states[bEnd.toString()] = {
				[Graph.Epsilon]: new Set([ end.toString() ]),
			};
			return end;
		}
		else if (exp instanceof Sequence) {
			const aEnd = addToStates(start, exp.left);
			const bStart = getStateAfter(aEnd);
			states[aEnd.toString()] = {
				[Graph.Epsilon]: new Set([ bStart.toString() ]),
			};
			return addToStates(bStart, exp.right);
		}
		else if (exp instanceof Star) {
			const innerStart = getStateAfter(start);
			const end = getStateAfter(innerStart);
			const innerEnd = addToStates(innerStart, exp.exp);
			states[start.toString()] = {
				[Graph.Epsilon]: new Set([ innerStart.toString(), end.toString() ]),
			};
			states[innerEnd.toString()] = {
				[Graph.Epsilon]: new Set([ innerStart.toString(), end.toString() ]),
			};
			return end;
		}
		else if (exp instanceof Empty) {
			const end = getStateAfter(start);
			states[start.toString()] = { };
			return end;
		}
		else if (exp instanceof Nil) {
			const end = getStateAfter(start);
			states[start.toString()] = {
				[Graph.Epsilon]: new Set([ end.toString() ]),
			};
			return end;
		}
		else if (exp instanceof Symbol) {
			const end = getStateAfter(start);
			states[start.toString()] = {
				[exp.symbol]: new Set([ end.toString() ]),
			};
			return end;
		}
		else if (exp instanceof Reference) {
			const end = getStateAfter(start);
			states[start.toString()] = {
				[exp.name]: new Set([ end.toString() ]),
			};
			return end;
		}
	};

	const starting = new StateNameGenerator(0);
	const accepting = addToStates(starting, regularExpression);
	states[accepting.toString()] = { };

	return {
		alphabet,
		accepting: new Set<string>([ accepting.toString() ]),
		starting: starting.toString(),
		states,
	};
}