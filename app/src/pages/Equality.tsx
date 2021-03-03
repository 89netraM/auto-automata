import React, { Component, ReactNode } from "react";
import { Automata, StateEquivalenceTable as StateEquivalenceTableType } from "auto-automata";
import { StateEquivalenceTable } from "../components/StateEquivalenceTable";
import { TableAutomata } from "../components/TableAutomata";

interface State {
	automataA: Automata;
	automataB: Automata;
	stateEquivalence: StateEquivalenceTableType,
	equals: boolean;
}

export class Equality extends Component<{}, State> {
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
			stateEquivalence: null,
			equals: false,
		};
	}

	private sameAlphabet(a: ReadonlySet<string>, b: ReadonlySet<string>): boolean {
		for (const aSymbol of a) {
			if (!b.has(aSymbol)) {
				return false;
			}
		}
		for (const bSymbol of b) {
			if (!a.has(bSymbol)) {
				return false;
			}
		}
		return true;
	}

	private updateAutomataA(automataA: Automata): void {
		if (Automata.validate(automataA) && Automata.validate(this.state.automataB)) {
			const stateEquivalence = this.sameAlphabet(automataA.alphabet, this.state.automataB.alphabet) ?
				Automata.stateEquivalenceTable(automataA, this.state.automataB) : null;
			this.setState({
				automataA,
				stateEquivalence,
				equals: stateEquivalence?.[automataA.starting][this.state.automataB.starting] ?? false,
			});
		}
		else {
			this.setState({
				automataA,
			});
		}
	}
	private updateAutomataB(automataB: Automata): void {
		if (Automata.validate(this.state.automataA) && Automata.validate(automataB)) {
			const stateEquivalence = this.sameAlphabet(this.state.automataA.alphabet, automataB.alphabet) ?
				Automata.stateEquivalenceTable(this.state.automataA, automataB) : null;
			this.setState({
				automataB,
				stateEquivalence,
				equals: stateEquivalence?.[this.state.automataA.starting][automataB.starting] ?? false,
			});
		}
		else {
			this.setState({
				automataB,
			});
		}
	}

	public render(): ReactNode {
		return (
			<>
				<section>
					<h2>Automata Equality</h2>
					<p>Enter two DFAs with the same alphabet below to learn if they represent the same language.</p>
					<div className="side-by-side">
						<div>
							<p>DFA A</p>
							<TableAutomata
								automata={this.state.automataA}
								onChange={this.updateAutomataA.bind(this)}
							/>
						</div>
						<div>
							<p>DFA B</p>
							<TableAutomata
								automata={this.state.automataB}
								onChange={this.updateAutomataB.bind(this)}
							/>
						</div>
					</div>
				</section>
				{
					this.state.stateEquivalence == null ? null :
					<section>
						<h2>Equals: {this.state.equals ? "✔️" : "❌"}</h2>
						<p>A state equivalence table is built from the two DFAs:</p>
						<StateEquivalenceTable table={this.state.stateEquivalence}/>
						{
							this.state.equals ?
								<p>
									Since the two starting states ({this.state.automataA.starting} and&nbsp;
									{this.state.automataB.starting}) are equivalent, the two DFAs are equal and
									represent the same language.
								</p> :
								<p>
									Because the two starting states ({this.state.automataA.starting} and&nbsp;
									{this.state.automataB.starting}) are not equivalent, the two DFAs are not equal and
									do not represent the same language.
								</p>
						}
					</section>
				}
			</>
		);
	}
}