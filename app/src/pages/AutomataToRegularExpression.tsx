import React, { Component, ReactNode } from "react";
import { Automata, Graph, RegularExpressions as RE } from "auto-automata";
import { AutomataSteps } from "../components/AutomataSteps";
import { TableAutomata } from "../components/TableAutomata";
import { VisualAutomata } from "../components/VisualAutomata";

interface State {
	automata: Automata;
	steps: Array<Automata>;
	expression: RE.RegularExpression;
}

export class AutomataToRegularExpression extends Component<{}, State> {
	public constructor(props: {}) {
		super(props);

		this.state = {
			automata: {
				starting: null,
				accepting: new Set<string>(),
				states: {},
				alphabet: new Set<string>(),
			},
			steps: null,
			expression: null,
		};
	}

	private convert(): void {
		if (Automata.validate(this.state.automata) === true) {
			const steps = new Array<Automata>();
			const expression = RE.fromAutomata(this.state.automata, a => steps.push(a));
			this.setState({
				steps,
				expression,
			});
		}
	}

	public render(): ReactNode {
		return (
			<>
				<section>
					<h2>Original Automata</h2>
					<p>Any finite automata that you wan to convert into a regular expression.</p>
					<TableAutomata automata={this.state.automata}
						onChange={a => this.setState({ automata: a })}/>
					<VisualAutomata automata={this.state.automata}/>
					<p>
						<button className="primary"
							onClick={this.convert.bind(this)}
						>Convert</button>
					</p>
				</section>
				{
					this.state.steps == null ? null :
					<section>
						<h2>Steps</h2>
						<p>The steps for building a regular expression from the given automata.</p>
						<AutomataSteps steps={this.state.steps}/>
						<h3>Final result</h3>
						{
							this.state.expression == null ? (
								<p>
									No expression could be calculated.
									{
										this.state.steps.length === 0 ? null :
										<>
											<br/>
											The steps might point you in the right direction.
											Or not, these steps obviously didn't lead to a solution.
										</>
									}
								</p>
							) : (
								<p>
									The regular expression calculated from the given automata:<br/>
									<code>{this.state.expression.format()}</code>
								</p>
							)
						}
					</section>
				}
			</>
		);
	}
}