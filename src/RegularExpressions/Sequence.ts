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

	public flat(): Array<RegularExpression> {
		const exps = new Array<RegularExpression>();

		const visitor = (exp: RegularExpression): void => {
			if (exp instanceof Sequence) {
				exp.traverse(visitor);
			}
			else {
				exps.push(exp);
			}
		};
		this.traverse(visitor);

		return exps;
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

	public run(string: string): Array<string> {
		const firsts = this.left.run(string);
		const result = new Array<string>();
		for (const rest of firsts) {
			result.push(...this.right.run(rest));
		}
		return result;
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

	public traverse(visitor: (e: RegularExpression) => void): void {
		visitor(this.left);
		visitor(this.right);
	}

	public equals(other: RegularExpression): boolean {
		return other instanceof Sequence &&
			// e₁e₂ = e₁e₂
			this.left.equals(other.left) && this.right.equals(other.right);
	}
}