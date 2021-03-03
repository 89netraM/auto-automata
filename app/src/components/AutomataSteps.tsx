import React, { Component, createRef, ReactNode, RefObject } from "react";
import { Automata } from "auto-automata";
import { renderPNG } from "../utils";
import { VisualAutomata } from "./VisualAutomata";

export interface Properties {
	steps: Array<Automata> | null;
}

enum CopyType {
	SVG,
	PNG,
}

export class AutomataSteps extends Component<Properties, {}> {
	private vaRefs: ReadonlyArray<RefObject<VisualAutomata>>;

	public constructor(props: Properties) {
		super(props);

		this.vaRefs = this.props.steps.map(_ => createRef<VisualAutomata>());
	}

	public shouldComponentUpdate(nextProps: Properties): boolean {
		return this.props.steps !== nextProps.steps;
	}

	public componentDidUpdate(): void {
		this.vaRefs = this.props.steps.map(_ => createRef<VisualAutomata>());
	}

	public getSVG(): SVGSVGElement {
		let y = 0;
		let width = 0;
		let filter: SVGFilterElement;
		const gs = new Array<SVGGElement>();
		for (let i = 0; i < this.vaRefs.length; i++) {
			const svg = this.vaRefs[i].current.getSVG();
			if (filter == null) {
				filter = svg.querySelector("filter");
			}
			const g = svg.querySelector("g");
			g.querySelectorAll("[id]").forEach(n => n.setAttribute("id", i + n.getAttribute("id")));
			g.querySelectorAll("[marker-end]").forEach(n => n.setAttribute("marker-end", n.getAttribute("marker-end").replace("#", "#" + i)));
			g.setAttribute("transform", `translate(20, ${20 + y})`);
			gs.push(g);
			y += svg.height.baseVal.value;
			width = Math.max(width, svg.width.baseVal.value);
		}
		const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
		svg.setAttribute("version", "2.0");
		svg.setAttribute("width", width.toString());
		svg.setAttribute("height", (y + 20).toString());
		svg.appendChild(filter);
		gs.forEach(g => svg.appendChild(g));
		return svg;
	}

	private async copyAs(button: HTMLButtonElement, type: CopyType): Promise<void> {
		button.classList.remove("success", "fail");
		try {
			const svg = this.getSVG();
			switch (type) {
				case CopyType.SVG:
					await navigator.clipboard.writeText(svg.outerHTML);
					break;
				case CopyType.PNG:
					const blob = await renderPNG(svg);
					if ("write" in navigator.clipboard) {
						// @ts-ignore:2304
						const data = new ClipboardItem({ [blob.type]: blob });
						// @ts-ignore:2339
						await navigator.clipboard.write([data]);
					}
					else {
						const a = document.createElement("a");
						a.download = "automata.png";
						a.href = URL.createObjectURL(blob);
						a.dispatchEvent(new MouseEvent("click", {
							view: window,
							bubbles: false,
							cancelable: true,
						}));
					}
					break;
				default:
					throw null;
			}
			button.classList.add("success");
		}
		catch {
			setTimeout(() => button.classList.add("fail"));
		}
	}

	public render(): ReactNode {
		return (
			<>
				{
					this.props.steps.map((a, i) =>
						<div key={i}>
							<VisualAutomata
								ref={this.vaRefs[i]}
								automata={a}
							/>
							<hr/>
						</div>
					)
				}
				<div
					className="action-buttons"
					style={{ textAlign: "end" }}
				>
					<span>Copy all steps as</span>
					<button
						data-icon="📄"
						onClick={e => this.copyAs(e.currentTarget, CopyType.SVG)}
						title="Copy all steps as a SVG"
					>SVG</button>
					<button
						data-icon="📄"
						onClick={e => this.copyAs(e.currentTarget, CopyType.PNG)}
						title="Copy all steps as a PNG"
					>PNG</button>
				</div>
			</>
		);
	}
}