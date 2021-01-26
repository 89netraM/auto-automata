import { validate } from "./validate";

const Epsilon = "ε";

/**
 * Can be used to represent DFA, NFA, or ε-NFA. Built as a transition diagram.
 * Use {@link Graph.Epsilon} to represent the ε column.
 */
export interface Graph {
	start: string;
	accepting: Set<string>;
	states: {
		[stateName: string]: {
			[symbol: string]: Set<string>;
			[Epsilon]?: Set<string>;
		};
	};
}

export const Graph = {
	/**
	 * Use to represent a non-consuming state transition.
	 */
	Epsilon,

	validate,
};