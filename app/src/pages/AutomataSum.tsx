import React, { Component, ReactNode } from "react";
import { Automata, Graph } from "auto-automata";
import { AutomataSteps } from "../components/AutomataSteps";
import { TableAutomata } from "../components/TableAutomata";

interface State {
	automataA: Automata;
	automataB: Automata;
	steps: Array<Automata>;
}

export class AutomataSum extends Component<{}, State> {
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

	private constructSum(): void {
		if (Automata.validate(this.state.automataA) === true && Automata.validate(this.state.automataB) === true) {
			const steps = new Array<Automata>();
			Automata.constructSum(this.state.automataA, this.state.automataB, a => steps.push(a));
			this.setState({
				steps,
			});
		}
	}

	public render(): ReactNode {
		const validationA = Automata.validate(this.state.automataA);
		const errorsA = validationA === true ? new Array<string>() : [...new Set<string>(validationA.map(e => e.error))];
		if (!Graph.isDFA(this.state.automataA.states)) {
			errorsA.unshift("automata is not a DFA");
		}
		const validationB = Automata.validate(this.state.automataB);
		const errorsB = validationB === true ? new Array<string>() : [...new Set<string>(validationB.map(e => e.error))];
		if (!Graph.isDFA(this.state.automataB.states)) {
			errorsB.unshift("automata is not a DFA");
		}
		return (
			<>
				<section>
					<h2>Automata Sum</h2>
					<p>Enter two DFAs to construct their sum.</p>
					<div className="side-by-side">
						<div>
							<p>DFA A</p>
							<TableAutomata
								automata={this.state.automataA}
								onChange={automataA => this.setState({ automataA })}
							/>
							{
								errorsA.length === 0 ? null :
								<ul>
									{errorsA.map((e, i) =>
										<li key={i}>
											{e[0].toUpperCase() + e.substring(1)}.
										</li>
									)}
								</ul>
							}
						</div>
						<div>
							<p>DFA B</p>
							<TableAutomata
								automata={this.state.automataB}
								onChange={automataB => this.setState({ automataB })}
							/>
							{
								errorsB.length === 0 ? null :
								<ul>
									{errorsB.map((e, i) =>
										<li key={i}>
											{e[0].toUpperCase() + e.substring(1)}.
										</li>
									)}
								</ul>
							}
						</div>
					</div>
					<br/>
					<button
						className="primary"
						onClick={this.constructSum.bind(this)}
						disabled={errorsA.length > 0 || errorsB.length > 0}
					>
						Construct Sum
					</button>
				</section>
				{
					this.state.steps.length === 0 ? null :
					<section>
						<h2>Steps</h2>
						<p>The steps for sum construction of the given DFAs.</p>
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