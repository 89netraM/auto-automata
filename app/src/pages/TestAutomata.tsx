import React, { Component, ReactNode } from "react";
import { Automata } from "auto-automata";
import { TableAutomata } from "../components/TableAutomata";
import { uuid } from "../utils";

interface State {
	automata: Automata;
	strings: Array<[string, string, boolean]>;
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
		};
	}

	private updateAutomata(a: Automata): void {
		this.setState({
			automata: a,
			strings: this.state.strings.map(([id, string, _]) => [id, string, Automata.test(a, string)]),
		});
	}

	private addString(input: HTMLInputElement): void {
		const string = input.value;
		if (string != null && string.length > 0) {
			this.setState({
				strings: [
					...this.state.strings,
					[uuid(), string, Automata.test(this.state.automata, string)]
				]
			});
			input.value = "";
		}
	}

	private updateString(id: string, string: string): void {
		this.setState({
			strings: this.state.strings .map(([i, s, included]) => i === id ?
				[id, string, Automata.test(this.state.automata, string)] :
				[i, s, included]
			),
		});
	}

	private blurString(id: string): void {
		this.setState({
			strings: this.state.strings.filter(([i, string, _]) => !(i === id && string.length === 0)),
		});
	}

	public render(): ReactNode {
		return (
			<>
				<section>
					<h2>Test Automata</h2>
					<p>Enter an automata to test strings against.</p>
					<TableAutomata
						automata={this.state.automata}
						onChange={a => this.updateAutomata(a)}
					/>
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
					<input
						type="text"
						spellCheck={false}
						placeholder="Add string"
						onKeyPress={e => e.key === "Enter" && this.addString(e.currentTarget)}
						onBlur={e => this.addString(e.currentTarget)}
					/>
				</section>
			</>
		);
	}
}