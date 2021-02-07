import React, { Component, ReactNode } from "react";
import { Automata } from "../../../src";
import { TableAutomata } from "../components/TableAutomata";
import { VisualAutomata } from "../components/VisualAutomata";

const a: Automata = {
	starting: "s₂",
	accepting: new Set<string>(["s₃"]),
	states: {
		"s₂": {
			"1": new Set<string>(["s₃"]),
		},
		"s₃": {
			"1": new Set<string>(["s₄"]),
		},
		"s₄": {
			"1": new Set<string>(["s₂"]),
		},
	},
	alphabet: new Set<string>(["1"]),
};

interface State {
	automata: Automata;
}

export class Home extends Component<{}, State> {
	public constructor(props: {}) {
		super(props);
		this.state = {
			automata: a,
		};
	}

	public render(): ReactNode {
		return (
			<>
				<section>
					<h1>Home</h1>
					<p>Home home home home</p>
					<div>
						<TableAutomata automata={this.state.automata} onChange={a => this.setState({ automata: a })}/>
						<VisualAutomata automata={this.state.automata}/>
					</div>
				</section>
			</>
		);
	}
}