import React, { Component, ReactNode } from "react";
import { Automata } from "auto-automata";
import { AutomataSteps } from "../components/AutomataSteps";
import { TableAutomata } from "../components/TableAutomata";

interface State {
	automataA: Automata;
	automataB: Automata;
	steps: Array<Automata>;
}

export class AutomataProduct extends Component<{}, State> {
	public constructor(props: {}) {
		super(props);

		this.state = {
			automataA: {
				starting: null,
				accepting: new Set<string>(),
				states: {},
				alphabet: new Set<string>(),
			},
			automataB: {
				starting: null,
				accepting: new Set<string>(),
				states: {},
				alphabet: new Set<string>(),
			},
			steps: new Array<Automata>(),
		};
	}

	private constructProduct(): void {
		if (Automata.validate(this.state.automataA) === true && Automata.validate(this.state.automataB) === true) {
			const steps = new Array<Automata>();
			Automata.constructProduct(this.state.automataA, this.state.automataB, a => steps.push(a));
			this.setState({
				steps,
			});
		}
	}

	public render(): ReactNode {
		return (
			<>
				<section>
					<h2>Automata Product</h2>
					<p>Enter two DFAs to construct their product.</p>
					<div className="side-by-side">
						<div>
							<p>DFA A</p>
							<TableAutomata
								automata={this.state.automataA}
								onChange={automataA => this.setState({ automataA })}
							/>
						</div>
						<div>
							<p>DFA B</p>
							<TableAutomata
								automata={this.state.automataB}
								onChange={automataB => this.setState({ automataB })}
							/>
						</div>
					</div>
					<button
						onClick={this.constructProduct.bind(this)}
						disabled={Automata.validate(this.state.automataA) !== true || Automata.validate(this.state.automataB) !== true}
					>
						Construct Product
					</button>
				</section>
				{
					this.state.steps.length === 0 ? null :
					<section>
						<h2>Steps</h2>
						<p>The steps for product construction of the given DFAs.</p>
						<AutomataSteps steps={this.state.steps}/>
						<h3>Final result</h3>
						<TableAutomata
							automata={this.state.steps[this.state.steps.length - 1]}
							readOnly={true}
						/>
					</section>
				}
			</>
		);
	}
}