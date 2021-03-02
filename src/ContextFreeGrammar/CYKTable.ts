export class CYKTable extends Map<string, Set<string>> {
	public readonly string: string;

	public constructor(string: string);
	public constructor(string: string, entries: Iterable<(Readonly<[string, Set<string>]>)>);
	public constructor(original: CYKTable);
	public constructor(a: string | CYKTable, b?: Iterable<(Readonly<[string, Set<string>]>)>) {
		if (typeof a === "string") {
			super(b);
			this.string = a;
		}
		else {
			super([...a].map(([s, nts]) => [s, new Set<string>(nts)]));
			this.string = a.string;
		}
	}

	public formatLaTeX(maxHeight: number = this.string.length): string {
		let latex = "\\begin{array}{c}\n"

		for (let l = maxHeight; l > 0; l--) {
			const row = new Array<string>();
			for (let i = 0; i <= this.string.length - l; i++) {
				const part = this.string.substr(i, l);
				const nts = this.get(part);
				if (nts != null && nts.size > 0) {
					row.push(`\\{${[...nts].join(", ")}\\}`);
				}
				else {
					row.push("∅");
				}
			}
			latex += `\t${row.join(" & ")} \\\\\n`;
		}

		return latex +
			`\t\\hline\n\t${
				[...this.string]
					.map(s => `\\text{${s}}`)
					.join(" & ")
			}\n\\end{array}`;
	}
}