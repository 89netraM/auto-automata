import { countUpSymbol, sortBySymbolButFirst } from "../symbolHelpers";
import { ParseTree } from "./ParseTree";
import { Production, Token, TokenKind } from "./Production";

export class ContextFreeGrammar {
	public static readonly emptyString: string = "ε";

	public readonly nonTerminals: ReadonlySet<string>;
	public readonly terminals: ReadonlySet<string>;
	public readonly productions: ReadonlyMap<string, Production>;
	public readonly start: string;

	public constructor();
	public constructor(nonTerminals: Iterable<string>, terminals: Iterable<string>, productions: Iterable<readonly [string, Production]>, start: string);
	public constructor(nonTerminals?: Iterable<string>, terminals?: Iterable<string>, productions?: Iterable<readonly [string, Production]>, start?: string) {
		this.nonTerminals = nonTerminals != null ? new Set<string>(nonTerminals) : new Set<string>();
		this.terminals = terminals != null ? new Set<string>(terminals) : new Set<string>();

		const checkProduction = (p: Production): boolean => {
			return p.every(alt => alt.every(t =>
				(t.kind === TokenKind.NonTerminal && this.nonTerminals.has(t.identifier)) ||
					(t.kind === TokenKind.Terminal && this.terminals.has(t.identifier)) ||
					t.kind === TokenKind.Empty
			));
		};
		if (productions == null || [...productions].every(([nt, p]) => this.nonTerminals.has(nt) && checkProduction(p))) {
			this.productions = productions != null ? new Map<string, Production>(productions) : new Map<string, Production>();
		}
		else {
			throw new Error("Error in productions.");
		}

		if (start == null || this.nonTerminals.has(start)) {
			this.start = start ?? "";
		}
		else {
			throw new Error(`Start ("${start}) is not a non-terminal.`);
		}
	}

	public parse(string: string): ParseTree | null {
		const queue = new Array<[Array<Token>, Array<Token>, string]>([new Array<Token>(), [Token.nonTerminal(this.start)], string]);
		while (queue.length > 0) {
			const [tree, [token, ...rest], string] = queue.shift();
			if (token.kind === TokenKind.NonTerminal) {
				for (const sequence of this.productions.get(token.identifier)) {
					queue.push([
						[...tree, token],
						[...sequence, ...rest],
						string
					]);
				}
			}
			else if (token.kind === TokenKind.Terminal) {
				if (string.startsWith(token.identifier)) {
					if (string.length === token.identifier.length && rest.length === 0) {
						return this.constructTree([...tree, token]);
					}
					else if (rest.length > 0) {
						queue.push([
							[...tree, token],
							rest,
							string.substring(token.identifier.length)
						]);
					}
				}
			}
			else if (token.kind === TokenKind.Empty) {
				if (string.length === 0 && rest.length === 0) {
					return this.constructTree([...tree, token]);
				}
				else if (rest.length > 0) {
					queue.push([
						[...tree, token],
						rest,
						string
					]);
				}
			}
		}
		return null;
	}
	private constructTree(tokens: ReadonlyArray<Token>): ParseTree;
	private constructTree(tokens: ReadonlyArray<Token>, start: number): [number, ParseTree];
	private constructTree(tokens: ReadonlyArray<Token>, start?: number): ParseTree | [number, ParseTree]{
		const nonTerminal = tokens[start ?? 0];
		const base = (start ?? 0) + 1

		alternatives: for (const sequence of this.productions.get(nonTerminal.identifier)) {
			const children = new Array<ParseTree | string>();
			let skips = 0;
			for (let i = 0; i < sequence.length && base + skips + i < tokens.length; i++) {
				const token = tokens[base + skips + i];
				if (token.equals(sequence[i])) {
					if (token.kind === TokenKind.NonTerminal) {
						const [skip, subTree] = this.constructTree(tokens, base + skips + i);
						children.push(subTree);
						skips += skip;
					}
					else {
						children.push(token.identifier);
					}
				}
				else {
					continue alternatives;
				}
			}
			if (start == null) {
				return new ParseTree(nonTerminal.identifier, children);
			}
			else {
				return [skips + sequence.length, new ParseTree(nonTerminal.identifier, children)];
			}
		}

		throw new Error("Failed to construct the parse tree.");
	}

	//#region Computations
	public generatingSymbols(): Array<Token>;
	public generatingSymbols(step: (symbols: Array<Token>) => void): Array<Token>;
	public generatingSymbols(step?: (symbols: Array<Token>) => void): Array<Token> {
		const gamma = [...this.terminals].map(i => Token.terminal(i));

		let changeHappened: boolean;
		do {
			changeHappened = false;
			step?.([...gamma]);

			const change = new Array<Token>();
			for (const [nt, production] of this.productions) {
				if (gamma.every(t => t.kind !== TokenKind.NonTerminal || t.identifier !== nt)) {
					alternatives: for (const sequence of production) {
						if (sequence.every(token => token.kind === TokenKind.Empty || gamma.some(t => t.equals(token)))) {
							change.push(Token.nonTerminal(nt));
							changeHappened = true;
							break alternatives;
						}
					}
				}
			}
			gamma.push(...change);
		} while (changeHappened);

		return gamma;
	}

