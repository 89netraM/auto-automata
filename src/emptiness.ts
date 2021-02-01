import { Automata } from "./Automata";

export function isEmpty(a: Readonly<Automata>): boolean {
	const visited = new Set<string>();
	const canReachAccepting = (state: string): boolean => {
		if (!visited.has(state)) {
			visited.add(state);
			return a.accepting.has(state) ||
				Object.values(a.states[state])
					.reduce((l, s) => [...l, ...s], new Array<string>())
					.some(s => canReachAccepting(s));
		}
		else {
			return false;
		}
	};
	return !canReachAccepting(a.starting);
}