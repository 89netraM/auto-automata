import { Automata, Graph } from "../../../src";

function hasAllRight(a: Graph, b: Graph): boolean {
	for (const state in a) {
		if (!(state in b)) {
			return false;
		}

		for (const symbol in a[state]) {
			if (!(symbol in b[state]) && a[state][symbol].size > 0) {
				return false;
			}
			if (![...a[state][symbol]].every(t => b[state][symbol].has(t))) {
				return false;
			}
		}
	}

	return true;
}

export function compareAutomatas(a: Automata, b: Automata): boolean {
	if (a.starting !== b.starting) {
		return false;
	}

	if (a.accepting.size !== b.accepting.size) {
		return false;
	}
	if (![...a.accepting].every(s => b.accepting.has(s))) {
		return false;
	}

	if (!hasAllRight(a.states, b.states)) {
		return false;
	}
	if (!hasAllRight(b.states, a.states)) {
		return false;
	}

	if (a.alphabet.size !== b.alphabet.size) {
		return false;
	}
	if (![...a.alphabet].every(s => b.alphabet.has(s))) {
		return false;
	}

	return true;
}