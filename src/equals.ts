import { Automata } from "./Automata";

export interface StateEquivalenceTable {
	[stateName: string]: { [stateName: string]: boolean };
}

export function stateEquivalenceTable(a: Automata): StateEquivalenceTable;
export function stateEquivalenceTable(a: Automata, b: Automata): StateEquivalenceTable;
export function stateEquivalenceTable(a: Automata, b?: Automata): StateEquivalenceTable {
	const table: StateEquivalenceTable = {};

	if (b == null) {
		for (const fromState in a.states) {
			table[fromState] = {};
			for (const toState in a.states) {
				table[fromState][toState] = fromState === toState ||
					a.accepting.has(fromState) === a.accepting.has(toState);
			}
		}
	}
	else {
		for (const aState in a.states) {
			table[aState] = {};
			for (const bState in b.states) {
				table[aState][bState] = a.accepting.has(aState) === b.accepting.has(bState);
			}
		}
	}

	const bStates = b?.states ?? a.states;
	let changeHappened: boolean;
	do {
		changeHappened = false;

		for (const aState in table) {
			for (const bState in table[aState]) {
				if (table[aState][bState]) {
					symbolLoop: for (const symbol of a.alphabet) {
						for (const aTarget of a.states[aState][symbol]) {
							for (const bTarget of bStates[bState][symbol]) {
								if (!table[aTarget][bTarget]) {
									table[aState][bState] = false;
									changeHappened = true;
									break symbolLoop;
								}
							}
						}
					}
				}
			}
		}
	} while (changeHappened);

	return table;
}

export function equivalenceClasses(a: Automata): Array<Set<string>> {
	const table = stateEquivalenceTable(a);
	const classMap: { [state: string]: boolean } = {};
	const classes = new Array<Set<string>>();

	for (const state in table) {
		if (!(state in classMap)) {
			const clazz = new Set<string>();
			for (const other in table[state]) {
				if (table[state][other]) {
					classMap[other] = true;
					clazz.add(other);
				}
			}
			classes.push(clazz);
		}
	}

	return classes;
}

export function equals(a: Automata, b: Automata): boolean {
	return stateEquivalenceTable(a, b)[a.starting][b.starting];
}