import React, { Component, ReactNode } from "react";
import { ContextFreeGrammar as CFG } from "auto-automata";
import TeX from "@matejmazur/react-katex";

export interface Properties {
	table: CFG.CYKTable;
	maxHeight?: number;
}

enum CopyType {
	LaTeX,
}

export class CYKTable extends Component<Properties, {}> {
	public constructor(props: Properties) {
		super(props);
	}

	private async copyAs(button: HTMLButtonElement, type: CopyType): Promise<void> {
		button.classList.remove("success", "fail");
		try {
			let text: string;
			switch (type) {
				case CopyType.LaTeX:
					text = this.props.table.formatLaTeX(this.props.maxHeight);
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
			<div className="cyk-table">
				<TeX
					math={this.props.table.formatLaTeX(this.props.maxHeight)}
					settings={{ strict: false }}
					block={true}
				/>
				<div className="action-buttons">
					<button
						data-icon="📄"
						onClick={e => this.copyAs(e.currentTarget, CopyType.LaTeX)}
						title="Copy this CYK table as LaTeX"
					>LaTeX</button>
				</div>
			</div>
		);
	}
}