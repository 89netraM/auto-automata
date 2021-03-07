import React from "react";
import { ContextFreeGrammar as CFG } from "auto-automata";
import { CFGTransformation } from "./CFGTransformation";

export class CFGBin extends CFGTransformation {
	protected title: React.ReactNode = <h2>Context Free Grammar: Bin Transformation</h2>;
	protected text: React.ReactNode = <p>Provide a context free grammar, and click the button to perform the <i>bin</i> transformation.</p>;
	protected button: React.ReactNode = <span>Bin Transform</span>

	protected produceSteps(): Array<[CFG.ContextFreeGrammar, string]> {
		const steps = new Array<[CFG.ContextFreeGrammar, string]>();
		this.state.cfg.bin((cfg, desc) => steps.push([cfg, desc]));
		return steps;
	}
}