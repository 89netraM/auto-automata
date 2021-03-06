import React, { Component, ReactNode, KeyboardEvent } from "react";
import { Automata, Graph, ValidatorError } from "auto-automata";
import { sortBySymbolButFirst } from "../../../src/symbolHelpers";
import { compareAutomatas, uuid } from "../utils";

export interface Properties {
	automata: Automata;
	readOnly?: boolean;
	onChange?: (a: Automata) => void;
}
interface State {
	alphabet: Array<string>;
	states: Array<{
		starting: boolean;
		accepting: boolean;
		name: string;
		transitions: Array<[string, boolean]>;
	}>;
	newSymbol: [string, boolean];
	newState: [string, boolean];
}

enum CopyType {
	ASCII,
	LaTeX,
}

export class TableAutomata extends Component<Properties, State> {
	private static automataToState(a: Automata): State {
		const validation = Automata.validate(a);
		const errors = validation === true ? new Array<ValidatorError>() : validation;

		const alphabet = [...a.alphabet].sort();
		if (Object.values(a.states).some(s => Graph.Epsilon in s)) {
			alphabet.unshift(Graph.Epsilon);
		}

		const states = new Array<State["states"][number]>();
		for (const name in a.states) {
			const transitions = new Array<[string, boolean]>();
			for (const symbol of alphabet) {
				if (symbol in a.states[name]) {
					transitions.push([
						[...a.states[name][symbol]]
							.sort(([x, _x], [y, _y]) => sortBySymbolButFirst(x, y, a.starting))
							.join(", "),
						!errors.some(({path}) => path[0] === "states" && path[1] === name && path[2] === symbol)
					]);
				}
				else {
					transitions.push(["", true]);
				}
			}
			states.push({
				starting: name === a.starting,
				accepting: a.accepting.has(name),
				name,
				transitions,
			});
		}

		return {
			alphabet,
			states,
			newSymbol: ["", true],
			newState: ["", true],
		};
	}

	private static doesStateRepresentAutomata(s: State, a: Automata): boolean {
		if (s.alphabet.length !== a.alphabet.size) {
			return false;
		}
		if (!s.alphabet.every(s => a.alphabet.has(s[0]))) {
			return false;
		}

		let acceptingCount = 0;
		for (const state of s.states) {
			if (!(state.name in a.states)) {
				return false;
			}
			if (state.starting && state.name !== a.starting) {
				return false;
			}
			if (state.accepting) {
				acceptingCount++;
				if (!a.accepting.has(state.name)) {
					return false;
				}
			}

			for (let i = 0; i < s.alphabet.length; i++) {
				const sTargets = state.transitions[i][0].split(",").map(t => t.trim());
				const aTargets = a.states[state.name][s.alphabet[i][0]];
				if (aTargets == null || sTargets.length !== aTargets.size) {
					return false;
				}
				if (!sTargets.every(t => aTargets.has(t))) {
					return false;
				}
			}
		}

		if (acceptingCount !== a.accepting.size) {
			return false;
		}

		return true;
	}

	private static stateToAutomata(s: State): Automata {
		let starting: string = null;
		const accepting = new Set<string>();
		const states: Graph = {};

		for (const state of s.states) {
			if (starting == null && state.starting) {
				starting = state.name;
			}
			if (state.accepting) {
				accepting.add(state.name);
			}

			const transitions: Graph[string] = {};
			for (let i = 0; i < s.alphabet.length; i++) {
				transitions[s.alphabet[i][0]] = new Set<string>(
					state.transitions[i][0]
						.split(",")
						.map(t => t.trim())
						.filter(t => t.length > 0)
				);
			}
			states[state.name] = transitions;
		}

		return {
			starting,
			accepting,
			states,
			alphabet: new Set<string>(s.alphabet.map(([s, _]) => s).filter(s => s !== Graph.Epsilon)),
		};
	}

	private readonly id: string;

	public constructor(props: Properties) {
		super(props);

		this.id = uuid();
		this.state = TableAutomata.automataToState(this.props.automata);
	}

	public componentDidUpdate(prevProps: Properties, prevState: State): void {
		if (prevProps.readOnly !== this.props.readOnly ||
			(!compareAutomatas(prevProps.automata, this.props.automata) &&
			!TableAutomata.doesStateRepresentAutomata(this.state, this.props.automata))) {
			this.setState(TableAutomata.automataToState(this.props.automata));
		}
	}

