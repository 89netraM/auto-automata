import React, { Component, ReactNode, MouseEvent } from "react";
import { AutomataToRegularExpression, Home, RegularExpressionToAutomata, SubsetConstruction } from "./pages";

const pages = {
	"Home": <Home />,
	"Subset Construction": <SubsetConstruction />,
	"RegExp to Automata": <RegularExpressionToAutomata />,
	"Automata to RegExp": <AutomataToRegularExpression />,
} as const;

interface State {
	active: string;
}

export class App extends Component<{}, State> {
	public constructor(props: {}) {
		super(props);

		this.state = {
			active: "Home",
		};
	}

	private navigateTo(e: MouseEvent<HTMLAnchorElement, globalThis.MouseEvent>, path: string): void {
		e.preventDefault();
		this.setState({
			active: path,
		});
	}

	public render(): ReactNode {
		return (
			<>
				<header>
					<button className="expand-nav"></button>
					<h1>Auto Automata</h1>
				</header>
				<nav>
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