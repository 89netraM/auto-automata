import React, { ChangeEvent, Component, ReactNode } from "react";
import { ContextFreeGrammar as CFG } from "auto-automata";
import { uuid } from "src/utils";

export interface Properties {
	cfg: CFG.ContextFreeGrammar;
	readonly?: boolean;
	onChange?: (cfg: CFG.ContextFreeGrammar) => void;
}
interface State {
	nonTerminals: Array<[string, string, boolean]>;
	addNonTerminal: [string, boolean];
	terminals: Array<[string, string, boolean]>;
	addTerminal: [string, boolean];
	productions: Array<[string, Array<Array<[string, CFG.TokenKind]>>]>;
	start: string;
}

enum CopyType {
	UTF8,
	LaTeX,
}

function tokenKindToId(kind: CFG.TokenKind): string {
	return {
		[CFG.TokenKind.NonTerminal]: "nt",
		[CFG.TokenKind.Terminal]: "t",
		[CFG.TokenKind.Empty]: "e",
	}[kind];
}
function tokenIdToKind(id: string): CFG.TokenKind {
	return {
		"nt": CFG.TokenKind.NonTerminal,
		"t": CFG.TokenKind.Terminal,
		"e": CFG.TokenKind.Empty,
	}[id];
}

export class CFGTable extends Component<Properties, State> {
	public constructor(props: Properties) {
		super(props);

		if (this.props.cfg != null) {
			const nonTerminalIds = new Map<string, string>([...this.props.cfg.nonTerminals].map(nt => [nt, uuid()]));
			const terminalIds = new Map<string, string>([...this.props.cfg.terminals].map(nt => [nt, uuid()]));
			this.state = {
				nonTerminals: [...this.props.cfg.nonTerminals].map(nt => [nonTerminalIds.get(nt), nt, true]),
				addNonTerminal: ["", true],
				terminals: [...this.props.cfg.terminals].map(t => [terminalIds.get(t), t, true]),
				addTerminal: ["", true],
				start: this.props.cfg.start,
				productions: [...this.props.cfg.productions].map(([nt, alts]) => [
					nonTerminalIds.get(nt),
					alts.map(seq => seq.map(t => [
						t.kind === CFG.TokenKind.NonTerminal ? nonTerminalIds.get(t.identifier) :
							t.kind === CFG.TokenKind.Terminal ? terminalIds.get(t.identifier) : "",
						t.kind
					]))
				]),
			};
		}
		else {
			this.state = {
				nonTerminals: new Array<[string, string, boolean]>(),
				addNonTerminal: ["", true],
				terminals: new Array<[string, string, boolean]>(),
				addTerminal: ["", true],
				start: null,
				productions: new Array<[string, Array<Array<[string, CFG.TokenKind]>>]>(),
			};
		}
	}

	public shouldComponentUpdate(nextProps: Properties, nextState: State): boolean {
		if (![...nextProps.cfg.nonTerminals].every(nonTerminal=> this.state.nonTerminals.some(([_, nt, v]) => v && nt === nonTerminal)) ||
			!this.state.nonTerminals.every(([_, nt, v]) => v && nextProps.cfg.nonTerminals.has(nt))
		) {
			return true;
		}
		if (![...nextProps.cfg.terminals].every(terminal=> this.state.terminals.some(([_, nt, v]) => v && nt === terminal)) ||
			!this.state.terminals.every(([_, nt, v]) => v && nextProps.cfg.terminals.has(nt))
		) {
			return true;
		}
		if (nextProps.cfg.start !== this.buildStart()) {
			return true;
		}
		if (nextProps.readonly !== this.props.readonly || nextProps.onChange !== this.props.onChange) {
			return true;
		}
		return nextState !== this.state
	}

