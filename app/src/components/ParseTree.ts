import { graphlib } from "dagre-d3";
import { ContextFreeGrammar as CFG} from "auto-automata";
import { uuid } from "../utils";
import { GraphBase } from "./GraphBase";

export interface Properties {
	tree: CFG.ParseTree;
}

export class ParseTree extends GraphBase<Properties> {
	protected className: string = "parse-tree";

	public constructor(props: Properties) {
		super(props);
	}

	public shouldComponentUpdate(nextProps: Properties): boolean {
		return this.props.tree !== nextProps.tree;
	}

	protected buildGraph(): graphlib.Graph<{}> {
		const g = new graphlib.Graph().setGraph({});
		g.graph().rankdir = "UD";

		const addNode = (from: string, node: CFG.ParseTree | string): void => {
			const id = uuid();
			if (node instanceof CFG.ParseTree) {
				g.setNode(id, { label: node.nonTerminal })
			}
			else {
				g.setNode(id, { label: node });
			}
			g.setEdge(from, id, { });

			if (node instanceof CFG.ParseTree) {
				for (const childNode of node.children) {
					addNode(id, childNode);
				}
			}
		};
		const rootId = uuid();
		g.setNode(rootId, { label: this.props.tree.nonTerminal });
		for (const childNode of this.props.tree.children) {
			addNode(rootId, childNode);
		}

		return g;
	}

	protected specialGetSVG(svg: SVGSVGElement): void {
		svg.querySelectorAll(".edgePath path").forEach(n => {
			n.setAttribute("fill", "#000000");
			n.setAttribute("stroke", "#000000");
			n.setAttribute("stroke-width", "1.5px");
		});
		svg.querySelectorAll(".edgePath path[marker-end]")
			.forEach(n => n.setAttribute("marker-end", "url(" + n.getAttribute("marker-end").match(/(#.*)/)[1]));
		svg.querySelectorAll("rect").forEach(n => n.setAttribute("fill", "none"));
	}
}