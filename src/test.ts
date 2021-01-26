import { Automata } from "./Automata";

export function test(a: Automata, string: string): boolean {
	const finalStates = Automata.run(a, string);
	return [...finalStates].some(s => a.accepting.has(s));
}