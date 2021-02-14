import React, { Component, ReactNode, MouseEvent } from "react";
import { AutomataToRegularExpression, Readme, RegularExpressionToAutomata, SubsetConstruction, TestAutomata, TestRegularExpression } from "./pages";

const pages = {
	"Readme": <Readme />,
	"Test Automata": <TestAutomata />,
	"Subset Construction": <SubsetConstruction />,
	"Automata to RegExp": <AutomataToRegularExpression />,
	"Test RegExp": <TestRegularExpression />,
	"RegExp to Automata": <RegularExpressionToAutomata />,
} as const;

interface State {
	active: string;
	navVisible: boolean;
}

export class App extends Component<{}, State> {
	public constructor(props: {}) {
		super(props);

		this.state = {
			active: "Readme",
			navVisible: false,
		};
	}

	private navigateTo(e: MouseEvent<HTMLAnchorElement, globalThis.MouseEvent>, path: string): void {
		e.preventDefault();
		this.setState({
			active: path,
			navVisible: false,
		});
	}

	public render(): ReactNode {
		return (
			<>
				<header>
					<button
						className="expand-nav"
						onClick={() => this.setState({ navVisible: !this.state.navVisible })}
					></button>
					<h1>Auto Automata</h1>
				</header>
				<nav className={this.state.navVisible ? "visible" : null}>
					<ul>
						{Object.keys(pages).map(name =>
							<li key={name}
								className={name === this.state.active ? "active" : ""}>
								<a href={name}
									onClickCapture={e => this.navigateTo(e, name)}
								>{name}</a>
							</li>
						)}
						<div className="marker"></div>
					</ul>
				</nav>
				<main>
					{ pages[this.state.active] }
				</main>
			</>
		);
	}
}