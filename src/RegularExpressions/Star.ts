import { RegularExpression } from "./RegularExpression";

export class Star extends RegularExpression {
	public constructor(
		public readonly exp: RegularExpression,
	) {
		super();
	}

	public format(): string {
		const exp = this.exp.precedence() < this.precedence() ? "(" + this.exp.format() + ")" : this.exp.format();
		return exp + "*";
	}

	public simplify(): RegularExpression {
		return new Star(
			this.exp.simplify(),
		);
	}

	public equals(other: RegularExpression): boolean {
		return other instanceof Star &&
			// e* = e*
			this.exp.equals(other.exp);
	}
}