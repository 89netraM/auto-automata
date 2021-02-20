import { Automata } from "./Automata";
import { equivalenceClasses } from "./equals";
import { Graph } from "./Graph";

export function removeUnreachableStates(a: Automata): Automata {
	const visited = new Set<string>();
	const toVisit = new Array<string>(a.starting);

	while (toVisit.length > 0) {
		const current = toVisit.shift();
		visited.add(current);
		for (const symbol of a.alphabet) {
			for (const target of a.states[current][symbol]) {
				if (!visited.has(target)) {
					toVisit.push(target);
				}
			}
		}
	}

	const cleanedAccepting = new Set<string>();
	for (const accepting of a.accepting) {
		if (visited.has(accepting)) {
			cleanedAccepting.add(accepting);
		}
	}

	const cleanedStates: Graph = {};
	for (const state of visited) {
		cleanedStates[state] = {};
		for (const symbol of a.alphabet) {
			cleanedStates[state][symbol] = new Set<string>(a.states[state][symbol]);
		}
	}

	return {
		starting: a.starting,
		accepting: cleanedAccepting,
		states: cleanedStates,
		alphabet: new Set<string>(a.alphabet),
	};
}

export function minimise(a: Automata): Automata {
	const makeName = (c: Set<string>) => [...c].join("");

	a = removeUnreachableStates(a);
	const classes = equivalenceClasses(a);

	const states: Graph = {};
	for (const clazz of classes) {
		const [state] = clazz;
		const className = makeName(clazz);
		states[className] = {};
		for (const symbol of a.alphabet) {
			for (const target of a.states[state][symbol]) {
				states[className][symbol] = new Set<string>([makeName(classes.find(c => c.has(target)))]);
			}
		}
	}

	return {
		starting: makeName(classes.find(c => c.has(a.starting))),
		accepting: new Set<string>(classes.filter(c => [...c].some(s => a.accepting.has(s))).map(makeName)),
		states,
		alphabet: new Set<string>(a.alphabet),
	}
}