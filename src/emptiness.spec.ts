import { isEmpty } from "./emptiness";

describe("The emptiness of Automatas →", () => {
	it("a simple empty Automata should be empty", () => {
		expect(isEmpty(
			{
				starting: "s₀",
				accepting: new Set([ "s₁" ]),
				states: {
					"s₀": {
						"0": new Set([]),
					},
					"s₁": {
						"0": new Set([ "s₁" ]),
					},
				},
				alphabet: new Set([ "0" ]),
			}
		)).toBeTruthy();
	});
	it("a simple non-empty Automata should not be empty", () => {
		expect(isEmpty(
			{
				starting: "s₀",
				accepting: new Set([ "s₁" ]),
				states: {
					"s₀": {
						"0": new Set([ "s₁" ]),
					},
					"s₁": {
						"0": new Set([ "s₁" ]),
					},
				},
				alphabet: new Set([ "0" ]),
			}
		)).toBeFalsy();
	});
	it("a convoluted empty Automata should be empty", () => {
		expect(isEmpty(
			{
				starting: "s₀",
				accepting: new Set([ "s₅" ]),
				states: {
					"s₀": {
						"0": new Set([ "s₁" ]),
					},
					"s₁": {
						"0": new Set([ "s₂" ])
					},
					"s₂": {
						"0": new Set([ "s₃", "s₄" ])
					},
					"s₃": {
						"0": new Set([ "s₄" ])
					},
					"s₄": {
						"0": new Set([ "s₀" ])
					},
					"s₅": {
						"0": new Set([ "s₅" ]),
					},
				},
				alphabet: new Set([ "0" ]),
			}
		)).toBeTruthy();
	});
	it("a convoluted non-empty Automata should not be empty", () => {
		expect(isEmpty(
			{
				starting: "s₀",
				accepting: new Set([ "s₅" ]),
				states: {
					"s₀": {
						"0": new Set([ "s₁" ]),
					},
					"s₁": {
						"0": new Set([ "s₁", "s₂" ])
					},
					"s₂": {
						"0": new Set([ "s₀", "s₃" ])
					},
					"s₃": {
						"0": new Set([ "s₄" ])
					},
					"s₄": {
						"0": new Set([ "s₀", "s₅" ])
					},
					"s₅": {
						"0": new Set([ "s₅" ]),
					},
				},
				alphabet: new Set([ "0" ]),
			}
		)).toBeFalsy();
	});
});