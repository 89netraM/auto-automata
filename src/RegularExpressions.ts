export abstract class RegularExpression {
	public abstract format(): string;
	public abstract equals(other: RegularExpression): boolean;

	public simplify(): RegularExpression {
		return this;
	}

	public precedence(): number {
		return precedence.length - precedence.indexOf((this as any)["constructor"]);
	}
}

class Empty extends RegularExpression {
	public static Instance: Empty = new Empty();

	private constructor() {
		super();
	}

	public format(): string {
		return "∅";
	}

	public equals(other: RegularExpression): boolean {
		// ∅ = ∅
		return other instanceof Empty;
	}
}
const emptyInstance = Empty.Instance;
export { emptyInstance as Empty };

class Nil extends RegularExpression {
	public static Instance: Nil = new Nil();

	private constructor() {
		super();
	}

	public format(): string {
		return "ε";
	}

	public equals(other: RegularExpression): boolean {
		// ε = ε
		return other instanceof Nil;
	}
}
const nilInstance = Nil.Instance;
export { nilInstance as Nil };

export class Symbol extends RegularExpression {
	public constructor(
		public readonly symbol: string,
	) {
		super();
	}

	public format(): string {
		return this.symbol;
	}

	public equals(other: RegularExpression): boolean {
		return other instanceof Symbol &&
			// s = s
			this.symbol === other.symbol;
	}
}

export class Sequence extends RegularExpression {
	public constructor(
		public readonly left: RegularExpression,
		public readonly right: RegularExpression,
	) {
		super();
	}

	public format(): string {
		const left = this.left.precedence() < this.precedence() ? "(" + this.left.format() + ")" : this.left.format();
		const right = this.right.precedence() <= this.precedence() ? "(" + this.right.format() + ")" : this.right.format();
		return left + right;
	}

	public simplify(): RegularExpression {
		const left = this.left.simplify();
		const right = this.right.simplify();

		// e∅ = ∅e = ∅
		if (left.equals(Empty.Instance) || right.equals(Empty.Instance)) {
			return Empty.Instance;
		}
		// εe = e
		else if (left.equals(Nil.Instance)) {
			return right;
		}
		// eε = e
		else if (right.equals(Nil.Instance)) {
			return left;
		}
		// e₁(e₂e₃) = (e₁e₂)e₃ = e₁e₂e₃
		else if (right instanceof Sequence) {
			return new Sequence(new Sequence(left, right.left).simplify(), right.right).simplify();
		}
		else {
			return new Sequence(left, right);
		}
	}

	public equals(other: RegularExpression): boolean {
		return other instanceof Sequence &&
			// e₁e₂ = e₁e₂
			this.left.equals(other.left) && this.right.equals(other.right);
	}
}

export class Alternative extends RegularExpression {
	public constructor(
		public readonly left: RegularExpression,
		public readonly right: RegularExpression,
	) {
		super();
	}

	private contains(other: RegularExpression): boolean {
		return this.left.equals(other) || this.right.equals(other) ||
			(this.left instanceof Alternative && this.left.contains(other)) ||
			(this.right instanceof Alternative && this.right.contains(other));
	}

	public format(): string {
		const left = this.left.precedence() < this.precedence() ? "(" + this.left.format() + ")" : this.left.format();
		const right = this.right.precedence() <= this.precedence() ? "(" + this.right.format() + ")" : this.right.format();
		return left + " + " + right;
	}

	public simplify(): RegularExpression {
		const left = this.left.simplify();
		const right = this.right.simplify();

		// ∅ + e = e
		if (left.equals(Empty.Instance)) {
			return right;
		}
		// e + ∅ = e
		else if (right.equals(Empty.Instance)) {
			return left;
		}
		// e + e = e
		else if (left.equals(right)) {
			return left;
		}
		// ε + e* = e*
		else if (left.equals(Nil.Instance) && right instanceof Star) {
			return right;
		}
		// e* + ε = e*
		else if (left instanceof Star && right.equals(Nil.Instance)) {
			return left;
		}
		// e₁e₂ + e₁e₃ = e₁(e₂ + e₃)
		else if (left instanceof Sequence && right instanceof Sequence && left.left.equals(right.left)) {
			return new Sequence(left.left, new Alternative(left.right, right.right).simplify()).simplify();
		}
		// e₁e₃ + e₂e₃ = (e₁ + e₂)e₃
		else if (left instanceof Sequence && right instanceof Sequence && left.right.equals(right.right)) {
			return new Sequence(new Alternative(left.left, right.left).simplify(), left.right).simplify();
		}
		// e₁ + (e₂ + e₃) = (e₁ + e₂) + e₃ = e₁ + e₂ + e₃
		else if (right instanceof Alternative) {
			return new Alternative(new Alternative(left, right.left), right.right);
		}
		// e₁ + e₂ + e₁ = e₂ + e₁ + e₁ = e₁ + e₂
		// And deeper variants, e.i. if e₁ = e₃ + e₄ then e₁ + e₂ = e₄
		// and recursively deeper.
		else if (left instanceof Alternative && left.contains(right)) {
			return left;
		}
		else {
			return new Alternative(left, right);
		}
	}

	public equals(other: RegularExpression): boolean {
		return other instanceof Alternative &&
			// e₁ + e₂ = e₁ + e₂
			((this.left.equals(other.left) && this.right.equals(other.right)) ||
				// e₁ + e₂ = e₂ + e₁
				(this.left.equals(other.right) && this.right.equals(other.left)));
	}
}

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

/**
 * Lower index is higher precedence.
 */
const precedence = [
	Empty,
	Nil,
	Symbol,
	Star,
	Sequence,
	Alternative,
];