import { Empty } from "./Empty";
import { Nil } from "./Nil";
import { Reference } from "./Reference";
import { RegularExpression } from "./RegularExpression";
import { Sequence } from "./Sequence";
import { Star } from "./Star";

export class Alternative extends RegularExpression {
	public static readonly Character: string = "+";

	public constructor(
		public readonly left: RegularExpression,
		public readonly right: RegularExpression,
	) {
		super();
	}

	public flat(): Array<RegularExpression> {
		const exps = new Array<RegularExpression>();

		const visitor = (exp: RegularExpression): void => {
			if (exp instanceof Alternative) {
				exp.traverse(visitor);
			}
			else {
				exps.push(exp);
			}
		};
		this.traverse(visitor);

		return exps;
	}

	private contains(other: RegularExpression): boolean {
		return this.left.equals(other) || this.right.equals(other) ||
			(this.left instanceof Alternative && this.left.contains(other)) ||
			(this.right instanceof Alternative && this.right.contains(other));
	}

	public format(): string {
		const left = this.left.precedence() < this.precedence() ? "(" + this.left.format() + ")" : this.left.format();
		const right = this.right.precedence() <= this.precedence() ? "(" + this.right.format() + ")" : this.right.format();
		return `${left} ${Alternative.Character} ${right}`;
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

	public run(string: string): Array<string> {
		return this.left.run(string).concat(this.right.run(string));
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

		return new Alternative(left, right);
	}

	public traverse(visitor: (e: RegularExpression) => void): void {
		visitor(this.left);
		visitor(this.right);
	}

	public equals(other: RegularExpression): boolean {
		return other instanceof Alternative &&
			// e₁ + e₂ = e₁ + e₂
			((this.left.equals(other.left) && this.right.equals(other.right)) ||
				// e₁ + e₂ = e₂ + e₁
				(this.left.equals(other.right) && this.right.equals(other.left)));
	}
}