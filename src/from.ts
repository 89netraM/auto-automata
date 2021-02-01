import { Alternative, Reference, RegularExpression, Sequence, Star, Symbol } from "./RegularExpressions";
import { Automata } from "./Automata";
import { Graph } from "./Graph";
import { Nil } from "./RegularExpressions/Nil";
import { Empty } from "./RegularExpressions/Empty";

export function fromRegularExpression(regularExpression: RegularExpression, alphabet: Set<string>): Automata {
	let nextStateId = 0;
	const getNextState = (): string => {
		const bigString = (nextStateId++).toString();
		let outString = "s";
		for (let i = 0; i < bigString.length; i++) {
			outString += String.fromCodePoint(bigString.codePointAt(i) + 0x2050);
		}
		return outString;
	};

	const states: Graph = { };
	const addToStates = (start: string, exp: RegularExpression): string => {
		if (exp instanceof Alternative) {
			const aStart = getNextState();
			const aEnd = addToStates(aStart, exp.left);
			const bStart = getNextState();
			const bEnd = addToStates(bStart, exp.right);
			states[start] = {
				[Graph.Epsilon]: new Set([ aStart, bStart ]),
			};
			const end = getNextState();
			states[aEnd] = {
				[Graph.Epsilon]: new Set([ end ]),
			};
			states[bEnd] = {
				[Graph.Epsilon]: new Set([ end ]),
			};
			return end;
		}
		else if (exp instanceof Sequence) {
			const aEnd = addToStates(start, exp.left);
			const bStart = getNextState();
			states[aEnd] = {
				[Graph.Epsilon]: new Set([ bStart ]),
			};
			return addToStates(bStart, exp.right);
		}
		else if (exp instanceof Star) {
			const innerStart = getNextState();
			const innerEnd = addToStates(innerStart, exp.exp);
			const end = getNextState();
			states[start] = {
				[Graph.Epsilon]: new Set([ innerStart, end ]),
			};
			states[innerEnd] = {
				[Graph.Epsilon]: new Set([ innerStart, end ]),
			};
			return end;
		}
		else if (exp instanceof Empty) {
			const end = getNextState();
			states[start] = { };
			return end;
		}
		else if (exp instanceof Nil) {
			const end = getNextState();
			states[start] = {
				[Graph.Epsilon]: new Set([ end ]),
			};
			return end;
		}
		else if (exp instanceof Symbol) {
			const end = getNextState();
			states[start] = {
				[exp.symbol]: new Set([ end ]),
			};
			return end;
		}
		else if (exp instanceof Reference) {
			const end = getNextState();
			states[start] = {
				[exp.name]: new Set([ end ]),
			};
			return end;
		}
	};

	const starting = getNextState();
	const accepting = addToStates(starting, regularExpression);
	states[accepting] = { };

	return {
		alphabet,
		accepting: new Set<string>([accepting]),
		starting,
		states,
	};
}