	private async addNonTerminal(): Promise<void> {
		if (this.state.addNonTerminal[0].length > 0 && this.state.addNonTerminal[1]) {
			const id = uuid();
			await this.setState({
				nonTerminals: [
					...this.state.nonTerminals,
					[id, this.state.addNonTerminal[0], true],
				],
				addNonTerminal: ["", true],
				productions: [
					...this.state.productions,
					[id, new Array<Array<[string, CFG.TokenKind]>>()]
				],
			});
			this.sendUpdate();
		}
	}
	private updateAddNonTerminal(value: string): void {
		this.setState({
			addNonTerminal: [value, this.state.nonTerminals.every(([_id, nt, _v]) => nt !== value)],
		});
	}
	private async updateNonTerminal(index: number, value: string): Promise<void> {
		const isValid = (nonTerminal: string, i: number): boolean =>
			this.state.nonTerminals.every(([_id, nt, _v], ii) => nt.length > 0 && (ii === i || (ii === index ? value !== nonTerminal : nt !== nonTerminal)));
		const validator = ([id, nt, _]: [string, string, boolean], i: number): [string, string, boolean] =>
			[id, nt, nt !== value && isValid(nt, i)];
		const isCurrentValid = isValid(value, index);
		await this.setState({
			nonTerminals: [
				...this.state.nonTerminals.slice(0, index).map(validator),
				[this.state.nonTerminals[index][0], value, isCurrentValid],
				...this.state.nonTerminals.slice(index + 1).map((e, i) => validator(e, index + 1 + i)),
			],
		});
		this.sendUpdate();
	}
	private blurNonTerminal(index: number): void {
		if (this.state.nonTerminals[index][1].length === 0) {
			const removedId = this.state.nonTerminals[index][0];
			this.setState({
				nonTerminals: [
					...this.state.nonTerminals.slice(0, index),
					...this.state.nonTerminals.slice(index + 1),
				],
				productions: this.state.productions
					.filter(([id, _]) => id !== removedId)
					.map(([id, alts]) => [
						id,
						alts.map(seq => seq.filter(([id, _]) => id !== removedId))
							.filter(seq => seq.length > 0)
					]),
				start: removedId === this.state.start ? null : this.state.start,
			});
		}
	}
	private isNonTerminalsValid(): boolean {
		return this.state.nonTerminals.every(([_id, _nt, v]) => v);
	}

	private async addTerminal(): Promise<void> {
		if (this.state.addTerminal[0].length > 0 && this.state.addTerminal[1]) {
			await this.setState({
				terminals: [
					...this.state.terminals,
					[uuid(), this.state.addTerminal[0], true],
				],
				addTerminal: ["", true],
			});
			this.sendUpdate();
		}
	}
	private updateAddTerminal(value: string): void {
		this.setState({
			addTerminal: [value, this.state.terminals.every(([_id, t, _v]) => t !== value)],
		});
	}
	private async updateTerminal(index: number, value: string): Promise<void> {
		const isValid = (terminal: string, i: number): boolean =>
			this.state.terminals.every(([_id, t, _v], ii) => t.length > 0 && (ii === i || (ii === index ? value !== terminal : t !== terminal)));
		const validator = ([id, nt, _]: [string, string, boolean], i: number): [string, string, boolean] =>
			[id, nt, nt !== value && isValid(nt, i)];
		const isCurrentValid = isValid(value, index);
		await this.setState({
			terminals: [
				...this.state.terminals.slice(0, index).map(validator),
				[this.state.terminals[index][0], value, isCurrentValid],
				...this.state.terminals.slice(index + 1).map((e, i) => validator(e, index + 1 + i)),
			],
		});
		this.sendUpdate();
	}
	private blurTerminal(index: number): void {
		if (this.state.terminals[index][1].length === 0) {
			const removedId = this.state.terminals[index][0];
			this.setState({
				terminals: [
					...this.state.terminals.slice(0, index),
					...this.state.terminals.slice(index + 1),
				],
				productions: this.state.productions.map(([id, alts]) => [
					id,
					alts.map(seq => seq.filter(([id, _]) => id !== removedId))
						.filter(seq => seq.length > 0)
				]),
			});
		}
	}
	private isTerminalsValid(): boolean {
		return this.state.terminals.every(([_id, _t, v]) => v);
	}

	private buildProductions(): Array<[string, CFG.Production]> {
		return this.state.productions.map(([id, alts]) => [
			this.state.nonTerminals.find(([i, _nt, _v]) => i === id)[1],
			alts.map(seq => seq.map(([i, t]) =>
				t === CFG.TokenKind.NonTerminal ?
					CFG.Token.nonTerminal(this.state.nonTerminals.find(([id, _nt, _v]) => id === i)[1]) :
						t === CFG.TokenKind.Terminal ?
							CFG.Token.terminal(this.state.terminals.find(([id, _nt, _v]) => id === i)[1]) :
							CFG.Token.empty()
			))
		]);
	}

