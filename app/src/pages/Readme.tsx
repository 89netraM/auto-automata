import React, { Component, ReactNode } from "react";
import README from "../../../README.md";

export class Readme extends Component<{}, {}> {
	public constructor(props: {}) {
		super(props);
	}

	public render(): ReactNode {
		return (
			<section className="readme">
				<README />
			</section>
		);
	}
}