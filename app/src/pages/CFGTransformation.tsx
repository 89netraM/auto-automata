import React, { Component, ReactNode } from "react";
import { ContextFreeGrammar as CFG } from "auto-automata";
import { CFGTable } from "../components/CFGTable";

interface State {
	cfg: CFG.ContextFreeGrammar;
	steps: Array<CFG.ContextFreeGrammar>;
}

export abstract class CFGTransformation extends Component<{}, State> {
	protected abstract title: ReactNode;
	protected abstract text: ReactNode;
	protected abstract button: ReactNode;

	public constructor(props: {}) {
		super(props);

		this.state = {
			cfg: new CFG.ContextFreeGrammar(),
			steps: new Array<CFG.ContextFreeGrammar>(),
		};

		this.transform = this.transform.bind(this);
	}

	protected abstract produceSteps(): Array<CFG.ContextFreeGrammar>;
	private transform(): void {
		this.setState({
			steps: this.produceSteps(),
		});
	}

	public render(): ReactNode {
		return (
			<>
				<section>
					{this.title}
					{this.text}
					<CFGTable
						cfg={this.state.cfg}
						onChange={cfg => this.setState({ cfg })}
					/>
					<br/>
					<button
						className="primary"
						onClick={this.transform}
					>
						{this.button}
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