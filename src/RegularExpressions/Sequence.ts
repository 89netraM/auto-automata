import { Empty } from "./Empty";
import { Nil } from "./Nil";
import { Reference } from "./Reference";
import { RegularExpression } from "./RegularExpression";

export class Sequence extends RegularExpression {
	public static readonly Character: string = "";

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

	public replace(name: string, exp: RegularExpression): RegularExpression {
		let left = this.left.replace(name, exp);
		let right = this.right.replace(name, exp);

		if (left instanceof Reference && left.name === name) {
			left = exp;
		}
		if (right instanceof Reference && right.name === name) {
			right = exp;
		}

		return new Sequence(left, right);
	}

	public equals(other: RegularExpression): boolean {
		return other instanceof Sequence &&
			// e₁e₂ = e₁e₂
			this.left.equals(other.left) && this.right.equals(other.right);
	}
}