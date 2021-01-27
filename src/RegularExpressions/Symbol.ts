import { RegularExpression } from "./RegularExpression";

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