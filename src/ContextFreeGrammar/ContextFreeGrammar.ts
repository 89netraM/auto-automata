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
					(this.terminals.has(t.identifier) || t.identifier === ContextFreeGrammar.emptyString)
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