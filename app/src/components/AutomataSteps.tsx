import React, { Component, ReactNode } from "react";
import { Automata } from "../../../src";
import { VisualAutomata } from "./VisualAutomata";

export interface Properties {
	steps: Array<Automata> | null;
}

export class AutomataSteps extends Component<Properties, {}> {
	public constructor(props: Properties) {
		super(props);
	}

	public shouldComponentUpdate(nextProps: Properties): boolean {
		return this.props.steps !== nextProps.steps;
	}

	public render(): ReactNode {
		return (
			<>
				{
					this.props.steps.map((a, i) =>
						<div key={i}>
							<VisualAutomata automata={a}/>
							<hr/>
						</div>
					)
				}
			</>
		);
	}
}