import { Automata, Graph } from "../";
import { Alternative } from "./Alternative";
import { Nil } from "./Nil";
import { Reference } from "./Reference";
import { RegularExpression } from "./RegularExpression";
import { Sequence } from "./Sequence";
import { Symbol } from "./Symbol";

// Steps for the algorithm from http://www.cse.chalmers.se/edu/year/2020/course/TMV028_Automata/lectures/L8.pdf#page=36

export function fromAutomata(a: Automata): Map<string, RegularExpression> {
	const equations = new Map<string, RegularExpression>();
	for (const stateName in a.states) {
		const state = a.states[stateName];
		const transitions = new Map<string, Set<string>>();

		for (const symbol of [Graph.Epsilon, ...a.alphabet]) {
			if (symbol in state) {
				for (const toState of state[symbol]) {
					const set = transitions.has(toState) ? transitions.get(toState) : new Set<string>();
					set.add(symbol);
					transitions.set(toState, set);
				}
			}
		}

		let equation: RegularExpression = null;
		if (a.accepting.has(stateName)) {
			equation = Nil.Instance;
		}
		for (const [toState, viaSymbols] of transitions.entries()) {
			let alts: RegularExpression = null;
			for (const symbol of viaSymbols) {
				if (alts == null) {
					alts = new Symbol(symbol);
				}
				else {
					alts = new Alternative(alts, new Symbol(symbol));
				}
			}
			const seq = new Sequence(alts, new Reference(toState));
			if (equation == null) {
				equation = seq;
			}
			else {
				equation = new Alternative(equation, seq);
			}
		}

		equations.set(stateName, equation);
	}

	return equations;
}

const a: Automata = {
	starting: "s₄",
	accepting: new Set(["s₁", "s₄"]),
	alphabet: new Set(["a", "b", "c"]),
	states: {
		"s₁": {
			"a": new Set(["s₂", "s₃", "s₄"]),
			"b": new Set(["s₂"]),
			"c": new Set(["s₁"]),
		},
		"s₂": {
			"b": new Set(["s₃"]),
		},
		"s₃": {
			"a": new Set(["s₄"]),
			"c": new Set(["s₃"]),
			[Graph.Epsilon]: new Set(["s₄"]),
		},
		"s₄": {
			"a": new Set(["s₁"]),
			"b": new Set(["s₄"]),
		},
	},
};

console.log(
	[...fromAutomata(a).entries()].map(([name, exp]) => `${name}: ${exp.format()}`).join("\n")
);