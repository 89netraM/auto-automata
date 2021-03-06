import { descriptionNaturalList, StepCallback } from "../Steps";
import { countUpLetterSymbol, sortBySymbolButFirst } from "../symbolHelpers";
import { CYKTable } from "./CYKTable";
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
			this.productions = productions != null ?
				new Map<string, Production>([...productions].map(([nt, p]) => [nt, p.map(s => [...s])])) :
				new Map<string, Production>();
		}
		else {
			throw new Error("Error in productions.");
		}

		if (start == null || this.nonTerminals.has(start)) {
			this.start = start;
		}
		else {
			throw new Error(`Start ("${start}) is not a non-terminal.`);
		}
	}

	//#region Computations
	public parse(string: string): ParseTree | null {
		if (this.start == null) {
			return null;
		}
		if (string.length > 0) {
			const cyk = this.cyk(string);
			if (cyk == null || !cyk.has(string) || !cyk.get(string).has(this.start)) {
				return null;
			}
		}
		else {
			if (!this.nullableNonTerminals().some(t => t === this.start)) {
				return null;
			}
		}

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

		alternatives: for (const sequence of [...this.productions.get(nonTerminal.identifier)].sort((a, b) => b.length - a.length)) {
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

		for (const nonTerminal of nts) {
			if (!this.nonTerminals.has(nonTerminal)) {
				throw new Error("Not all elements in `nullableNonTerminals` are members of this CFGs non-terminals.");
			}
		}

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

	public cyk(string: string): CYKTable;
	public cyk(string: string, step: StepCallback<[number, CYKTable]>): CYKTable;
	public cyk(string: string, step?: StepCallback<[number, CYKTable]>): CYKTable {
		const cfg = this.cnf();
		const table = new CYKTable(string);
		const callStep = (height: number, desc: string) => step?.([height, new CYKTable(table)], desc);

		const getSequencesFor = (part: string): Array<Array<string>> => {
			const sequences = new Array<Array<string>>();
			for (let s = 1; s < part.length; s++) {
				const start = table.get(part.substring(0, s));
				const end = table.get(part.substring(s));
				if (start != null && end != null) {
					start.forEach(s => end.forEach(e => sequences.push(new Array<string>(s, e))));
				}
			}
			return sequences;
		};

		for (const i of string) {
			if (!table.has(i)) {
				const producers = new Set<string>(
					[...cfg.productions]
						.filter(([_, p]) => p.some(s => s.length === 1 && s[0].kind === TokenKind.Terminal && s[0].identifier === i))
						.map(([nt, _]) => nt)
				);
				table.set(i, producers);
				if (producers.size > 0) {
					callStep(1, `Add non-terminals that directly can produce the string "${i}".`);
				}
				else {
					callStep(1, `No non-terminals can directly produce the string "${i}".`);
				}
			}
		}

		for (let l = 2; l <= string.length; l++) {
			for (let i = 0; i <= string.length - l; i++) {
				const part = string.substr(i, l);
				if (!table.has(part)) {
					const seqs = getSequencesFor(part);
					const producers = new Set<string>(
						[...cfg.productions]
							.filter(([_, p]) =>
								p.some(s =>
									seqs.some(seq =>
										seq.every((t, i) =>
											i < s.length &&
											s[i].kind === TokenKind.NonTerminal &&
											s[i].identifier === t
										)
									)
								)
							)
							.map(([nt, _]) => nt)
					);
					table.set(part, producers);
					if (producers.size > 0) {
						callStep(l, `Add productions that can produce the string "${part}".`);
					}
					else {
						callStep(l, `No productions can produce the string "${part}".`);
					}
				}
			}
		}

		return table;
	}
	//#endregion Computations

	//#region Transformations
	public bin(): ContextFreeGrammar;
	public bin(step: StepCallback<ContextFreeGrammar>): ContextFreeGrammar;
	public bin(step?: StepCallback<ContextFreeGrammar>): ContextFreeGrammar {
		const productions = new Map<string, Array<Array<Token>>>([...this.productions].map(([nt, p]) => [nt, p.map(s => [...s])]));
		const isAvailable = (s: string) => !productions.has(s);

		for (const [nt, p] of [...productions].sort(([a, _a], [b, _b]) => sortBySymbolButFirst(a, b, this.start))) {
			let changeHappened = false;
			const production = new Array<Array<Token>>();
			let symbol = nt;
			const newSymbols = new Array<string>();
			for (const sequence of p) {
				if (sequence.length >= 3) {
					symbol = countUpLetterSymbol(symbol, isAvailable);
					newSymbols.push(symbol);
					production.push(new Array<Token>(sequence[0], Token.nonTerminal(symbol)));
					for (let i = 1; i < sequence.length - 2; i++) {
						const prev = symbol;
						symbol = countUpLetterSymbol(symbol, isAvailable);
						newSymbols.push(symbol);
						productions.set(
							prev,
							new Array<Array<Token>>(
								new Array<Token>(sequence[i], Token.nonTerminal(symbol))
							)
						);
					}
					productions.set(
						symbol,
						new Array<Array<Token>>(
							new Array<Token>(sequence[sequence.length - 2], sequence[sequence.length - 1])
						)
					);
					changeHappened = true;
				}
				else {
					production.push(new Array<Token>(...sequence));
				}
			}
			productions.set(nt, production);
			if (changeHappened) {
				step?.(
					new ContextFreeGrammar(
						productions.keys(),
						this.terminals,
						productions,
						this.start,
					),
					`Alternatives in production ${nt} is split up into smaller productions. ` +
						`New non-terminals are ${descriptionNaturalList(newSymbols)}.`
				);
			}
		}

		return new ContextFreeGrammar(
			productions.keys(),
			this.terminals,
			productions,
			this.start,
		);
	}

	public del(): ContextFreeGrammar;
	public del(step: StepCallback<ContextFreeGrammar>): ContextFreeGrammar;
	public del(step?: StepCallback<ContextFreeGrammar>): ContextFreeGrammar {
		const productions = new Map<string, Array<Array<Token>>>([...this.productions].map(([nt, p]) => [nt, p.map(s => [...s])]));

		const nullableNonTerminals = new Set<string>(this.nullableNonTerminals());
		const nullNonTerminals = new Set<string>(this.nullNonTerminals(nullableNonTerminals));

		for (const [nt, p] of [...productions].sort(([a, _a], [b, _b]) => sortBySymbolButFirst(a, b, this.start))) {
			let changeHappened = false;
			let changeDescription: string = null;
			if (!nullNonTerminals.has(nt)) {
				const factoredOut = new Array<string>();
				const removed = new Array<string>();
				let removedEmpty = false;
				let production = new Array<Array<Token>>();
				for (const s of p) {
					const sequences = new Array<Array<Token>>(new Array<Token>());
					for (const token of s) {
						if (token.kind === TokenKind.Empty) {
							removedEmpty = true;
							changeHappened = true;
							continue;
						}
						else if (token.kind === TokenKind.NonTerminal && nullNonTerminals.has(token.identifier)) {
							removed.push(token.identifier);
							changeHappened = true;
							continue;
						}
						else if (token.kind === TokenKind.NonTerminal && nullableNonTerminals.has(token.identifier)) {
							const lengthBefore = sequences.length;
							for (let i = 0; i < lengthBefore; i++) {
								sequences.push([...sequences[i]]);
								sequences[i].push(token);
							}
							factoredOut.push(token.identifier);
							changeHappened = true;
						}
						else {
							for (const sequence of sequences) {
								sequence.push(token);
							}
						}
					}
					production.push(...sequences.filter(s => s.length > 0));
				}
				production = production.filter(a => a.length > 0);
				if (production.length > 0) {
					productions.set(nt, production);
					if (changeHappened) {
						const changes = new Array<string>();
						if (removed.length > 0) {
							changes.push(`null producing non-terminal${removed.length > 1 ? "s" : ""} ${descriptionNaturalList(removed)} were removed`);
						}
						if (factoredOut.length > 0) {
							changes.push(`nullable non-terminal${factoredOut.length > 1 ? "s" : ""} ${descriptionNaturalList(factoredOut)} were factored out`);
						}
						if (removedEmpty) {
							changes.push("empty string tokens were removed");
						}
						changeDescription = `From the production of ${nt}, ${descriptionNaturalList(changes)}.`;
					}
				}
				else {
					productions.delete(nt);
					changeHappened = true;
					changeDescription = `The non-terminal ${nt} only produced the empty string, and where thus removed.`;
				}
			}
			else {
				productions.delete(nt);
				changeHappened = true;
				changeDescription = `The non-terminal ${nt} only produced the empty string, and where thus removed.`;
			}
			if (changeHappened) {
				step?.(
					new ContextFreeGrammar(
						productions.keys(),
						this.terminals,
						productions,
						this.start,
					),
					changeDescription
				);
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
	public unit(step: StepCallback<ContextFreeGrammar>): ContextFreeGrammar;
	public unit(step?: StepCallback<ContextFreeGrammar>): ContextFreeGrammar {
		let productions = new Map<string, Array<Array<Token>>>([...this.productions].map(([nt, p]) => [nt, p.map(s => [...s])]));

		const isCircular = (target: string, production: Production, seen: ReadonlySet<string> = new Set<string>()): boolean => {
			for (const sequence of production) {
				if (sequence.length === 1 && sequence[0].kind === TokenKind.NonTerminal) {
					if (sequence[0].identifier === target || seen.has(sequence[0].identifier)) {
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

			for (const [nonTerminal, production] of [...productions].sort(([a, _a], [b, _b]) => sortBySymbolButFirst(a, b, this.start))) {
				for (let i = 0; i < production.length; i++) {
					const sequence = production[i];
					if (sequence.length === 1 &&
						sequence[0].kind === TokenKind.NonTerminal
					) {
						if (nonTerminal === sequence[0].identifier) {
							productions.get(nonTerminal).splice(i, 1);
							i += -1;
							changeHappened = true;
							step?.(
								new ContextFreeGrammar(
									productions.keys(),
									this.terminals,
									productions,
									this.start,
								),
								`Removed the "self-reference" in ${nonTerminal}.`
							);
						}
						else if (!isCircular(sequence[0].identifier, productions.get(sequence[0].identifier))) {
							const newAlternatives = productions.get(sequence[0].identifier).map(s => [...s]);
							productions.get(nonTerminal).splice(i, 1, ...newAlternatives);
							i += newAlternatives.length - 1;
							changeHappened = true;
							step?.(
								new ContextFreeGrammar(
									productions.keys(),
									this.terminals,
									productions,
									this.start,
								),
								`"Inlined" the production for ${sequence[0].identifier} in ${nonTerminal}.`
							);
						}
					}
				}
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
	public term(step: StepCallback<ContextFreeGrammar>): ContextFreeGrammar;
	public term(step?: StepCallback<ContextFreeGrammar>): ContextFreeGrammar {
		const productions = new Map<string, Array<Array<Token>>>([...this.productions].map(([nt, p]) => [nt, p.map(s => [...s])]));

		const terminalProductions = new Map<string, string>([...productions]
			.filter(([_, p]) => p.length === 1 && p[0].length === 1 && p[0][0].kind === TokenKind.Terminal)
			.map(([nt, p]) => [p[0][0].identifier, nt]));

		for (const [nonTerminal, production] of [...productions].sort(([a, _a], [b, _b]) => sortBySymbolButFirst(a, b, this.start))) {
			for (const sequence of production) {
				if (sequence.length >= 2) {
					for (let i = 0; i < sequence.length; i++) {
						if (sequence[i].kind === TokenKind.Terminal) {
							const terminal = sequence[i].identifier;
							let isNew = false;
							let replacement = terminalProductions.get(terminal);
							if (replacement == null) {
								replacement = countUpLetterSymbol(nonTerminal, s => !productions.has(s));
								terminalProductions.set(terminal, replacement);
								productions.set(replacement, new Array<Array<Token>>(new Array<Token>(Token.terminal(terminal))));
								isNew = true;
							}
							sequence.splice(i, 1, Token.nonTerminal(replacement));
							step?.(
								new ContextFreeGrammar(
									productions.keys(),
									this.terminals,
									productions,
									this.start,
								),
								`Replaced a terminal "${terminal}" in production ${nonTerminal} with the ${isNew ? "new " : ""}non-terminal ${replacement}.`
							);
						}
					}
				}
			}
		}

		return new ContextFreeGrammar(
			productions.keys(),
			this.terminals,
			productions,
			this.start,
		);
	}

	public cnf(): ContextFreeGrammar;
	public cnf(step: StepCallback<ContextFreeGrammar>): ContextFreeGrammar;
	public cnf(step?: StepCallback<ContextFreeGrammar>): ContextFreeGrammar {
		return this.bin(step).del(step).unit(step).term(step);
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

	//#region "File formats"
	private static readonly utf8Matcher = /(.)→(.*)/s;
	private static readonly utf8Production = /(.)→(.*)/g;
	public static parseUTF8(utf8: string): ContextFreeGrammar | null {
		utf8 = utf8.trim();
		if (ContextFreeGrammar.utf8Matcher.test(utf8)) {
			const productions = new Map<string, Array<Array<Token>>>();
			const terminals = new Set<string>();
			let start: string = null;

			let match: RegExpExecArray;
			while ((match = ContextFreeGrammar.utf8Production.exec(utf8)) != null) {
				const [_, nt, alts] = match;
				productions.set(
					nt,
					alts.split("|").map(seq =>
							seq.length === 0 ?
								new Array<Token>(Token.empty()) :
								[...seq].map(c =>
									c === Token.emptyString ?
										Token.empty() :
										ContextFreeGrammar.jflapNonTerminalMatcher.test(c) ?
											Token.nonTerminal(c) :
											(terminals.add(c), Token.terminal(c))))
				);
				if (start == null) {
					start = nt;
				}
			}

			return new ContextFreeGrammar(
				productions.keys(),
				terminals,
				productions,
				start,
			);
		}
		else {
			return null;
		}
	}

	private static readonly jflapMatcher = /<structure>(.*)<type>grammar<\/type>(.*)<\/structure>/s;
	private static readonly jflapProduction = /<production>.*?<left>(.)<\/left>.*?(?:<right>(.*?)<\/right>|<right.*?\/>).*?<\/production>/sg;
	public static parseJFLAP(jff: string): ContextFreeGrammar | null {
		jff = jff.trim();
		const structureMatch = ContextFreeGrammar.jflapMatcher.exec(jff);
		if (structureMatch != null && structureMatch.length >= 3) {
			jff = structureMatch[1] + structureMatch[2];
			const productions = new Map<string, Array<Array<Token>>>();
			const terminals = new Set<string>();
			let start: string = null;

			let match: RegExpExecArray;
			while ((match = ContextFreeGrammar.jflapProduction.exec(jff)) != null) {
				const [_, nt, seq] = match;
				if (ContextFreeGrammar.jflapNonTerminalMatcher.test(nt)) {
					const tokenSeq = seq == null || seq.length === 0 ?
						new Array<Token>(Token.empty()) :
						[...seq].map(c =>
							ContextFreeGrammar.jflapNonTerminalMatcher.test(c) ?
								Token.nonTerminal(c) :
								(terminals.add(c), Token.terminal(c)));
					if (productions.has(nt)) {
						productions.get(nt).push(tokenSeq);
					}
					else {
						productions.set(nt, new Array<Array<Token>>(tokenSeq));
					}

					if (start == null) {
						start = nt;
					}
				}
				else {
					return null;
				}
			}

			return new ContextFreeGrammar(
				productions.keys(),
				terminals,
				productions,
				start,
			);
		}
		else {
			return null;
		}
	}

	public formatUTF8(): string | null {
		if ([...this.nonTerminals].every(nt => ContextFreeGrammar.jflapNonTerminalMatcher.test(nt)) &&
			[...this.terminals].every(t => t.length === 1 && !ContextFreeGrammar.jflapNonTerminalMatcher.test(t) && t !== Token.emptyString)
		) {
			return [...this.productions]
				.sort(([a, _a], [b, _b]) => sortBySymbolButFirst(a, b, this.start))
				.map(([nt, p]) => `${nt}→${
					p.map(alt =>
						alt.map(t => t.identifier).join("")
					).join("|")}`
				)
				.join("\n");
		}
		else {
			return null;
		}
	}

	public formatLaTeX(): string {
		return "(\\{" +
			[...this.nonTerminals].join(", ") +
			"\\}, \\{" +
			[...this.terminals].map(t => `\\text{${t}}`).join(", ") +
			"\\}, P, " +
			(this.start ?? "") +
			") \\\\[0.5em]\nP \\begin{cases}\\begin{aligned}\n\t" +
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
			"\n\\end{aligned}\\end{cases}";
	}

	private static readonly jflapNonTerminalMatcher = /^[A-Z]$/;
	public formatJFLAP(): string | null {
		if ([...this.nonTerminals].every(nt => ContextFreeGrammar.jflapNonTerminalMatcher.test(nt)) &&
			[...this.terminals].every(t => t.length === 1 && !ContextFreeGrammar.jflapNonTerminalMatcher.test(t)) &&
			[...this.productions].every(([_, alts]) => alts.every(seq => seq.every(t => t.kind !== TokenKind.Empty) || seq.length <= 1))
		) {
			return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n<structure>\n\t<type>grammar</type>\n` +
				[...this.productions]
					.sort(([a, _a], [b, _b]) => sortBySymbolButFirst(a, b, this.start))
					.flatMap(([nt, alts]) => alts.map(seq =>
						"\t<production>\n" +
						`\t\t<left>${nt}</left>\n` +
						(
							seq.length === 0 || (seq.length === 1 && seq[0].kind === TokenKind.Empty) ?
								"\t\t<right/>\n" :
								`\t\t<right>${seq.map(t => t.identifier).join("")}</right>\n`
						) +
						"\t</production>\n"
					))
					.join("") +
				"</structure>";
		}
		else {
			return null;
		}
	}
	//#endregion "File formats"
}