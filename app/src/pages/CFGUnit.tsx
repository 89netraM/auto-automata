import React from "react";
import { ContextFreeGrammar as CFG } from "auto-automata";
import { CFGTransformation } from "./CFGTransformation";

export class CFGUnit extends CFGTransformation {
	protected title: React.ReactNode = <h2>Context Free Grammar: Unit Transformation</h2>;
	protected text: React.ReactNode = <p>Provide a context free grammar, and click the button to perform the <i>unit</i> transformation.</p>;
	protected button: React.ReactNode = <span>Unit Transform</span>

	protected produceSteps(): Array<CFG.ContextFreeGrammar> {
		const steps = new Array<CFG.ContextFreeGrammar>();
		this.state.cfg.unit(cfg => steps.push(cfg));
		return steps;
	}
}