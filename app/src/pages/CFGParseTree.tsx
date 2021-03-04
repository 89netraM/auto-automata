import React, { Component, ReactNode } from "react";
import { ContextFreeGrammar as CFG } from "auto-automata";
import { ParseTree } from "../components/ParseTree";
import { CFGTable } from "../components/CFGTable";

interface State {
	cfg: CFG.ContextFreeGrammar;
	string: string;
	tree: CFG.ParseTree | null | false;
}

export class CFGParseTree extends Component<{}, State> {
	public constructor(props: {}) {
		super(props);

		this.state = {
			cfg: new CFG.ContextFreeGrammar(),
			string: "",
			tree: false,
		};

		this.constructParseTree = this.constructParseTree.bind(this);
	}

	private constructParseTree(): void {
		this.setState({
			tree: this.state.cfg.parse(this.state.string),
		});
	}

	public render(): ReactNode {
		return (
			<>
				<section>
					<h2>Context Free Grammar: Parse Tree Construction</h2>
					<p>Provide a context free grammar, and a string to construct a parse tree for.</p>
					<CFGTable
						cfg={this.state.cfg}
						onChange={cfg => this.setState({ cfg })}
					/>
					<p>
						<input
							type="text"
							placeholder="String"
							value={this.state.string}
							onChange={e => this.setState({ string: e.currentTarget.value })}
						/>
					</p>
					<button
						className="primary"
						onClick={this.constructParseTree}
					>
						Construct Parse Tree
					</button>
				</section>
				{
					this.state.tree === false ? null :
					<section>
						<h3>Parse Tree</h3>
						{
							this.state.tree === null ?
								<p>
									That string could not be parsed.
									It is not in the language of the given context free grammar.
								</p> :
								<ParseTree tree={this.state.tree}/>
						}
					</section>
				}
			</>
		);
	}
}