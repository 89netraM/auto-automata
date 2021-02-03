import { Graph } from "./Graph";

export function isDFA(states: Graph): boolean {
	for (const stateName in states) {
		for (const l in states[stateName]) {
			if (l === Graph.Epsilon || states[stateName][l].size !== 1) {
				return false;
			}
		}
	}
	return true;
}

export function isNFA(states: Graph): boolean {
	for (const stateName in states) {
		for (const l in states[stateName]) {
			if (l === Graph.Epsilon) {
				return false;
			}
		}
	}
	return true;
}

export function isεNFA(states: Graph): boolean {
	return true;
}