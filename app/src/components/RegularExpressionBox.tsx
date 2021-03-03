import React, { Component, ReactNode } from "react";
import { RegularExpressions as RE } from "auto-automata";

export interface Properties {
	expression: RE.RegularExpression;
	readOnly?: boolean;
	onChange?: (exp: RE.RegularExpression) => void;
}
interface State {
	previousExp: RE.RegularExpression;
	text: string;
	isValid: boolean;
}

export class RegularExpressionBox extends Component<Properties, State> {
	public constructor(props: Properties) {
		super(props);

		this.state = {
			previousExp: this.props.expression,
			text: this.props.expression.equals(RE.Empty) ? "" : this.props.expression.format(),
			isValid: true,
		};
	}

	private async updateExpression(text: string): Promise<void> {
		const exp = text.length === 0 ? RE.Empty : RE.parse(text);
		const isValid = ((text.match(/\(/g) || []).length === (text.match(/\)/g) || []).length) && exp instanceof RE.RegularExpression;
		const newExp = isValid && !this.state.previousExp.equals(exp);
		await this.setState({
			previousExp: newExp ? exp : this.state.previousExp,
			text,
			isValid,
		});
		if (newExp && this.props.onChange != null) {
			this.props.onChange(exp);
		}
	}

	public render(): ReactNode {
		return (
			<label className={!this.state.isValid ? "error" : ""}>
				<input type="text"
					value={this.state.text}
					placeholder={RE.Empty.format()}
					onChange={e => this.updateExpression(e.target.value)}
				/>
			</label>
		);
	}
}