	private callOnChange(): void {
		if (this.props.onChange != null) {
			this.props.onChange(
				TableAutomata.stateToAutomata(this.state)
			);
		}
	}

	private async setStarting(name: string): Promise<void> {
		await this.setState({
			states: this.state.states.map(s => ({ ...s, starting: s.name === name })),
		});
		this.callOnChange();
	}

	private async toggleAccepting(name: string): Promise<void> {
		await this.setState({
			states: this.state.states.map(s => ({ ...s, accepting: s.name === name ? !s.accepting : s.accepting })),
		});
		this.callOnChange();
	}

	private async updateTransitions(name: string, index: number, value: string): Promise<void> {
		const isValid = this.validateTransition(this.state.states, value);

		await this.setState({
			states: this.state.states.map(s => ({
				...s,
				transitions: s.name === name ? s.transitions.map((t, i) => i === index ? [value, isValid] : t) : s.transitions
			}))
		});
		this.callOnChange();
	}
	private validateTransition(states: State["states"], transition: string): boolean {
		return transition.length === 0 ||
			transition
				.split(",")
				.map(t => t.trim())
				.filter(t => t.length > 0)
				.every(t => states.some(s => s.name === t));
	}

	private updateNewSymbol(value: string): void {
		const isValid = !/\s/.test(value) && this.state.alphabet.every(s => s[0] !== value);

		this.setState({
			newSymbol: [value, isValid]
		});
	}
	private async addNewSymbol(): Promise<void> {
		if (this.state.newSymbol[0].length > 0 && this.state.newSymbol[1]) {
			await this.setState({
				alphabet: [...this.state.alphabet, this.state.newSymbol[0]],
				states: this.state.states.map(s => ({ ...s, transitions: [...s.transitions, ["", true]] })),
				newSymbol: ["", true],
			});
			this.callOnChange();
		}
	}

	private updateNewState(value: string): void {
		const isValid = !/\s/.test(value) && this.state.states.every(s => s.name !== value);

		this.setState({
			newState: [value, isValid]
		});
	}
	private async addNewState(): Promise<void> {
		if (this.state.newState[0].length > 0 && this.state.newState[1]) {
			const states: State["states"] = [
				...this.state.states,
				{
					starting: false,
					accepting: false,
					name: this.state.newState[0],
					transitions: this.state.alphabet.map(() => ["", true]),
				}
			];
			await this.setState({
				states: states.map(s => ({
					...s,
					transitions: s.transitions.map(t => [t[0], this.validateTransition(states, t[0])])
				})),
				newState: ["", true],
			});
			this.callOnChange();
		}
	}

	private activateAdd(e: KeyboardEvent<HTMLInputElement>, f: () => void): void {
		if (e.key === "Enter") {
			f();
		}
	}

	private async deleteSymbol(index: number): Promise<void> {
		await this.setState({
			alphabet: this.state.alphabet.filter((_, i) => i !== index),
			states: this.state.states.map(s => ({
				...s,
				transitions: [
					...s.transitions.slice(0, index),
					...s.transitions.slice(index + 1)
				]
			}))
		});
		this.callOnChange();
	}

	private async deleteState(name: string): Promise<void> {
		const states = this.state.states.filter(s => s.name !== name);
		await this.setState({
			states: states.map(s => ({
				...s,
				transitions: s.transitions.map(t => [t[0], this.validateTransition(states, t[0])])
			}))
		});
		this.callOnChange();
	}

