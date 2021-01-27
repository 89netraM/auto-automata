import { RegularExpression } from "./RegularExpression";

export class Empty extends RegularExpression {
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