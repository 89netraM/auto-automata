import { RegularExpression } from "./RegularExpression";

export class Nil extends RegularExpression {
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