	private async copyAs(button: HTMLButtonElement, type: CopyType): Promise<void> {
		button.classList.remove("success", "fail");
		const a = TableAutomata.stateToAutomata(this.state);
		if (Automata.validate(a) === true) {
			try {
				let text: string;
				switch (type) {
					case CopyType.ASCII:
						text = Automata.formatTable(a);
						break;
					case CopyType.LaTeX:
						text = Automata.formatLaTeX(a);
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
		else {
			setTimeout(() => button.classList.add("fail"));
		}
	}

	private async pasteASCII(button: HTMLButtonElement): Promise<void> {
		button.classList.remove("success", "fail");
		try {
			const text = await navigator.clipboard.readText();
			const automata = Automata.parseTable(text);
			if (automata != null && Automata.validate(automata) === true) {
				await this.setState(TableAutomata.automataToState(automata));
				this.callOnChange();
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
		const tableRows = new Array<JSX.Element>();
		for (let i = 0; i < this.state.states.length; i++) {
			const state = this.state.states[i];
			tableRows.push(
				<tr key={state.name}>
					<td title="Starting">
						<label>
							<input type="radio"
								readOnly={this.props.readOnly}
								disabled={this.props.readOnly}
								checked={state.starting}
								onChange={() => this.setStarting(state.name)}
							/>
							<span className="radio"/>
						</label>
					</td>
					<td title="Accepting">
						<label>
							<input type="checkbox" data-boop={state.name}
								readOnly={this.props.readOnly}
								disabled={this.props.readOnly}
								checked={state.accepting}
								onChange={() => this.toggleAccepting(state.name)}
							/>
							<span className="checkbox"/>
						</label>
					</td>
					<th>{state.name}</th>
					{
						state.transitions.map((t, i) =>
							<td key={i}>
								<label className={!t[1] ? "error" : ""}>
									<input type="text"
										readOnly={this.props.readOnly}
										value={t[0]}
										onChange={e => this.updateTransitions(state.name, i, e.target.value)}
										placeholder={Graph.Empty}
									/>
								</label>
							</td>
						)
					}
					{
						this.props.readOnly ? null :
							<td className="delete"
								title={`Delete state ${state.name}`}
								onClick={() => this.deleteState(state.name)}
							>🗑️</td>
					}
				</tr>
			);
		}

		const missingStarting = !this.state.states.some(s => s.starting);

		return (
			<div>
				{
					this.props.readOnly ? null :
					<div className="action-buttons">
						<button
							data-icon="📋"
							onClick={e => this.pasteASCII(e.currentTarget)}
						>Paste from ASCII table</button>
					</div>
				}
				<table className="automata">
					<thead>
						<tr>
							<th className={missingStarting ? "error" : ""}
								title={missingStarting ? "No starting point selected" : "Starting"}
							>→</th>
							<th title="Accepting">*</th>
							<th>State</th>
							{
								this.state.alphabet.map(s =>
									<th key={s}>{s}</th>
								)
							}
							{
								this.props.readOnly ? null :
									<th>
										<label className={!this.state.newSymbol[1] ? "error" : ""}>
											<input
												type="text"
												placeholder="Add"
												value={this.state.newSymbol[0]}
												onChange={e => this.updateNewSymbol(e.target.value)}
												onKeyPress={e => this.activateAdd(e, this.addNewSymbol.bind(this))}
												onBlur={this.addNewSymbol.bind(this)}
												list={`${this.id}-state-name-list`}
											/>
											<datalist id={`${this.id}-state-name-list`}>
												{
													this.state.alphabet.some(s => s === Graph.Epsilon) ? null :
														<option value={Graph.Epsilon}/>
												}
											</datalist>
										</label>
									</th>
							}
						</tr>
					</thead>
					<tbody>
						{tableRows}
						{
							this.props.readOnly ? null :
								<tr>
									<td></td>
									<td></td>
									<td>
										<label className={!this.state.newState[1] ? "error" : ""}>
											<input
												type="text"
												placeholder="Add"
												value={this.state.newState[0]}
												onChange={e => this.updateNewState(e.target.value)}
												onKeyPress={e => this.activateAdd(e, this.addNewState.bind(this))}
												onBlur={this.addNewState.bind(this)}
											/>
										</label>
									</td>
									{
										this.state.alphabet.map((s, i) =>
											<td key={s}
												className="delete"
												title={`Delete symbol ${s}`}
												onClick={() => this.deleteSymbol(i)}
											>🗑️</td>
										)
									}
								</tr>
						}
					</tbody>
				</table>
				<div className="action-buttons">
					<button
						data-icon="📄"
						onClick={e => this.copyAs(e.currentTarget, CopyType.ASCII)}
						title="Copy this automata as an ASCII table"
					>ASCII table</button>
					<button
						data-icon="📄"
						onClick={e => this.copyAs(e.currentTarget, CopyType.LaTeX)}
						title="Copy this automata as LaTeX"
					>LaTeX</button>
				</div>
			</div>
		);
	}
}