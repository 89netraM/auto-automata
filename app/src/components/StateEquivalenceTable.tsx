import React from "react";
import { StateEquivalenceTable as StateEquivalenceTableType } from "auto-automata";

export interface Properties {
	table: StateEquivalenceTableType;
}

export function StateEquivalenceTable(props: Properties): JSX.Element {
	return (
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
	);
}