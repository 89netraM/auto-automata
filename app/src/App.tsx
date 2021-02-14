import React, { Component, ReactNode, MouseEvent } from "react";
import { AutomataToRegularExpression, Home, RegularExpressionToAutomata, SubsetConstruction, TestAutomata, TestRegularExpression } from "./pages";

const pages = {
	"Home": <Home />,
	"Subset Construction": <SubsetConstruction />,
	"RegExp to Automata": <RegularExpressionToAutomata />,
	"Automata to RegExp": <AutomataToRegularExpression />,
	"Test Automata": <TestAutomata />,
	"Test RegExp": <TestRegularExpression />,
} as const;

interface State {
	active: string;
	navVisible: boolean;
}

export class App extends Component<{}, State> {
	public constructor(props: {}) {
		super(props);

		this.state = {
			active: "Home",
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