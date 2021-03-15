import React, { Component, ReactNode } from "react";
import { Automata } from "auto-automata";
import { TableAutomata } from "../components/TableAutomata";
import { uuid } from "../utils";

interface State {
	automata: Automata;
	strings: Array<[string, string, boolean]>;
	newString: [string, boolean];
}

export class TestAutomata extends Component<{}, State> {
	public constructor(props: {}) {
		super(props);

		this.state = {
			automata: {
				starting: null,
				accepting: new Set<string>(),
				states: {},
				alphabet: new Set<string>(),
			},
			strings: new Array<[string, string, boolean]>(),
			newString: ["", false],
		};
	}

	private updateAutomata(a: Automata): void {
		const isValid = Automata.validate(a) === true;
		this.setState({
			automata: a,
			strings: this.state.strings.map(([id, string, _]) => [id, string, isValid && Automata.test(a, string)]),
			newString: [this.state.newString[0], isValid && Automata.test(a, this.state.newString[0])],
		});
	}

	private addString(): void {
		const isValid = Automata.validate(this.state.automata) === true;
		if (this.state.newString[0].length > 0) {
			this.setState({
				strings: [
					...this.state.strings,
					[uuid(), this.state.newString[0], this.state.newString[1]]
				],
				newString: ["", isValid && Automata.test(this.state.automata, "")],
			});
		}
	}

	private updateString(id: string, string: string): void {
		const isValid = Automata.validate(this.state.automata) === true;
		this.setState({
			strings: this.state.strings .map(([i, s, included]) => i === id ?
				[id, string, isValid && Automata.test(this.state.automata, string)] :
				[i, s, included]
			),
		});
	}

	private updateNewString(string: string): void {
		const isValid = Automata.validate(this.state.automata) === true;
		this.setState({
			newString: [string, isValid && Automata.test(this.state.automata, string)],
		});
	}

	private blurString(id: string): void {
		this.setState({
			strings: this.state.strings.filter(([i, string, _]) => !(i === id && string.length === 0)),
		});
	}

	public render(): ReactNode {
		const validation = Automata.validate(this.state.automata);
		const errors = validation === true ? new Array<string>() : [...new Set<string>(validation.map(e => e.error))];
		return (
			<>
				<section>
					<h2>Test Automata</h2>
					<p>Enter an automata to test strings against.</p>
					<TableAutomata
						automata={this.state.automata}
						onChange={a => this.updateAutomata(a)}
					/>
					{
						errors.length === 0 ? null :
						<ul>
							{errors.map((e, i) =>
								<li key={i}>
									{e[0].toUpperCase() + e.substring(1)}.
								</li>
							)}
						</ul>
					}
				</section>
				<section>
					<h3>Test strings</h3>
					{
						this.state.strings.map(([id, string, included]) =>
							<p
								key={id}
								className="test-string"
							>
								<input
									type="text"
									spellCheck={false}
									value={string}
									onChange={e => this.updateString(id, e.target.value)}
									onBlur={_ => this.blurString(id)}
								/>
								<span className={included ? "included" : "excluded"}/>
							</p>
						)
					}
					<div className="test-string">
						<input
							type="text"
							spellCheck={false}
							placeholder="Add string"
							value={this.state.newString[0]}
							onChange={e => this.updateNewString(e.target.value)}
							onKeyPress={e => e.key === "Enter" && this.addString()}
							onBlur={() => this.addString()}
						/>
						<span className={this.state.newString[1] ? "included" : "excluded"}/>
					</div>
				</section>
			</>
		);
	}
}