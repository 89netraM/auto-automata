import { Graph } from "./Graph";
import { automataRun } from "./runner";
import { automataValidate } from "./validate";

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
};