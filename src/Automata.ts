import { Graph } from "./Graph";
import { automataRun } from "./runner";
import { automataValidate } from "./validate";
import { test } from "./test";
import { parseTable } from "./parser";
import { formatTable, formatLaTeX } from "./formatter";
import { constructSubset, constructProduct } from "./construction";
import { fromRegularExpression } from "./from";
import { isEmpty } from "./emptiness";

/**
 * Represents an automata.
 */
export interface Automata {
	/**
	 * The starting state.
	 */
	starting: string;
	/**
	 * The accepting states.
	 */
	accepting: Set<string>;
	/**
	 * The graph of states and their transitions.
	 */
	states: Graph;
	/**
	 * The alphabet.
	 */
	alphabet: Set<string>;
}

export const Automata = {
	validate: automataValidate,
	run: automataRun,
	test,
	parseTable,
	formatTable,
	formatLaTeX,
	constructSubset,
	constructProduct,
	fromRegularExpression,
	isEmpty,
};