import { Automata } from "./Automata";
import { Graph } from "./Graph";

export function parseTable(text: string): Automata | null {
	const [alphabetList, ...stateTransitions] = text.trim().split("\n").map(l => l.trim().split("\t"));
	let starting: string;
	const accepting = new Set<string>();
	const states: Graph = {};

	for (const [state, ...transitions] of stateTransitions) {
		const stateName = state.match(/[^\s]*$/)[0];

		if (starting == null && /^\*?→/.test(state)) {
			starting = stateName;
		}
		if (/^→?\*/.test(state)) {
			accepting.add(stateName);
		}

		states[stateName] = {};
		for (let i = 0; i < transitions.length; i++) {
			const transition = transitions[i];
			if (transition.startsWith("{") && transition.endsWith("}")) {
				states[stateName][alphabetList[i]] = new Set(transition.substring(1, transition.length - 1).split(",").map(s => s.trim()));
			}
		}
	}

	const alphabet = new Set(alphabetList);
	alphabet.delete(Graph.Epsilon);
	return {
		starting,
		accepting,
		states,
		alphabet,
	};
}