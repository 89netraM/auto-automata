import { Alternative } from "./Alternative";
import { Empty } from "./Empty";
import { Nil } from "./Nil";
import { Reference } from "./Reference";
import { RegularExpression } from "./RegularExpression";
import { Star } from "./Star";

export class Sequence extends RegularExpression {
	public static readonly Character: string = "";

	public readonly left: RegularExpression;
	public readonly right: RegularExpression;

	public constructor(
		left: RegularExpression,
		right: RegularExpression,
	);
	public constructor(alternatives: ReadonlyArray<RegularExpression>);
	public constructor(a: RegularExpression | ReadonlyArray<RegularExpression>, b?: RegularExpression) {
		super();
		if (a instanceof RegularExpression) {
			this.left = a;
			this.right = b;
		}
		else {
			if (a.length < 2) {
				throw new Error("empty or only element in sequence");
			}
			else if (a.length === 2) {
				this.left = a[0];
				this.right = a[1];
			}
			else {
				this.left = new Sequence(a.slice(0, a.length - 1));
				this.right = a[a.length - 1];
			}
		}
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
		const right = this.right.precedence() < this.precedence() ? "(" + this.right.format() + ")" : this.right.format();
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
		// e*e = ee*
		else if (left instanceof Star && left.exp.equals(right)) {
			return new Sequence(right, left);
		}
		// (e₁*e₂)*e₁* = (e₁ + e₂)*
		else if (left instanceof Star && left.exp instanceof Sequence && left.exp.flat()[0].equals(right) && right instanceof Star) {
			const elements = left.exp.flat().slice(1);
			let rightRight: RegularExpression;
			if (elements.length === 1) {
				rightRight = elements[0];
			}
			else {
				rightRight = new Sequence(elements);
			}
			return new Star(new Alternative(right.exp, rightRight)).simplify();
		}
		// (e₁e₂)*e₁ = e₁(e₂e₁)*
		else if (left instanceof Star && left.exp instanceof Sequence && left.exp.flat()[0].equals(right)) {
			return new Sequence(right, new Star(new Sequence([...left.exp.flat().slice(1), right]))).simplify();
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

	public isEmpty(): boolean {
		return this.left.isEmpty() || this.right.isEmpty();
	}
}