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
			[...this.terminals].join(", ") +
			"\\}, P, " +
			this.start +
			") \\\\[0.5em]\n\\begin{aligned}\n\tP: " +
			[...this.productions].map(([nt, p]) => `${nt} &→ ${p.map(alt => alt.map(t => t.identifier).join("")).join(" \\mid ")}`).join(" \\\\\n\t") +
			"\n\\end{aligned}";
	}
}