	public nullableNonTerminals(): Array<string>;
	public nullableNonTerminals(step: (symbols: Array<string>) => void): Array<string>;
	public nullableNonTerminals(step?: (symbols: Array<string>) => void): Array<string> {
		const E = new Array<string>();

		let changeHappened: boolean;
		do {
			changeHappened = false;
			step?.([...E]);

			const change = new Array<string>();
			for (const [nonTerminal, production] of this.productions) {
				if (E.every(nt => nt !== nonTerminal)) {
					alternatives: for (const sequence of production) {
						if (sequence.every(token => token.kind === TokenKind.Empty || E.some(nt => token.identifier === nt))) {
							change.push(nonTerminal);
							changeHappened = true;
							break alternatives;
						}
					}
				}
			}
			E.push(...change);
		} while (changeHappened);

		return E;
	}

	public nullNonTerminals(): Array<string>;
	public nullNonTerminals(step: (symbols: Array<string>) => void): Array<string>;
	public nullNonTerminals(nullableNonTerminals: Iterable<string>): Array<string>;
	public nullNonTerminals(nullableNonTerminals: Iterable<string>, step: (symbols: Array<string>) => void): Array<string>;
	public nullNonTerminals(a?: Iterable<string> | ((symbols: Array<string>) => void), b?: (symbols: Array<string>) => void): Array<string> {
		const nts = a instanceof Function || a == null ? this.nonTerminals : a;
		const step = a instanceof Function ? a : b;

		const nullNT = new Array<string>();

		let changeHappened: boolean;
		do {
			changeHappened = false;
			step?.([...nullNT]);

			const change = new Array<string>();
			for (const nonTerminal of nts) {
				if (nullNT.every(nt => nt !== nonTerminal) && this.productions.get(nonTerminal)
					.every(a => a.every(t => t.kind === TokenKind.Empty ||
						(t.kind === TokenKind.NonTerminal && nullNT.some(nt => t.identifier === nt)))
					)
				) {
					change.push(nonTerminal);
					changeHappened = true;
				}
			}
			nullNT.push(...change);
		} while (changeHappened);

		return nullNT;
	}
	//#endregion Computations

	//#region Transformations
	public bin(): ContextFreeGrammar;
	public bin(step: (cfg: ContextFreeGrammar) => void): ContextFreeGrammar;
	public bin(step?: (cfg: ContextFreeGrammar) => void): ContextFreeGrammar {
		const productions = new Map<string, Production>();
		const isAvailable = (s: string) => !this.productions.has(s) && !productions.has(s);

		for (const [nt, p] of [...this.productions].sort(([a, _a], [b, _b]) => sortBySymbolButFirst(a, b, this.start))) {
			const production = new Array<ReadonlyArray<Token>>();
			let symbol = nt;
			for (const sequence of p) {
				if (sequence.length >= 3) {
					symbol = countUpSymbol(symbol, isAvailable);
					production.push(new Array<Token>(sequence[0], Token.nonTerminal(symbol)));
					for (let i = 1; i < sequence.length - 2; i++) {
						const prev = symbol;
						symbol = countUpSymbol(symbol, isAvailable);
						productions.set(
							prev,
							new Array<ReadonlyArray<Token>>(
								new Array<Token>(sequence[i], Token.nonTerminal(symbol))
							)
						);
					}
					productions.set(
						symbol,
						new Array<ReadonlyArray<Token>>(
							new Array<Token>(sequence[sequence.length - 2], sequence[sequence.length - 1])
						)
					);
				}
				else {
					production.push(sequence);
				}
			}
			productions.set(nt, production);
			step?.(new ContextFreeGrammar(
				new Set<string>([
					...productions.keys(),
					...[...productions.values()].flatMap(p =>
						p.flatMap(s =>
							s.filter(t => t.kind === TokenKind.NonTerminal)
							.map(t => t.identifier)
						)
					)
				]),
				this.terminals,
				productions,
				this.start,
			));
		}

		return new ContextFreeGrammar(
			productions.keys(),
			this.terminals,
			productions,
			this.start,
		);
	}

