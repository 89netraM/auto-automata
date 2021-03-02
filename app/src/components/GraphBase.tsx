import { select, Selection } from "d3-selection";
import { graphlib, Render, render } from "dagre-d3";
import React, { Component, createRef, ReactNode, RefObject } from "react";
import { renderPNG } from "../utils";

enum CopyType {
	SVG,
	PNG,
}

export abstract class GraphBase<P> extends Component<P, {}> {
	private readonly svgRef: RefObject<SVGSVGElement>;
	private renderer: Render;
	private svg: Selection<SVGSVGElement, unknown, null, undefined>;
	private inner: Selection<SVGGElement, unknown, null, undefined>;

	protected className: string = "";

	public constructor(props: P) {
		super(props);

		this.svgRef = createRef();
	}

	protected abstract buildGraph(): graphlib.Graph<{}>;

	public componentDidMount(): void {
		this.renderer = new render();
		this.svg = select(this.svgRef.current);
		this.inner = this.svg.append("g");

		this.renderGraph();
	}

	public componentDidUpdate(): void {
		this.renderGraph();
	}

	protected specialRender(inner: typeof GraphBase.prototype.inner): void { }
	private renderGraph(): void {
		const g = this.buildGraph();
		this.inner.selectAll("g").remove();
		this.renderer(this.inner as any, g as any);
		this.specialRender(this.inner);

		const height = Number.isFinite(g.graph().height) ? g.graph().height : 0;
		const width = Number.isFinite(g.graph().width) ? g.graph().width : 0;
		this.svg.attr("height", height + 40);
		this.svg.attr("width", width + 40);
		const bounds = this.svgRef.current.getBoundingClientRect();
		this.inner.attr("transform", `translate(${(bounds.width - width) / 2}, ${(bounds.height - height) / 2})`);
	}

	protected specialGetSVG(svg: SVGSVGElement): void { }
	public getSVG(): SVGSVGElement {
		const svg = this.svgRef.current.cloneNode(true) as SVGSVGElement;
		svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
		svg.setAttribute("version", "2.0");
		svg.querySelector("g").setAttribute("transform", "translate(20, 20)");
		this.specialGetSVG(svg);
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
						a.download = "graph.png";
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
			<div className={`graph ${this.className ?? ""}`}>
				<div className="action-buttons">
					<button
						data-icon="📄"
						onClick={e => this.copyAs(e.currentTarget, CopyType.SVG)}
						title="Copy this graph as a SVG"
					>SVG</button>
					<button
						data-icon={"write" in navigator.clipboard ? "📄" : "💾"}
						onClick={e => this.copyAs(e.currentTarget, CopyType.PNG)}
						title={"write" in navigator.clipboard ?
							"Copy this graph as a PNG" :
							"Save this graph as a PNG"
						}
					>PNG</button>
				</div>
				<svg ref={this.svgRef}/>
			</div>
		);
	}
}