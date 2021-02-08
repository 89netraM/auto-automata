import React, { Component, ReactNode } from "react";
import { Automata } from "../../../src";
import { TableAutomata } from "../components/TableAutomata";
import { VisualAutomata } from "../components/VisualAutomata";

interface State {
	automata: Automata;
	steps: Array<Automata>;
}

export class SubsetConstruction extends Component<{}, State> {
	public constructor(props: {}) {
		super(props);

		this.state = {
			automata: {
				starting: null,
				accepting: new Set<string>(),
				states: {},
				alphabet: new Set<string>(),
			},
			steps: new Array<Automata>(),
		};
	}

	private constructSubset(): void {
		const steps = new Array<Automata>();
		Automata.constructSubset(this.state.automata, a => steps.push(a));
		this.setState({
			steps,
		});
	}

	public render(): ReactNode {
		return (
			<>
				<section>
					<h2>Original Automata</h2>
					<p>Either a ε-NFA or NFA.<br/>Or a DFA, but why would you do that?</p>
					<TableAutomata automata={this.state.automata}
						onChange={a => this.setState({ automata: a })}/>
					<VisualAutomata automata={this.state.automata}/>
					<p>
						<button className="primary"
							onClick={this.constructSubset.bind(this)}
						>Construct Subset</button>
					</p>
				</section>

				{
					this.state.steps.length === 0 ? null :
					<>
						<section>
							<h2>Steps</h2>
							<p>The steps for subset construction of the given automata.</p>
							{
								this.state.steps.map((a, i) =>
									<div key={i}>
										<VisualAutomata automata={a}/>
										<hr/>
									</div>
								)
							}
							<TableAutomata automata={this.state.steps[this.state.steps.length - 1]}
								readOnly={true}/>
						</section>
					</>
				}
			</>
		);
	}
}