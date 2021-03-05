import React from "react";
import { ContextFreeGrammar as CFG } from "auto-automata";
import { CFGTransformation } from "./CFGTransformation";

export class CFGTerm extends CFGTransformation {
	protected title: React.ReactNode = <h2>Context Free Grammar: Term Transformation</h2>;
	protected text: React.ReactNode = <p>Provide a context free grammar, and click the button to perform the <i>term</i> transformation.</p>;
	protected button: React.ReactNode = <span>Term Transform</span>

	protected produceSteps(): Array<CFG.ContextFreeGrammar> {
		const steps = new Array<CFG.ContextFreeGrammar>();
		this.state.cfg.term(cfg => steps.push(cfg));
		return steps;
	}
}