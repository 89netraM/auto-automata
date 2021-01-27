import { Alternative } from "./Alternative";
import { Empty } from "./Empty";
import { Nil } from "./Nil";
import { RegularExpression } from "./RegularExpression";
import { Sequence } from "./Sequence";
import { Star } from "./Star";
import { Symbol } from "./Symbol";

const emptyInstance = Empty.Instance;
const nilInstance = Nil.Instance;

export {
	Alternative,
	emptyInstance as Empty,
	nilInstance as Nil,
	RegularExpression,
	Sequence,
	Star,
	Symbol,
};