import React, { Component, ReactNode } from "react";
import { Automata, StateEquivalenceTable as StateEquivalenceTableType } from "auto-automata";
import { StateEquivalenceTable } from "../components/StateEquivalenceTable";
import { TableAutomata } from "../components/TableAutomata";

interface State {
	automataA: Automata;
	automataB: Automata;
	validCombination: boolean;
	steps: Array<[string, StateEquivalenceTableType]>;
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
			validCombination: true,
			steps: null,
			equals: false,
		};

		this.compare = this.compare.bind(this);
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
		this.setState({
			automataA,
			validCombination: Automata.validate(automataA) &&
				Automata.validate(this.state.automataB) &&
				this.sameAlphabet(automataA.alphabet, this.state.automataB.alphabet),
		});
	}
	private updateAutomataB(automataB: Automata): void {
		this.setState({
			automataB,
			validCombination: Automata.validate(this.state.automataA) &&
				Automata.validate(automataB) &&
				this.sameAlphabet(this.state.automataA.alphabet, automataB.alphabet),
		});
	}

	private compare(): void {
		const steps = new Array<[string, StateEquivalenceTableType]>();
		const stateEquivalence = Automata.stateEquivalenceTable(this.state.automataA, this.state.automataB, (t, desc) => steps.push([desc, t]));
		this.setState({
			steps,
			equals: stateEquivalence?.[this.state.automataA.starting][this.state.automataB.starting] ?? false,
		});
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
					<br/>
					<button
						className="primary"
						onClick={this.compare}
						disabled={!this.state.validCombination}
					>Compare</button>
				</section>
				{
					this.state.steps == null ? null :
					<section>
						<h2>Equals: {this.state.equals ? "✔️" : "❌"}</h2>
						<p>A state equivalence table is built from the two DFAs:</p>
						{
							this.state.steps.map(([desc, t], i) =>
								<div key={i}>
									<p>{desc}</p>
									<StateEquivalenceTable table={t}/>
								</div>
							)
						}
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