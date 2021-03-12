import React, { Component, ReactNode } from "react";
import { Automata, StateEquivalenceTable as StateEquivalenceTableType } from "auto-automata";
import { StateEquivalenceTable } from "../components/StateEquivalenceTable";
import { TableAutomata } from "../components/TableAutomata";

interface State {
	automata: Automata;
	isValid: boolean;
	steps: Array<[string, StateEquivalenceTableType]>;
}

export class AutomataStateEquivalence extends Component<{}, State> {
	public constructor(props: {}) {
		super(props);

		this.state = {
			automata: {
				starting: null,
				accepting: new Set<string>(),
				states: {},
				alphabet: new Set<string>(),
			},
			isValid: false,
			steps: null,
		};

		this.updateAutomata = this.updateAutomata.bind(this);
		this.makeTable = this.makeTable.bind(this);
	}

	private updateAutomata(automata: Automata): void {
		this.setState({
			automata,
			isValid: Automata.validate(automata) === true,
		});
	}

	private makeTable(): void {
		const steps = new Array<[string, StateEquivalenceTableType]>();
		Automata.stateEquivalenceTable(this.state.automata, (t, desc) => steps.push([desc, t]));
		this.setState({
			steps,
		});
	}

	public render(): ReactNode {
		return (
			<>
				<section>
					<h2>Automata State Equivalence Table</h2>
					<p>Enter a DFA and compute its state equivalence table.</p>
					<TableAutomata
						automata={this.state.automata}
						onChange={this.updateAutomata}
					/>
					<br/>
					<button
						className="primary"
						onClick={this.makeTable}
						disabled={!this.state.isValid}
					>Compute Table</button>
				</section>
				{
					this.state.steps == null ? null :
					<section>
						<h2>Equivalence Table</h2>
						{
							this.state.steps.map(([desc, t], i) =>
								<div key={i}>
									<p>{desc}</p>
									<StateEquivalenceTable table={t}/>
								</div>
							)
						}
					</section>
				}
			</>
		);
	}
}