import { Token } from "./Production";

export class ParseTree {
	public constructor(
		public readonly nonTerminal: string,
		public readonly children: ReadonlyArray<ParseTree | string>,
	) { }

	public addChild(child: ParseTree | string): ParseTree {
		return new ParseTree(this.nonTerminal, [...this.children, child]);
	}

	public yield(): string {
		return this.children
			.map(child => child instanceof ParseTree ? child.yield() : child === Token.emptyString ? "" : child)
			.join("");
	}
}