	private async addAlternative(select: string, productionId: string): Promise<void> {
		const [_, k, id] = /^(nt|t|e)-(.*)$/.exec(select);
		const kind = tokenIdToKind(k);
		await this.setState({
			productions: this.state.productions.map(([i, alts]) => [
				i,
				i !== productionId ? alts : [
					...alts,
					new Array<[string, CFG.TokenKind]>([id, kind]),
				]
			]),
		});
		this.sendUpdate();
	}
	private async addToken(select: string, productionId: string, altI: number): Promise<void> {
		const [_, k, id] = /^(nt|t|e)-(.*)$/.exec(select);
		const kind = tokenIdToKind(k);
		await this.setState({
			productions: this.state.productions.map(([i, alts]) => [
				i,
				i !== productionId ? alts : alts.map((seq, i) => i !== altI ? seq : [
					...seq,
					[id, kind],
				])
			]),
		});
		this.sendUpdate();
	}
	private async editToken(select: HTMLSelectElement, id: string, altI: number, seqI: number): Promise<void> {
		if (select.value === "Delete") {
			const edited = new Array<Array<[string, CFG.TokenKind]>>();
			const alts = this.state.productions.find(([i, _]) => i === id)[1];
			if (alts[altI].length > 1) {
				edited.push([
					...alts[altI].slice(0, seqI),
					...alts[altI].slice(seqI + 1)
				]);
			}
			await this.setState({
				productions: this.state.productions.map(([i, alts]) => [
					i,
					i !== id ? alts : [
						...alts.slice(0, altI),
						...edited,
						...alts.slice(altI + 1),
					]
				]),
			});
		}
		else {
			const [_, k, newTokenId] = /^(nt|t|e)-(.*)$/.exec(select.value);
			const kind = tokenIdToKind(k);
			await this.setState({
				productions: this.state.productions.map(([i, alts]) => [
					i,
					i !== id ? alts :
						alts.map((seq, aI) => aI !== altI ? seq :
							seq.map((t, sI) => sI !== seqI ? t :
								[newTokenId, kind]))
				]),
			})
		}
		this.sendUpdate();
	}

	private async setStart(start: string): Promise<void> {
		await this.setState({ start });
		this.sendUpdate();
	}
	private buildStart(): string {
		return this.state.nonTerminals.find(([id, _nt, _v]) => id === this.state.start)?.[1];
	}

	private buildCFG(): CFG.ContextFreeGrammar {
		return new CFG.ContextFreeGrammar(
			this.state.nonTerminals.map(([_id, nt, _v]) => nt),
			this.state.terminals.map(([_id, t, _v]) => t),
			this.buildProductions(),
			this.buildStart(),
		);
	}

	private sendUpdate(): void {
		if (this.isNonTerminalsValid() && this.isTerminalsValid()) {
			this.props.onChange?.(this.buildCFG());
		}
	}