	public del(): ContextFreeGrammar;
	public del(step: (cfg: ContextFreeGrammar) => void): ContextFreeGrammar;
	public del(step?: (cfg: ContextFreeGrammar) => void): ContextFreeGrammar {
		const productions = new Map<string, Production>();

		const nullableNonTerminals = new Set<string>(this.nullableNonTerminals());
		const nullNonTerminals = new Set<string>(this.nullNonTerminals(nullableNonTerminals));

		for (const [nt, p] of [...this.productions].sort(([a, _a], [b, _b]) => sortBySymbolButFirst(a, b, this.start))) {
			if (!nullNonTerminals.has(nt)) {
				const production = new Array<ReadonlyArray<Token>>();
				for (const s of p) {
					const sequences = new Array<Array<Token>>(new Array<Token>());
					for (const token of s) {
						if (token.kind === TokenKind.Empty ||
							(token.kind === TokenKind.NonTerminal && nullNonTerminals.has(token.identifier))) {
							continue;
						}
						else if (token.kind === TokenKind.NonTerminal && nullableNonTerminals.has(token.identifier)) {
							const lengthBefore = sequences.length;
							for (let i = 0; i < lengthBefore; i++) {
								sequences.push([...sequences[i]]);
								sequences[i].push(token);
							}
						}
						else {
							for (const sequence of sequences) {
								sequence.push(token);
							}
						}
					}
					production.push(...sequences.filter(s => s.length > 0));
				}
				productions.set(nt, production);
				step?.(new ContextFreeGrammar(
					new Set<string>([
						...productions.keys(),
						...[...productions.values()].flatMap(p =>
							p.flatMap(s =>
								s.filter(t => t.kind === TokenKind.NonTerminal)
								.map(t => t.identifier)
							)
						)
					]),
					this.terminals,
					productions,
					this.start,
				));
			}
		}

		return new ContextFreeGrammar(
			productions.keys(),
			this.terminals,
			productions,
			this.start,
		);
	}

	public unit(): ContextFreeGrammar;
	public unit(step: (cfg: ContextFreeGrammar) => void): ContextFreeGrammar;
	public unit(step?: (cfg: ContextFreeGrammar) => void): ContextFreeGrammar {
		const productions = new Map<string, Array<Array<Token>>>([...this.productions].map(([nt, p]) => [nt, p.map(s => [...s])]));

		const isCircular = (target: string, production: Production, seen: ReadonlySet<string>): boolean => {
			for (const sequence of production) {
				if (sequence.length === 1 && sequence[0].kind === TokenKind.NonTerminal) {
					if (sequence[0].identifier === target) {
						return true;
					}
					else {
						if (isCircular(
							target,
							productions.get(sequence[0].identifier),
							new Set<string>([...seen, sequence[0].identifier])
						)) {
							return true;
						}
					}
				}
			}
			return false;
		};

		let changeHappened: boolean;
		do {
			changeHappened = false;

			const changes = new Array<[string, Array<[number, Array<Array<Token>>]>]>();
			for (const [nonTerminal, production] of productions) {
				const productionChanges = new Array<[number, Array<Array<Token>>]>();
				for (let i = 0; i < production.length; i++) {
					const sequence = production[i];
					if (sequence.length === 1 &&
						sequence[0].kind === TokenKind.NonTerminal
					) {
						if (nonTerminal === sequence[0].identifier) {
							productionChanges.push([i, new Array<Array<Token>>()]);
							changeHappened = true;
						}
						else if (!isCircular(sequence[0].identifier, productions.get(sequence[0].identifier), new Set<string>())) {
							productionChanges.push([i, productions.get(sequence[0].identifier).map(s => [...s])]);
							changeHappened = true;
						}
					}
				}
				changes.push([nonTerminal, productionChanges]);
			}
			for (const [nonTerminal, productionChanges] of changes) {
				const production = productions.get(nonTerminal);
				let offset = 0;
				for (const [i, alts] of productionChanges) {
					production.splice(offset + i, 1, ...alts);
					offset += alts.length - 1;
				}
			}

			if (changeHappened) {
				step?.(new ContextFreeGrammar(
					this.nonTerminals,
					this.terminals,
					productions,
					this.start,
				));
			}
		} while (changeHappened);

		return new ContextFreeGrammar(
			this.nonTerminals,
			this.terminals,
			productions,
			this.start,
		);
	}

