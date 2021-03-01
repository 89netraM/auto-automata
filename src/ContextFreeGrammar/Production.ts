export type Production = ReadonlyArray<ReadonlyArray<Token>>;

export enum TokenKind {
	NonTerminal,
	Terminal,
	Empty
}
export class Token {
	public static readonly emptyString: string = "ε";

	public static nonTerminal(identifier: string): Token {
		return new Token(TokenKind.NonTerminal, identifier);
	}
	public static terminal(identifier: string): Token {
		return new Token(TokenKind.Terminal, identifier);
	}
	public static empty(): Token {
		return new Token(TokenKind.Empty, Token.emptyString);
	}

	private constructor(
		public readonly kind: TokenKind,
		public readonly identifier: string,
	) { }

	public equals(other: Token): boolean {
		return this.kind === other.kind &&
			this.identifier === other.identifier;
	}
}