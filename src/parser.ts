import { Automata } from "./Automata";
import { Graph } from "./Graph";

const comment = "#";

export function parseTable(text: string): Automata | null {
	const [alphabetLine, ...stateTransitions] = text
		.trim()
		.split(/\r?\n/)
		.map(l => l.substring(0, (l.indexOf(comment) + 1 || l.length + 1) - 1).trim())
		.filter(l => l.length > 0);
	const alphabetList = alphabetLine.split(/\s+/);
	let starting: string;
	const accepting = new Set<string>();
	const states: Graph = {};

	for (const line of stateTransitions) {
		const [, arrow, star, stateName, transitions] = line.match(/^(→|->)?\s?(\*)?\s?(.+?)\s(.*)/);

		if (starting == null && arrow != null) {
			starting = stateName;
		}
		if (star != null) {
			accepting.add(stateName);
		}

		states[stateName] = {};
		let character = 0;
		for (let i = 0; i < transitions.length; i++) {
			const readStateName = (): string => {
				let targetState = "";
				for (; i < transitions.length && !/\s|\{|\}|,/.test(transitions[i]); i++) {
					targetState += transitions[i];
				}
				return targetState.length > 0 ? targetState : null;
			};

			if (/\s/.test(transitions[i])) {
				continue;
			}
			else if (transitions[i] === "{") {
				const targetStates = new Set<string>();
				while (i + 1 < transitions.length && transitions[i] !== "}") {
					i++;
					const targetState = readStateName();
					if (targetState != null) {
						targetStates.add(targetState);
					}
				}
				states[stateName][alphabetList[character++]] = targetStates;
			}
			else {
				const targetState = readStateName();
				if (targetState === Graph.Empty) {
					states[stateName][alphabetList[character++]] = new Set<string>();
				}
				else if (targetState != null) {
					states[stateName][alphabetList[character++]] = new Set<string>([ targetState ]);
				}
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