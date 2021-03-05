const numberOffset = 0x2050;
const AOffset = 0x41;
const letterCount = 25;

export function generateSymbol(symbol: string, number: number): string {
	const bigString = number.toString();
	let nameString = symbol;
	for (let i = 0; i < bigString.length; i++) {
		nameString += String.fromCodePoint(bigString.codePointAt(i) + numberOffset);
	}
	return nameString;
}

const numberFinder = /^(.*?)([₀-₉]*)$/;
export function readNumber(symbol: string): [string, number] {
	const result = numberFinder.exec(symbol);
	if (result != null && result[2].length > 0) {
		return [
			result[1],
			parseInt(
				[...result[2]]
					.map(c => String.fromCharCode(c.charCodeAt(0) - numberOffset))
					.join("")
			)
		];
	}
	else {
		return [symbol, 0];
	}
}

export function countUpSymbol(symbol: string): string;
export function countUpSymbol(symbol: string, isAvailable: (symbol: string) => boolean): string;
export function countUpSymbol(symbol: string, isAvailable?: (symbol: string) => boolean): string {
	let [symbolName, number] = readNumber(symbol);
	let outSymbol: string;
	do {
		number++;
		outSymbol = generateSymbol(symbolName, number);
	} while (!(isAvailable?.(outSymbol) ?? true));
	return outSymbol;
}
export function countUpLetterSymbol(symbol: string): string;
export function countUpLetterSymbol(symbol: string, isAvailable: (symbol: string) => boolean): string;
export function countUpLetterSymbol(symbol: string, isAvailable?: (symbol: string) => boolean): string {
	const post = symbol.substring(1);
	const codePoint = symbol.codePointAt(0) - AOffset;
	let outSymbol: string;
	for (let offset = 1; offset <= letterCount; offset++) {
		outSymbol = String.fromCodePoint((codePoint + offset) % letterCount + AOffset) + post;
		if (isAvailable?.(outSymbol) ?? true) {
			break;
		}
	}
	return outSymbol;
}

export function sortBySymbol(a: string, b: string): number {
	const [aSymbol, aNumber] = readNumber(a);
	const [bSymbol, bNumber] = readNumber(b);
	if (aSymbol < bSymbol) {
		return -1;
	}
	else if (aSymbol > bSymbol) {
		return 1;
	}
	else {
		return aNumber - bNumber;
	}
}
export function sortBySymbolButFirst(a: string, b: string, first: string): number {
	const [aSymbol, aNumber] = readNumber(a);
	const [bSymbol, bNumber] = readNumber(b);
	if (aSymbol === first && bSymbol !== first) {
		return -1;
	}
	else if (aSymbol !== first && bSymbol === first) {
		return 1;
	}
	else if (aSymbol < bSymbol) {
		return -1;
	}
	else if (aSymbol > bSymbol) {
		return 1;
	}
	else {
		return aNumber - bNumber;
	}
}