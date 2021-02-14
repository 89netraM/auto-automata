import React, { Component, ReactNode } from "react";
import { RegularExpressions as RE } from "../../../src";
import { RegularExpressionBox } from "../components/RegularExpressionBox";
import { uuid } from "../utils";

interface State {
	expression: RE.RegularExpression;
	strings: Array<[string, string, boolean]>;
}

export class TestRegularExpression extends Component<{}, State> {
	public constructor(props: {}) {
		super(props);

		this.state = {
			expression: RE.Empty,
			strings: new Array<[string, string, boolean]>(),
		};
	}

	private updateExpression(exp: RE.RegularExpression): void {
		this.setState({
			expression: exp,
			strings: this.state.strings.map(([id, string, _]) => [id, string, exp.test(string)]),
		});
	}

	private addString(input: HTMLInputElement): void {
		const string = input.value;
		if (string != null && string.length > 0) {
			this.setState({
				strings: [
					...this.state.strings,
					[uuid(), string, this.state.expression.test(string)]
				]
			});
			input.value = "";
		}
	}

	private updateString(id: string, string: string): void {
		this.setState({
			strings: this.state.strings .map(([i, s, included]) => i === id ?
				[id, string, this.state.expression.test(string)] :
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
					<h2>Test Regular Expression</h2>
					<p>Enter a regular expression to test strings against.</p>
					<RegularExpressionBox
						expression={this.state.expression}
						onChange={e => this.updateExpression(e)}
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