import React, { Component, ReactNode } from "react";
import FileFormats from "../../../FileFormats.md";

export class PastingFormats extends Component<{}, {}> {
	public constructor(props: {}) {
		super(props);
	}

	public render(): ReactNode {
		return (
			<section>
				<FileFormats />
			</section>
		);
	}
}