	private async copyAs(button: HTMLButtonElement, type: CopyType): Promise<void> {
		button.classList.remove("success", "fail");
		try {
			let text: string;
			switch (type) {
				case CopyType.UTF8:
					text = this.buildCFG().formatUTF8();
					break;
				case CopyType.LaTeX:
					text = this.buildCFG().formatLaTeX();
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

	public render(): ReactNode {
		return (
			<div className="cfg-table">
				<p>
					(&#123;
						{
							this.state.nonTerminals.map(([id, nt, v], i) =>
								<input
									key={id}
									type="text"
									className={v ? "" : "error"}
									value={nt}
									onChange={e => this.updateNonTerminal(i, e.currentTarget.value)}
									onKeyPress={e => e.key === "Enter" ? this.blurNonTerminal(i) : null}
									onBlur={this.blurNonTerminal.bind(this, i)}
								/>
							)
						}
						<input
							type="text"
							className={this.state.addNonTerminal[1] ? "" : "error"}
							placeholder="Add"
							value={this.state.addNonTerminal[0]}
							onChange={e => this.updateAddNonTerminal(e.currentTarget.value)}
							onKeyPress={e => e.key === "Enter" ? this.addNonTerminal() : null}
							onBlur={this.addNonTerminal.bind(this)}
						/>
					&#125;,&#32;
					&#123;
						{
							this.state.terminals.map(([id, t, v], i) =>
								<input
									key={id}
									type="text"
									className={v ? "" : "error"}
									value={t}
									onChange={e => this.updateTerminal(i, e.currentTarget.value)}
									onKeyPress={e => e.key === "Enter" ? this.blurTerminal(i) : null}
									onBlur={this.blurTerminal.bind(this, i)}
								/>
							)
						}
						<input
							type="text"
							className={this.state.addTerminal[1] ? "" : "error"}
							placeholder="Add"
							value={this.state.addTerminal[0]}
							onChange={e => this.updateAddTerminal(e.currentTarget.value)}
							onKeyPress={e => e.key === "Enter" ? this.addTerminal() : null}
							onBlur={this.addTerminal.bind(this)}
						/>
					&#125;,&#32;
					<i>P</i>,&#32;
					<select
						value={this.state.start ?? ""}
						onChange={e => this.setStart(e.currentTarget.value)}
					>
						<option
							hidden
							value={""}
						>Select S</option>
						{
							this.state.nonTerminals.map(([id, nt, _]) =>
								<option
									key={id}
									value={id}
								>{nt}</option>
							)
						}
					</select>)
				</p>
				{this.renderPTable()}
				<div className="action-buttons">
					<button
						data-icon="📄"
						onClick={e => this.copyAs(e.currentTarget, CopyType.UTF8)}
						title="Copy this CFG as a UTF-8 file"
					>UTF-8</button>
					<button
						data-icon="📄"
						onClick={e => this.copyAs(e.currentTarget, CopyType.LaTeX)}
						title="Copy this CFG as LaTeX"
					>LaTeX</button>
				</div>
			</div>
		);
	}
	private renderPTable(): ReactNode {
		return (
			<div className="p-table">
				<span><i>P</i>:</span>
				<table>
					<tbody>
						{
							this.state.productions.map(([id, alts]) =>
								<tr key={id}>
									{this.renderProduction(id, alts)}
								</tr>
							)
						}
					</tbody>
				</table>
			</div>
		);
	}
	private renderProduction(id: string, alts: Array<Array<[string, CFG.TokenKind]>>): ReactNode {
		return (
			<>
				<th>{
					this.state.nonTerminals.find(([i, _nt, _v]) => i === id)[1]
				}</th>
				<td>→</td>
				<td>
					{
						alts.map((seq, altI) =>
							<div
								key={altI}
								className="alternative"
							>
								{
									seq.map(([i, k], seqI) =>
										<select
											key={seqI}
											value={`${tokenKindToId(k)}-${i}`}
											onChange={e => this.editToken(e.currentTarget, id, altI, seqI)}
										>
											<option
												value="Delete"
											>Delete</option>
											{this.renderTokenOptions()}
										</select>
									)
								}
								{this.renderTokenSelect(
									"Add",
									e => this.addToken(e.currentTarget.value, id, altI)
								)}
							</div>
						)
					}
				</td>
				<td>
					{this.renderTokenSelect(
						"Add Alternative",
						e => this.addAlternative(e.currentTarget.value, id)
					)}
				</td>
			</>
		);
	}
	private renderTokenSelect(defaultName: string, onChange: (event: ChangeEvent<HTMLSelectElement>) => void): ReactNode {
		return (
			<select
				value=""
				onChange={onChange}
			>
				<option
					hidden
					value=""
				>{defaultName}</option>
				{this.renderTokenOptions()}
			</select>
		);
	}
	private renderTokenOptions(): ReactNode {
		return (
			<>
				<optgroup label="Non-terminals">
					{
						this.state.nonTerminals.map(([i, nt]) =>
							<option
								key={i}
								value={`nt-${i}`}
							>{nt}</option>
						)
					}
				</optgroup>
				<optgroup label="Terminals">
					{
						this.state.terminals.map(([i, t]) =>
							<option
								key={i}
								value={`t-${i}`}
							>{t}</option>
						)
					}
					<option
						value="e-"
					>ε</option>
				</optgroup>
			</>
		);
	}
}