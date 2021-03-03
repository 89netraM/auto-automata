import { Selection } from "d3-selection";
import { curveBasis } from "d3-shape";
import { graphlib } from "dagre-d3";
import { Automata } from "auto-automata";
import { GraphBase } from "./GraphBase";

export interface Properties {
	automata: Automata;
}

export class VisualAutomata extends GraphBase<Properties> {
	protected className: string = "visual-automata";

	public constructor(props: Properties) {
		super(props);
	}

	protected buildGraph(): graphlib.Graph<{}> {
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

	protected specialRender(inner: Selection<SVGGElement, unknown, null, undefined>): void {
		const filter = inner.append("filter");
		filter.attr("id", "dilate-and-xor");
		const morph = filter.append("feMorphology");
		morph.attr("in", "SourceGraphic");
		morph.attr("result", "dilate-result");
		morph.attr("operator", "dilate");
		morph.attr("radius", "1");
		const comp = filter.append("feComposite");
		comp.attr("in", "SourceGraphic");
		comp.attr("in2", "dilate-result");
		comp.attr("result", "xor-result");
		comp.attr("operator", "xor");
		inner.selectAll(".accepting circle").attr("filter", "url(#dilate-and-xor)");
	}

	protected specialGetSVG(svg: SVGSVGElement): void {
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
	}
}