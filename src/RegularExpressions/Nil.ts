import { RegularExpression } from "./RegularExpression";

export class Nil extends RegularExpression {
	public static readonly Instance: RegularExpression = new Nil();
	public static readonly Character: string = "ε";

	private constructor() {
		super();
	}

	public format(): string {
		return Nil.Character;
	}

	public equals(other: RegularExpression): boolean {
		// ε = ε
		return other instanceof Nil;
	}
}