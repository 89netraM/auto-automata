import { graphValidate } from "./validate";
import { step, graphRun, epsilonClosure } from "./runner";
import { isDFA, isNFA, isεNFA } from "./type";

const Epsilon = "ε";
const Empty = "∅";

/**
 * A transition diagram for a DFA, NFA, or ε-NFA.
 * Use {@link Graph.Epsilon} to represent the ε column.
 */
export interface Graph {
	[stateName: string]: {
		[symbol: string]: Set<string>;
		[Epsilon]?: Set<string>;
	};
}

export const Graph = {
	/**
	 * Use to represent a non-consuming state transition.
	 */
	Epsilon,
	/**
	 * Used to represent the "empty" (∅) state.
	 */
	Empty,

	validate: graphValidate,
	step: step,
	run: graphRun,
	epsilonClosure: epsilonClosure,
	isDFA: isDFA,
	isNFA: isNFA,
	isεNFA: isεNFA,
};
Object.defineProperty(Graph, "step", { enumerable: true, get: () => step });
Object.defineProperty(Graph, "run", { enumerable: true, get: () => graphRun });
Object.defineProperty(Graph, "epsilonClosure", { enumerable: true, get: () => epsilonClosure });
Object.defineProperty(Graph, "isDFA", { enumerable: true, get: () => isDFA });
Object.defineProperty(Graph, "isNFA", { enumerable: true, get: () => isNFA });
Object.defineProperty(Graph, "isεNFA", { enumerable: true, get: () => isεNFA });