import { Alternative } from "./Alternative";
import { Empty } from "./Empty";
import { fromAutomata } from "./from";
import { Nil } from "./Nil";
import { parse } from "./parser";
import { Reference } from "./Reference";
import { RegularExpression } from "./RegularExpression";
import { Sequence } from "./Sequence";
import { Star } from "./Star";
import { Symbol } from "./Symbol";

const emptyInstance = Empty.Instance;
const nilInstance = Nil.Instance;

export {
	Alternative,
	emptyInstance as Empty,
	fromAutomata,
	nilInstance as Nil,
	parse,
	Reference,
	RegularExpression,
	Sequence,
	Star,
	Symbol,
};