export abstract class RegularExpression {
	public abstract format(): string;
	public abstract equals(other: RegularExpression): boolean;

	public simplify(): RegularExpression {
		return this;
	}

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
	"Symbol",
	"Star",
	"Sequence",
	"Alternative",
] as const;