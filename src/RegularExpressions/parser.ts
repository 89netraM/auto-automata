import { Alternative } from "./Alternative";
import { Empty } from "./Empty";
import { Nil } from "./Nil";
import { Reference } from "./Reference";
import { RegularExpression } from "./RegularExpression";
import { Sequence } from "./Sequence";
import { Star } from "./Star";
import { Symbol } from "./Symbol";

const reservedCharacters = [
	Alternative.Character,
	Empty.Character,
	Nil.Character,
	Star.Character,
] as const;

const allWhitespace = /\s/g;
const lastSymbol = new RegExp(`[^${reservedCharacters.join("")}][₀-₉]*$`);

export function parse(text: string): RegularExpression {
	text = text.replace(allWhitespace, "");
	const [exp, _] = parseAlternative(text);
	return exp;
}

function parseAlternative(text: string): [RegularExpression, string] {
	let exp2: RegularExpression;
	[exp2, text] = parseSequence(text);

	if (exp2 == null) {
		return [null, text];
	}
	if (text.length === 0) {
		return [exp2, text];
	}

	if (text.endsWith(Alternative.Character)) {
		text = text.substring(0, text.length - 1);
		let exp1: RegularExpression;
		[exp1, text] = parseAlternative(text);

		if (exp1 != null) {
			return [new Alternative(exp1, exp2), text];
		}
		else {
			return [null, text];
		}
	}
	else {
		return [exp2, text];
	}
}

function parseSequence(text: string): [RegularExpression, string] {
	let willBeStar = false;
	if (text.endsWith(Star.Character)) {
		willBeStar = true;
		text = text.substring(0, text.length - 1);
	}

	let exp2: RegularExpression;
	if (text.endsWith(")")) {
		[exp2, text] = parseAlternative(text.substring(0, text.length - 1));
	}
	else if (text.endsWith(Empty.Character)) {
		exp2 = Empty.Instance;
		text = text.substring(0, text.length - 1);
	}
	else if (text.endsWith(Nil.Character)) {
		exp2 = Nil.Instance;
		text = text.substring(0, text.length - 1);
	}
	else {
		const symbolMatch = text.match(lastSymbol);
		if (symbolMatch != null) {
			if (symbolMatch[0].length === 1) {
				exp2 = new Symbol(symbolMatch[0]);
			}
			else {
				exp2 = new Reference(symbolMatch[0]);
			}
			text = text.substring(0, text.length - symbolMatch[0].length);
		}
		else {
			return [null, text];
		}
	}

	if (exp2 == null) {
		return [null, text];
	}

	if (willBeStar) {
		exp2 = new Star(exp2);
	}

	if (text.length === 0 || text.endsWith(Alternative.Character)) {
		return [exp2, text];
	}
	if (text.endsWith("(")) {
		return [exp2, text.substring(0, text.length - 1)];
	}

	let exp1: RegularExpression;
	[exp1, text] = parseSequence(text);

	if (exp1 != null) {
		return [new Sequence(exp1, exp2), text];
	}
	else {
		return [null, text];
	}
}