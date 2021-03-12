import React from "react";
import { StateEquivalenceTable as StateEquivalenceTableType } from "auto-automata";

export interface Properties {
	table: StateEquivalenceTableType;
}

enum CopyType {
	LaTeX,
}

export function StateEquivalenceTable(props: Properties): JSX.Element {
	async function copyAs(button: HTMLButtonElement, type: CopyType): Promise<void> {
		button.classList.remove("success", "fail");
		try {
			let text: string;
			switch (type) {
				case CopyType.LaTeX:
					text = StateEquivalenceTableType.formatLaTeX(props.table);
					break;
				default:
					throw null;
			}
			await navigator.clipboard.writeText(text);
			button.classList.add("success");
		}
		catch {
			setTimeout(() => button.classList.add("fail"));
		}
	}

	return (
		<div>
			<table>
				<tbody>
					<tr>
						<th></th>
						{
							Object.keys(Object.values(props.table)[0]).map(k =>
								<th key={k}>{k}</th>
							)
						}
					</tr>
					{
						Object.entries(props.table).map(([n, states]) =>
							<tr key={n}>
								<th>{n}</th>
								{
									Object.entries(states).map(([n, v]) =>
										<td key={n}>
											{v ? "✔️" : "❌"}
										</td>
									)
								}
							</tr>
						)
					}
				</tbody>
			</table>
			<div className="action-buttons">
				<button
					data-icon="📄"
					onClick={e => copyAs(e.currentTarget, CopyType.LaTeX)}
					title="Copy this table as LaTeX"
				>LaTeX</button>
			</div>
		</div>
	);
}