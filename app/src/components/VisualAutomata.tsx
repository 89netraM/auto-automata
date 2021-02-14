import { select, Selection } from "d3-selection";
import { curveBasis } from "d3-shape";
import { graphlib, Render, render } from "dagre-d3";
import React, { Component, createRef, ReactNode, RefObject } from "react";
import { Automata } from "../../../src";
import { renderPNG } from "../utils";

export interface Properties {
	automata: Automata;
}

enum CopyType {
	SVG,
	PNG,
}

export class VisualAutomata extends Component<Properties, {}> {
	private readonly svgRef: RefObject<SVGSVGElement>;
	private renderer: Render;
	private svg: Selection<SVGSVGElement, unknown, null, undefined>;
	private inner: Selection<SVGGElement, unknown, null, undefined>;

	public constructor(props: Properties) {
		super(props);

		this.svgRef = createRef();
	}

	private buildGraph(): graphlib.Graph<{}> {
		const automata = this.props.automata;

		const g = new graphlib.Graph().setGraph({});
		g.graph().rankdir = "LR";

		if (automata.starting != null) {
			let origin = "origin";
			while (origin in automata.states) {
				origin += origin;
			}
			g.setNode(origin, { shape: "circle", label: "", class: "origin" });
			g.setEdge(origin, automata.starting, {});
		}

		for (const from in automata.states) {
			g.setNode(
				from,
				{
					shape: "circle",
					class: automata.accepting.has(from) ? "accepting" : "",
				},
			);

			const transitionLabels: { [target: string]: Set<string> } = {};
			for (const letter in automata.states[from]) {
				for (const target of automata.states[from][letter]) {
					const l = target in transitionLabels ? transitionLabels[target] : new Set<string>();
					l.add(letter);
					transitionLabels[target] = l;
				}
			}
			for (const target in transitionLabels) {
				g.setEdge(
					from,
					target,
					{
						label: [...transitionLabels[target]].sort().join(", "),
						curve: curveBasis,
					},
				);
			}
		}

		return g;
	}

	public componentDidMount(): void {
		this.renderer = new render();
		this.svg = select(this.svgRef.current);
		this.inner = this.svg.append("g");

		this.renderAutomata();
	}

	public componentDidUpdate(): void {
		this.renderAutomata();
	}

	private renderAutomata(): void {
		const g = this.buildGraph();
		this.inner.selectAll("g").remove();
		this.renderer(this.inner as any, g as any);
		this.inner.selectAll(".accepting circle").attr("filter", "url(#dilate-and-xor)");

		const height = Number.isFinite(g.graph().height) ? g.graph().height : 0;
		const width = Number.isFinite(g.graph().width) ? g.graph().width : 0;
		this.svg.attr("height", height + 40);
		this.svg.attr("width", width + 40);
		const bounds = this.svgRef.current.getBoundingClientRect();
		this.inner.attr("transform", `translate(${(bounds.width - width) / 2}, ${(bounds.height - height) / 2})`);
	}

	public getSVG(): SVGSVGElement {
		const svg = this.svgRef.current.cloneNode(true) as SVGSVGElement;
		svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
		svg.setAttribute("version", "2.0");
		svg.querySelector("g").setAttribute("transform", "translate(20, 20)");
		svg.querySelectorAll(".edgePath path").forEach(n => {
			n.setAttribute("fill", "#000000");
			n.setAttribute("stroke", "#000000");
			n.setAttribute("stroke-width", "1.5px");
		});
		svg.querySelectorAll(".edgePath path[marker-end]")
			.forEach(n => n.setAttribute("marker-end", "url(" + n.getAttribute("marker-end").match(/(#.*)/)[1]));
		svg.querySelectorAll("circle").forEach(n => {
			n.setAttribute("fill", "none");
			n.setAttribute("stroke", "#000000");
			n.setAttribute("stroke-width", "1px");
		});
		svg.querySelectorAll(".origin circle").forEach(n => n.setAttribute("stroke", "none"));
		svg.querySelectorAll(".accepting circle").forEach(n => n.setAttribute("stroke-width", "3px"));
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
			<div className="visual-automata">
				<div className="action-buttons">
					<button
						data-icon="📄"
						onClick={e => this.copyAs(e.currentTarget, CopyType.SVG)}
						title="Copy this automata as a SVG"
					>SVG</button>
					<button
						data-icon="📄"
						className={"write" in navigator.clipboard ? null : "save"}
						onClick={e => this.copyAs(e.currentTarget, CopyType.PNG)}
						title={"write" in navigator.clipboard ?
							"Copy this automata as a PNG" :
							"Save this automata as a PNG"
						}
					>PNG</button>
				</div>
				<svg ref={this.svgRef}>
					<filter id="dilate-and-xor">
						<feMorphology
							in="SourceGraphic"
							result="dilate-result"
							operator="dilate"
							radius="1"
						/>
						<feComposite
							in="SourceGraphic"
							in2="dilate-result"
							result="xor-result"
							operator="xor"
						/>
					</filter>
				</svg>
			</div>
		);
	}
}