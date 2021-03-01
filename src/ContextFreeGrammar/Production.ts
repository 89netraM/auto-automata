export type Production = ReadonlyArray<ReadonlyArray<Token>>;

export enum TokenKind {
	NonTerminal,
	Terminal,
}
export interface Token {
	readonly kind: TokenKind;
	readonly identifier: string;
}
export const Token = {
	nonTerminal: (identifier: string): Token => ({
		kind: TokenKind.NonTerminal,
		identifier,
	}),
	terminal: (identifier: string): Token => ({
		kind: TokenKind.Terminal,
		identifier,
	}),
};