export abstract class RegularExpression {
	public abstract format(): string;
	public abstract run(string: string): Array<string>;
	public abstract equals(other: RegularExpression): boolean;
	public abstract isEmpty(): boolean;

	public test(string: string): boolean {
		return this.run(string).some(r => r.length === 0);
	}

	public simplify(): RegularExpression {
		return this;
	}

	public replace(name: string, exp: RegularExpression): RegularExpression {
		return this;
	}

	public traverse(visitor: (e: RegularExpression) => void): void { }

	public precedence(): number {
		return precedence.length - precedence.indexOf((this as any)["constructor"]["name"]);
	}
}

/**
 * Lower index is higher precedence.
 */
const precedence = [
	"Empty",
	"Nil",
	"Reference",
	"Symbol",
	"Star",
	"Sequence",
	"Alternative",
] as const;