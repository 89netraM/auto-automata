import { Automata } from "./Automata";

export function test(a: Readonly<Automata>, string: string): boolean {
	const finalStates = Automata.run(a, string);
	return [...finalStates].some(s => a.accepting.has(s));
}