	public term(): ContextFreeGrammar;
	public term(step: (cfg: ContextFreeGrammar) => void): ContextFreeGrammar;
	public term(step?: (cfg: ContextFreeGrammar) => void): ContextFreeGrammar {
		const productions = new Map<string, Array<Array<Token>>>([...this.productions].map(([nt, p]) => [nt, p.map(s => [...s])]));

		const terminalProductions = new Map<string, string>([...productions]
			.filter(([_, p]) => p.length === 1 && p[0].length === 1 && p[0][0].kind === TokenKind.Terminal)
			.map(([nt, p]) => [p[0][0].identifier, nt])
		);

		for (const [_, production] of [...productions].sort(([a, _a], [b, _b]) => sortBySymbolButFirst(a, b, this.start))) {
			let changeHappened = false;
			for (const sequence of production) {
				if (sequence.length >= 2) {
					for (let i = 0; i < sequence.length; i++) {
						if (sequence[i].kind === TokenKind.Terminal) {
							let replacement = terminalProductions.get(sequence[i].identifier);
							if (replacement == null) {
								replacement = countUpSymbol("T", s => !productions.has(s));
								terminalProductions.set(sequence[i].identifier, replacement);
								productions.set(replacement, new Array<Array<Token>>(new Array<Token>(Token.terminal(sequence[i].identifier))));
							}
							sequence.splice(i, 1, Token.nonTerminal(replacement));
							changeHappened = true;
						}
					}
				}
			}
			if (changeHappened) {
				step?.(new ContextFreeGrammar(
					productions.keys(),
					this.terminals,
					productions,
					this.start,
				));
			}
		}

		return new ContextFreeGrammar(
			productions.keys(),
			this.terminals,
			productions,
			this.start,
		);
	}
	//#endregion Transformations

	//#region Immutable updates
	public addNonTerminal(nonTerminal: string): ContextFreeGrammar {
		return new ContextFreeGrammar(
			[...this.nonTerminals, nonTerminal],
			this.terminals,
			this.productions,
			this.start,
		);
	}
	public removeNonTerminal(nonTerminal: string): ContextFreeGrammar {
		return new ContextFreeGrammar(
			[...this.nonTerminals].filter(nt => nt !== nonTerminal),
			this.terminals,
			this.productions,
			this.start,
		);
	}
	public setNonTerminals(nonTerminals: Iterable<string> | null): ContextFreeGrammar {
		return new ContextFreeGrammar(
			nonTerminals,
			this.terminals,
			this.productions,
			this.start,
		);
	}

	public addTerminal(terminal: string): ContextFreeGrammar {
		return new ContextFreeGrammar(
			this.nonTerminals,
			[...this.terminals, terminal],
			this.productions,
			this.start,
		);
	}
	public removeTerminal(terminal: string): ContextFreeGrammar {
		return new ContextFreeGrammar(
			this.nonTerminals,
			[...this.terminals].filter(nt => nt !== terminal),
			this.productions,
			this.start,
		);
	}
	public setTerminals(terminals: Iterable<string> | null): ContextFreeGrammar {
		return new ContextFreeGrammar(
			this.nonTerminals,
			terminals,
			this.productions,
			this.start,
		);
	}

	public addProduction(nonTerminal: string, productionAlternative: ReadonlyArray<Token>): ContextFreeGrammar {
		let productions: Iterable<readonly [string, Production]>;
		if (this.productions.has(nonTerminal)) {
			productions = [...this.productions].map(([nt, p]) => [nt, nt === nonTerminal ? [...p, productionAlternative] : p]);
		}
		else {
			productions = [...this.productions, [nonTerminal, [productionAlternative]]];
		}
		return new ContextFreeGrammar(
			this.nonTerminals,
			this.terminals,
			productions,
			this.start,
		)
	}
	public clearProduction(nonTerminal: string): ContextFreeGrammar {
		let productions: Iterable<readonly [string, Production]>;
		if (this.productions.has(nonTerminal)) {
			productions = [...this.productions].filter(([nt, _]) => nt !== nonTerminal);
		}
		else {
			productions = this.productions;
		}
		return new ContextFreeGrammar(
			this.nonTerminals,
			this.terminals,
			productions,
			this.start,
		)
	}
	public setProductions(productions: Iterable<readonly [string, Production]> | null): ContextFreeGrammar {
		return new ContextFreeGrammar(
			this.nonTerminals,
			this.terminals,
			productions,
			this.start,
		)
	}

	public setStart(start: string | null): ContextFreeGrammar {
		return new ContextFreeGrammar(
			this.nonTerminals,
			this.terminals,
			this.productions,
			start,
		);
	}
	//#endregion Immutable updates

	public formatLaTeX(): string {
		return "(\\{" +
			[...this.nonTerminals].join(", ") +
			"\\}, \\{" +
			[...this.terminals].map(t => `\\text{${t}}`).join(", ") +
			"\\}, P, " +
			this.start +
			") \\\\[0.5em]\n\\begin{aligned}\n\tP: " +
			[...this.productions]
				.sort(([a, _a], [b, _b]) => sortBySymbolButFirst(a, b, this.start))
				.map(([nt, p]) => `${nt} &→ ${
					p.map(alt =>
						alt.map(t => t.kind === TokenKind.Terminal ?
							`\\text{${t.identifier}}` :
							t.identifier
						).join("")
					).join(" \\mid ")}`
				)
				.join(" \\\\\n\t") +
			"\n\\end{aligned}";
	}
}