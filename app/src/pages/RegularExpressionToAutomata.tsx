import React, { Component, ReactNode } from "react";
import { Automata, RegularExpressions as RE } from "../../../src";
import { AutomataSteps } from "../components/AutomataSteps";
import { RegularExpressionBox } from "../components/RegularExpressionBox";
import { TableAutomata } from "../components/TableAutomata";

interface State {
	expression: RE.RegularExpression;
	steps: Array<Automata>;
}

export class RegularExpressionToAutomata extends Component<{}, State> {
	public constructor(props: {}) {
		super(props);

		this.state = {
			expression: RE.Empty,
			steps: new Array<Automata>(),
		};
	}

	private convert(): void {
		const steps = new Array<Automata>();
		Automata.fromRegularExpression(this.state.expression, a => steps.push(a));
		this.setState({
			steps,
		});
	}

	public render(): ReactNode {
		return (
			<>
				<section>
					<h2>Regular Expression</h2>
					<p>Convert a regular expression to an ε-NFA.</p>
					<RegularExpressionBox expression={this.state.expression}
						onChange={exp => this.setState({ expression: exp })}
					/>
					<p>
						<button className="primary"
							onClick={this.convert.bind(this)}
						>Convert</button>
					</p>
				</section>
				{
					this.state.steps.length === 0 ? null :
					<section>
						<h2>Steps</h2>
						<p>The steps for building an ε-NFA from the given regular expression.</p>
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