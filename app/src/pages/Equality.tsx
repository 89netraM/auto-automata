import React, { Component, ReactNode } from "react";
import { Automata, Graph, StateEquivalenceTable as StateEquivalenceTableType } from "auto-automata";
import { StateEquivalenceTable } from "../components/StateEquivalenceTable";
import { TableAutomata } from "../components/TableAutomata";

interface State {
	automataA: Automata;
	automataB: Automata;
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
		});
	}
	private updateAutomataB(automataB: Automata): void {
		this.setState({
			automataB,
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
		const isSameAlphabet = this.sameAlphabet(this.state.automataA.alphabet, this.state.automataB.alphabet);
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
					<h2>Automata Equality</h2>
					<p>Enter two DFAs with the same alphabet below to learn if they represent the same language.</p>
					<div className="side-by-side">
						<div>
							<p>DFA A</p>
							<TableAutomata
								automata={this.state.automataA}
								onChange={this.updateAutomataA.bind(this)}
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
								onChange={this.updateAutomataB.bind(this)}
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
						onClick={this.compare}
						disabled={errorsA.length > 0 || errorsB.length > 0 || !isSameAlphabet}
					>Compare</button>
					{
						isSameAlphabet ? null :
						<ul>
							<li>Not the same alphabet.</li>
						</ul>
					}
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