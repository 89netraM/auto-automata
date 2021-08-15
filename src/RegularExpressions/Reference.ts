import { RegularExpression } from "./RegularExpression";

export class Reference extends RegularExpression {
	public constructor(
		public readonly id: string,
	) {
		super();
	}

	public format(): string {
		return this.id;
	}

	public run(string: string): Array<string> {
		return new Array<string>();
	}

	public traverse(visitor: (e: RegularExpression) => void): void { }

	public equals(other: RegularExpression): boolean {
		return other instanceof Reference &&
			// e = e
			this.id === other.id;
	}

	public isEmpty(): boolean {
		return false;
	}

	protected name(): string {
		return RegularExpression.ReferenceName;
	}
}