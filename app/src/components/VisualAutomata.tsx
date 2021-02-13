import { select, Selection } from "d3-selection";
import { curveBasis } from "d3-shape";
import { graphlib, Render, render } from "dagre-d3";
import React, { Component, createRef, ReactNode, RefObject } from "react";
import { Automata } from "../../../src";

export interface Properties {
	automata: Automata;
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

	public render(): ReactNode {
		return (
			<div className="visual-automata">
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