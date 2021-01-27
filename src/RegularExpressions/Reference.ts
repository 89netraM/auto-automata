import { RegularExpression } from "./RegularExpression";

export class Reference extends RegularExpression {
	public constructor(
		public readonly name: string,
	) {
		super();
	}

	public format(): string {
		return this.name;
	}

	public run(string: string): Array<string> {
		return new Array<string>();
	}

	public equals(other: RegularExpression): boolean {
		return other instanceof Reference &&
			// e = e
			this.name === other.name;
	}
}