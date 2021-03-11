import { Automata } from "./Automata";
import { StepCallback } from "./Steps";

export interface StateEquivalenceTable {
	[stateName: string]: { [stateName: string]: boolean };
}

export function stateEquivalenceTable(a: Automata): StateEquivalenceTable;
export function stateEquivalenceTable(a: Automata, step: StepCallback<StateEquivalenceTable>): StateEquivalenceTable;
export function stateEquivalenceTable(a: Automata, b: Automata): StateEquivalenceTable;
export function stateEquivalenceTable(a: Automata, b: Automata, step: StepCallback<StateEquivalenceTable>): StateEquivalenceTable;
export function stateEquivalenceTable(a: Automata, b?: Automata | StepCallback<StateEquivalenceTable>, c?: StepCallback<StateEquivalenceTable>): StateEquivalenceTable {
	const table: StateEquivalenceTable = {};
	const cloneTable = (): StateEquivalenceTable => {
		const clone: StateEquivalenceTable = {};
		for (const fromName in table) {
			clone[fromName] = {};
			for (const toName in table[fromName]) {
				clone[fromName][toName] = table[fromName][toName];
			}
		}
		return clone;
	};

	const step = b instanceof Function ? b : c;
	const isOneAutomata = b == null || b instanceof Function;
	const bStates = isOneAutomata ? a.states : (b as Automata).states;
	const bAccepting = isOneAutomata ? a.accepting : (b as Automata).accepting;

	for (const aState in a.states) {
		table[aState] = {};
		for (const bState in bStates) {
			table[aState][bState] = true;
		}
	}

	step?.(cloneTable(), "Begin with all states as indistinguishable.");

	for (const aState in a.states) {
		table[aState] = {};
		for (const bState in bStates) {
			table[aState][bState] = a.accepting.has(aState) === bAccepting.has(bState);
		}
	}

	step?.(cloneTable(), "All pairs of states where not both are either accepting or unaccepting, are distinguishable.");

	let changeHappened: boolean;
	do {
		changeHappened = false;

		for (const aState in table) {
			for (const bState in table[aState]) {
				if (table[aState][bState]) {
					symbolLoop: for (const symbol of a.alphabet) {
						for (const aTarget of a.states[aState][symbol]) {
							for (const bTarget of bStates[bState][symbol]) {
								if (!table[aTarget][bTarget] && table[aState][bState]) {
									table[aState][bState] = false;
									if (isOneAutomata) {
										table[bState][aState] = false;
									}
									step?.(
										cloneTable(),
										`${aState} and ${bState} are distinguishable because their "${symbol}"-transitions reach two distinguishable states, ${aTarget} and ${bTarget} respectively.`
									);
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