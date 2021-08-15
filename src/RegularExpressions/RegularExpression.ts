export abstract class RegularExpression {
	protected static readonly EmptyName: string = "Empty";
	protected static readonly NilName: string = "Nil";
	protected static readonly ReferenceName: string = "Reference";
	protected static readonly SymbolName: string = "Symbol";
	protected static readonly StarName: string = "Star";
	protected static readonly SequenceName: string = "Sequence";
	protected static readonly AlternativeName: string = "Alternative";

	/**
	 * Lower index is higher precedence.
	 */
	private static readonly Precedence: ReadonlyArray<string> = [
		RegularExpression.EmptyName,
		RegularExpression.NilName,
		RegularExpression.ReferenceName,
		RegularExpression.SymbolName,
		RegularExpression.StarName,
		RegularExpression.SequenceName,
		RegularExpression.AlternativeName,
	];

	public abstract format(): string;
	public abstract run(string: string): Array<string>;
	public abstract equals(other: RegularExpression): boolean;
	public abstract isEmpty(): boolean;
	protected abstract name(): string;

	public test(string: string): boolean {
		return this.run(string).some(r => r.length === 0);
	}

	public simplify(): RegularExpression {
		return this;
	}

	public replace(id: string, exp: RegularExpression): RegularExpression {
		return this;
	}

	public traverse(visitor: (e: RegularExpression) => void): void { }

	public precedence(): number {
		return RegularExpression.Precedence.length - RegularExpression.Precedence.indexOf(this.name());
	}
}