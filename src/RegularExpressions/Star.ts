import { RegularExpression } from "./RegularExpression";

export class Star extends RegularExpression {
	public static readonly Character: string = "*";

	public constructor(
		public readonly exp: RegularExpression,
	) {
		super();
	}

	public format(): string {
		const exp = this.exp.precedence() < this.precedence() ? "(" + this.exp.format() + ")" : this.exp.format();
		return exp + Star.Character;
	}

	public simplify(): RegularExpression {
		return new Star(
			this.exp.simplify(),
		);
	}

	public replace(name: string, exp: RegularExpression): RegularExpression {
		return new Star(
			this.exp.replace(name, exp),
		);
	}

	public equals(other: RegularExpression): boolean {
		return other instanceof Star &&
			// e* = e*
			this.exp.equals(other.exp);
	}
}