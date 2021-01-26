import { graphValidate } from "./validate";
import { step, run } from "./runner";

const Epsilon = "ε";

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

	validate: graphValidate,
	step,
	run,
};