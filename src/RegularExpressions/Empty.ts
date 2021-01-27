import { RegularExpression } from "./RegularExpression";

export class Empty extends RegularExpression {
	public static readonly Instance: RegularExpression = new Empty();
	public static readonly Character: string = "∅";

	private constructor() {
		super();
	}

	public format(): string {
		return Empty.Character;
	}

	public equals(other: RegularExpression): boolean {
		// ∅ = ∅
		return other instanceof Empty;
	}
}