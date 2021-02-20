import React, { Component, ReactNode } from "react";
import { Automata, StateEquivalenceTable as StateEquivalenceTableType } from "../../../src";
import { StateEquivalenceTable } from "../components/StateEquivalenceTable";
import { TableAutomata } from "../components/TableAutomata";
import { VisualAutomata } from "../components/VisualAutomata";

interface State {
	automata: Automata;
	shavedAutomata: Automata;
	stateEquivalenceTable: StateEquivalenceTableType;
	minimalAutomata: Automata;
}

export class AutomataMinimisation extends Component<{}, State> {
	public constructor(props: {}) {
		super(props);

		this.state = {
			automata: {
				starting: null,
				accepting: new Set<string>(),
				states: {},
				alphabet: new Set<string>(),
			},
			shavedAutomata: null,
			stateEquivalenceTable: null,
			minimalAutomata: null,
		};
	}

	private minimise(): void {
		if (Automata.validate(this.state.automata) === true) {
			const shavedAutomata = Automata.removeUnreachableStates(this.state.automata);
			this.setState({
				shavedAutomata,
				stateEquivalenceTable: Automata.stateEquivalenceTable(shavedAutomata),
				minimalAutomata: Automata.minimise(this.state.automata),
			});
		}
	}

	public render(): ReactNode {
		return (
			<>
				<section>
					<h2>Automata Minimisation</h2>
					<p>Provide a DFA to be minimised</p>
					<TableAutomata
						automata={this.state.automata}
						onChange={automata => this.setState({ automata })}
					/>
					<VisualAutomata automata={this.state.automata}/>
					<button
						className="primary"
						disabled={Automata.validate(this.state.automata) !== true}
						onClick={this.minimise.bind(this)}
					>
						Minimise
					</button>
				</section>
				{
					this.state.shavedAutomata == null ||
						this.state.stateEquivalenceTable == null ||
						this.state.minimalAutomata == null ?
					null :
					<section>
						<h2>Minimal Automata</h2>
						<p>Begin by removing any unreachable states:</p>
						<VisualAutomata automata={this.state.shavedAutomata}/>
						<p>Then create a state equivalence table, like so:</p>
						<StateEquivalenceTable table={this.state.stateEquivalenceTable}/>
						<p>And finally, merge all states in the same equivalence classes:</p>
						<VisualAutomata automata={this.state.minimalAutomata}/>
						<TableAutomata
							automata={this.state.minimalAutomata}
							readOnly={true}
						/>
					</section>
				}
			</>
		);
	}
}