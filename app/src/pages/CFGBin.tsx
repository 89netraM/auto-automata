import React, { Component, ReactNode } from "react";
import { ContextFreeGrammar as CFG } from "auto-automata";
import { ParseTree } from "../components/ParseTree";
import { CFGTable } from "../components/CFGTable";

interface State {
	cfg: CFG.ContextFreeGrammar;
	steps: Array<CFG.ContextFreeGrammar>;
}

export class CFGBin extends Component<{}, State> {
	public constructor(props: {}) {
		super(props);

		this.state = {
			cfg: new CFG.ContextFreeGrammar(),
			steps: new Array<CFG.ContextFreeGrammar>(),
		};

		this.binTransform = this.binTransform.bind(this);
	}

	private binTransform(): void {
		const steps = new Array<CFG.ContextFreeGrammar>();
		this.state.cfg.bin(cfg => steps.push(cfg));
		this.setState({
			steps,
		});
	}

	public render(): ReactNode {
		return (
			<>
				<section>
					<h2>Context Free Grammar: Bin Transformation</h2>
					<p>Provide a context free grammar, and click the button to perform the <i>bin</i> transformation.</p>
					<CFGTable
						cfg={this.state.cfg}
						onChange={cfg => this.setState({ cfg })}
					/>
					<br/>
					<button
						className="primary"
						onClick={this.binTransform}
					>
						Bin Transform
					</button>
				</section>
				{
					this.state.steps.length === 0 ? null :
					<section>
						<h3>Transformation Steps</h3>
						{
							this.state.steps.map((cfg, i) =>
								<CFGTable
									key={i}
									cfg={cfg}
									readonly={true}
								/>
							)
						}
					</section>
				}
			</>
		);
	}
}