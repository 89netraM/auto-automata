import * as RE from ".";

const testExpressions = (a: string, b: string): void => {
	it(`${a} and ${b} should be simplified to the same expressions`, () => {
		const aExp = RE.parse(a).simplify();
		const bExp = RE.parse(b).simplify();
		expect(aExp.equals(bExp)).toBeTruthy(`simplified: "${aExp.format()}" and "${bExp.format()}"`);
	});
};

describe("Simplification rules for Regular Expressions →", () => {
	describe("Alternative →", () => {
		testExpressions("∅ + e", "e");
		testExpressions("e + ∅", "e");
		testExpressions("e + e", "e");
		testExpressions("ε + e*", "e*");
		testExpressions("ε + ee*", "e*");
		testExpressions("e₁ + e₂e₁", "(ε + e₂)e₁");
		testExpressions("e₁ + e₂ + e₁", "e₁ + e₂");
		testExpressions("R + (S + T)", "(R + S) + T");
		testExpressions("RS + RT", "R(S + T)");
		testExpressions("RT + ST", "(R + S)T");
	});

	describe("Sequence →", () => {
		testExpressions("∅e", "∅");
		testExpressions("εe", "e");
		testExpressions("e*e", "ee*");
		testExpressions("R(ST)", "(RS)T");
		testExpressions("(R*S)*R*", "(R + S)*");
		testExpressions("(RST)*R", "R(STR)*");
	});

	describe("Star →", () => {
		testExpressions("∅*", "ε");
		testExpressions("ε*", "ε");
		testExpressions("(R*)*", "R*");
		testExpressions("(ε + R)*", "R*");
		testExpressions("(R*S*)*", "(R + S)*");
	});
});