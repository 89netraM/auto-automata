import React, { Component, ReactNode } from "react";
import { ContextFreeGrammar as CFG } from "auto-automata";
import { CFGTable } from "../components/CFGTable";
import TeX from "@matejmazur/react-katex";

interface State {
	cfg: CFG.ContextFreeGrammar;
	steps: {
		bin: Array<[CFG.ContextFreeGrammar, string]>;
		del: Array<[CFG.ContextFreeGrammar, string]>;
		unit: Array<[CFG.ContextFreeGrammar, string]>;
		term: Array<[CFG.ContextFreeGrammar, string]>;
	};
}

enum CopyType {
	LaTeX,
}

export class CFGCNF extends Component<{}, State> {
	public constructor(props: {}) {
		super(props);

		this.state = {
			cfg: new CFG.ContextFreeGrammar(),
			steps: null,
		};

		this.transform = this.transform.bind(this);
	}

	private transform(): void {
		const bin = new Array<[CFG.ContextFreeGrammar, string]>();
		let del: Array<[CFG.ContextFreeGrammar, string]> = null;
		let unit: Array<[CFG.ContextFreeGrammar, string]> = null
		let term: Array<[CFG.ContextFreeGrammar, string]> = null;

		try {
			let cfg = this.state.cfg.bin((cfg, desc) => bin.push([cfg, desc]));
			if (cfg != null) {
				del = new Array<[CFG.ContextFreeGrammar, string]>();
				cfg = cfg.del((cfg, desc) => del.push([cfg, desc]));
				if (cfg != null) {
					unit = new Array<[CFG.ContextFreeGrammar, string]>();
					cfg = cfg.unit((cfg, desc) => unit.push([cfg, desc]));
					if (cfg != null) {
						term = new Array<[CFG.ContextFreeGrammar, string]>();
						cfg.term((cfg, desc) => term.push([cfg, desc]));
					}
				}
			}
		}
		catch {}

		this.setState({
			steps: {
				bin,
				del,
				unit,
				term,
			},
		});
	}

	private async copyAs(button: HTMLButtonElement, type: CopyType): Promise<void> {
		button.classList.remove("success", "fail");
		try {
			let text: string;
			switch (type) {
				case CopyType.LaTeX:
					text = [
						this.state.steps.bin.map(([cfg, _]) => cfg.formatLaTeX()).join(" \\\\[1em]\n"),
						this.state.steps.del.map(([cfg, _]) => cfg.formatLaTeX()).join(" \\\\[1em]\n"),
						this.state.steps.unit.map(([cfg, _]) => cfg.formatLaTeX()).join(" \\\\[1em]\n"),
						this.state.steps.term.map(([cfg, _]) => cfg.formatLaTeX()).join(" \\\\[1em]\n"),
					].join(" \\\\[3em]\n\n");
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
					<h2>Context Free Grammar: Chomsky Normal Form</h2>
					<p>
						Perform the <i>Chomsky normal form</i> transformation on the provided CFG by clicking the button.<br/>
						The transformations are <TeX
							math="\text{T\footnotesize{ERM}}(\text{U\footnotesize{NIT}}(\text{D\footnotesize{EL}}(\text{B\footnotesize{IN}}(G))))"
						/> on the CFG <TeX math="G"/>.<br/>
						A CFG in <i>Chomsky normal form</i> have all productions in the form <TeX math="𝐴 → 𝐵𝐶"/> or <TeX math="𝐴 → a"/>.
					</p>
					<CFGTable
						cfg={this.state.cfg}
						onChange={cfg => this.setState({ cfg })}
					/>
					<br/>
					<button
						className="primary"
						onClick={this.transform}
					>CNF Transform</button>
				</section>
				{
					this.state.steps == null ? null :
					<section>
						<h3>Transformation Steps</h3>
						{
							this.state.steps.bin != null &&
								this.state.steps.del != null &&
								this.state.steps.unit != null &&
								this.state.steps.term != null ?
									null :
									<p>The CNF transformation could not complete. See below for the <b>incomplete</b> transformation.</p>
						}
						{
							this.state.steps.bin == null ? null :
							<>
								<h4>Bin</h4>
								{
									this.state.steps.bin.map(([cfg, desc], i) =>
										<div key={i}>
											<p>{desc}</p>
											<CFGTable
												cfg={cfg}
												readonly={true}
											/>
										</div>
									)
								}
								<br/>
								<hr/>
							</>
						}
						{
							this.state.steps.del == null ? null :
							<>
								<h4>Del</h4>
								{
									this.state.steps.del.map(([cfg, desc], i) =>
										<div key={i}>
											<p>{desc}</p>
											<CFGTable
												cfg={cfg}
												readonly={true}
											/>
										</div>
									)
								}
								<br/>
								<hr/>
							</>
						}
						{
							this.state.steps.unit == null ? null :
							<>
								<h4>Unit</h4>
								{
									this.state.steps.unit.map(([cfg, desc], i) =>
										<div key={i}>
											<p>{desc}</p>
											<CFGTable
												cfg={cfg}
												readonly={true}
											/>
										</div>
									)
								}
								<br/>
								<hr/>
							</>
						}
						{
							this.state.steps.term == null ? null :
							<>
								<h4>Term</h4>
								{
									this.state.steps.term.map(([cfg, desc], i) =>
										<div key={i}>
											<p>{desc}</p>
											<CFGTable
												cfg={cfg}
												readonly={true}
											/>
										</div>
									)
								}
								<br/>
								<hr/>
							</>
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