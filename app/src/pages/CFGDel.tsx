import React from "react";
import { ContextFreeGrammar as CFG } from "auto-automata";
import { CFGTransformation } from "./CFGTransformation";

export class CFGDel extends CFGTransformation {
	protected title: React.ReactNode = <h2>Context Free Grammar: Del Transformation</h2>;
	protected text: React.ReactNode = <p>Provide a context free grammar, and click the button to perform the <i>del</i> transformation.</p>;
	protected button: React.ReactNode = <span>Del Transform</span>

	protected produceSteps(): Array<CFG.ContextFreeGrammar> {
		const steps = new Array<CFG.ContextFreeGrammar>();
		this.state.cfg.del(cfg => steps.push(cfg));
		return steps;
	}
}