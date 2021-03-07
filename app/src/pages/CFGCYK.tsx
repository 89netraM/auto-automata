import React, { Component, ReactNode } from "react";
import { ContextFreeGrammar as CFG } from "auto-automata";
import { CFGTable } from "../components/CFGTable";
import { CYKTable } from "../components/CYKTable";

interface State {
	cfg: CFG.ContextFreeGrammar;
	string: string;
	validString: boolean;
	cfgCNF: CFG.ContextFreeGrammar;
	steps: Array<CFG.CYKTable>;
}

enum CopyType {
	LaTeX,
}

export class CFGCYK extends Component<{}, State> {
	public constructor(props: {}) {
		super(props);

		this.state = {
			cfg: new CFG.ContextFreeGrammar(),
			string: "",
			validString: false,
			cfgCNF: null,
			steps: null,
		};

		this.constructTable = this.constructTable.bind(this);
		this.updateCFG = this.updateCFG.bind(this);
		this.updateString = this.updateString.bind(this);
	}

	private constructTable(): void {
		let cfgCNF: CFG.ContextFreeGrammar = null;
		this.state.cfg.cnf(s => cfgCNF = s);

		const steps = new Array<CFG.CYKTable>();
		this.state.cfg.cyk(this.state.string, t => steps.push(t));

		this.setState({
			cfgCNF: cfgCNF != null ? cfgCNF : null,
			steps,
		});
	}

	private updateCFG(cfg: CFG.ContextFreeGrammar): void {
		this.setState({
			cfg,
			validString: this.state.string.length > 0 && [...this.state.string].every(c => cfg.terminals.has(c)),
		});
	}

	private updateString(string: string): void {
		this.setState({
			string,
			validString: string.length > 0 && [...string].every(c => this.state.cfg.terminals.has(c)),
		});
	}

	private async copyAs(button: HTMLButtonElement, type: CopyType): Promise<void> {
		button.classList.remove("success", "fail");
		try {
			let text: string;
			switch (type) {
				case CopyType.LaTeX:
					text = this.state.steps.map(t => t.formatLaTeX()).join(" \\\\[1em]\n");
					break;
				default:
					throw null;
			}
			if (text != null) {
				await navigator.clipboard.writeText(text);
				button.classList.add("success");
			}
			else {
				throw null;
			}
		}
		catch {
			setTimeout(() => button.classList.add("fail"));
		}
	}

	public render(): ReactNode {
		return (
			<>
				<section>
					<h2>Context Free Grammar: CYK Parse Table</h2>
					<p>
						Performs the CYK algorithm to construct a parse table.<br/>
						If the given CFG is not in Chomsky normal form, it will be transformed to so that it is.
					</p>
					<CFGTable
						cfg={this.state.cfg}
						onChange={this.updateCFG}
					/>
					<p>
						<input
							type="text"
							className={this.state.validString ? "" : "error"}
							placeholder="String"
							value={this.state.string}
							onChange={e => this.updateString(e.currentTarget.value)}
						/>
					</p>
					<button
						className="primary"
						disabled={!this.state.validString}
						onClick={this.constructTable}
					>
						Construct Table
					</button>
				</section>
				{
					this.state.cfgCNF == null ? null :
					<section>
						<h3>CFG in Chomsky normal form</h3>
						<CFGTable
							cfg={this.state.cfgCNF}
							readonly={true}
						/>
					</section>
				}
				{
					this.state.steps == null ? null :
					<section>
						<h3>Steps</h3>
						{
							this.state.steps.map((t, i) =>
								<CYKTable
									key={i}
									table={t}
									maxHeight={i + 1}
								/>
							)
						}
						<div className="action-buttons">
							<span>Copy all steps as</span>
							<button
								data-icon="📄"
								onClick={e => this.copyAs(e.currentTarget, CopyType.LaTeX)}
								title="Copy all steps as LaTeX"
							>LaTeX</button>
						</div>
					</section>
				}
			</>
		);
	}
}