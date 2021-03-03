import { Automata } from "auto-automata";
import { compareAutomatas } from "./compareAutomatas";

describe("Comparing Automatas →", () => {
	it("should return `true` when comparing two exact copies", () => {
		const table = `
			      ε      a       b
			→ s₀  ∅     {s₁}  {s₀  s₂}
			  s₁ {s₂}   {s₄}    {s₃}
			  s₂  ∅   {s₁  s₄}  {s₃}
			  s₃ {s₅} {s₄  s₅}   ∅
			  s₄ {s₃}    ∅      {s₅}
			* s₅  ∅     {s₅}    {s₅}`;
		const a = Automata.parseTable(table);
		const b = Automata.parseTable(table);
		expect(compareAutomatas(a, b)).toBeTruthy();
	});
});