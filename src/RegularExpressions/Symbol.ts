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

	public run(string: string): Array<string> {
		if (string.startsWith(this.symbol)) {
			return new Array<string>(string.substring(this.symbol.length));
		}
		else {
			return new Array<string>();
		}
	}

	public equals(other: RegularExpression): boolean {
		return other instanceof Symbol &&
			// s = s
			this.symbol === other.symbol;
	}
}