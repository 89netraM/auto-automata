import React, { Component, ReactNode, MouseEvent } from "react";
import {
	AutomataMinimisation,
	AutomataProduct,
	AutomataSum,
	AutomataToRegularExpression,
	CFGBin,
	CFGDel,
	CFGParseTree,
	Equality,
	Readme,
	RegularExpressionToAutomata,
	SubsetConstruction,
	TestAutomata,
	TestRegularExpression,
} from "./pages";

const pages = {
	"Readme": <Readme />,
	"Test Automata": <TestAutomata />,
	"Automata Equality": <Equality />,
	"Automata Minimisation": <AutomataMinimisation />,
	"Subset Construction": <SubsetConstruction />,
	"Product Construction": <AutomataProduct />,
	"Sum Construction": <AutomataSum />,
	"Automata to RegExp": <AutomataToRegularExpression />,
	"Test RegExp": <TestRegularExpression />,
	"RegExp to Automata": <RegularExpressionToAutomata />,
	"CFG Parse Tree": <CFGParseTree />,
	"CFG Bin Transform": <CFGBin />,
	"CFG Del Transform": <CFGDel />,
} as const;

interface State {
	active: keyof typeof pages;
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

	private navigateTo(e: MouseEvent<HTMLAnchorElement, globalThis.MouseEvent>, path: keyof typeof pages): void {
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
					<nav>
						<a
							href="https://github.com/89netraM/auto-automata"
							target="_blank"
						>
							<img className="only-dark" src="./static/GitHub_Logo_White.png"/>
							<img className="only-light" src="./static/GitHub_Logo.png"/>
						</a>
					</nav>
				</header>
				<nav className={this.state.navVisible ? "visible" : null}>
					<ul>
						{(Object.keys(pages) as Array<keyof typeof pages>).map(name =>
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