import { Alternative } from "./Alternative";
import { Empty } from "./Empty";
import { RegularExpression } from "./RegularExpression";
import { Sequence } from "./Sequence";
import { Star } from "./Star";
import { Symbol } from "./Symbol";

describe("The emptiness of Regular Expressions →", () => {
	it("Alternative should be empty if both alternatives are empty", () => {
		expect(new Alternative(new Symbol("A"), new Symbol("A")).isEmpty()).toBeFalsy();
		expect(new Alternative(new Symbol("A"), Empty.Instance).isEmpty()).toBeFalsy();
		expect(new Alternative(Empty.Instance, new Symbol("A")).isEmpty()).toBeFalsy();
		expect(new Alternative(Empty.Instance, Empty.Instance).isEmpty()).toBeTruthy();
	});
	it("Sequence should be empty if either part is empty", () => {
		expect(new Sequence(new Symbol("A"), new Symbol("A")).isEmpty()).toBeFalsy();
		expect(new Sequence(new Symbol("A"), Empty.Instance).isEmpty()).toBeTruthy();
		expect(new Sequence(Empty.Instance, new Symbol("A")).isEmpty()).toBeTruthy();
		expect(new Sequence(Empty.Instance, Empty.Instance).isEmpty()).toBeTruthy();
	});
	it("Star should never be empty", () => {
		expect(new Star(new Symbol("A")).isEmpty()).toBeFalsy();
		expect(new Star(Empty.Instance).isEmpty()).toBeFalsy();
	});
});