const numberOffset = 0x2050;

export function generateSymbol(symbol: string, number: number): string {
	const bigString = number.toString();
	let nameString = symbol;
	for (let i = 0; i < bigString.length; i++) {
		nameString += String.fromCodePoint(bigString.codePointAt(i) + numberOffset);
	}
	return nameString;
}

const numberFinder = /^(.*?)([₀-₉]*)$/;
export function readNumber(symbol: string): [string, number] | null {
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
		return null;
	}
}

export function countUpSymbol(symbol: string): string;
export function countUpSymbol(symbol: string, isAvailable: (symbol: string) => boolean): string;
export function countUpSymbol(symbol: string, isAvailable?: (symbol: string) => boolean): string {
	let [symbolName, number] = readNumber(symbol) ?? [symbol, 0];
	let outSymbol: string;
	do {
		number++;
		outSymbol = generateSymbol(symbolName, number);
	} while (!(isAvailable?.(outSymbol) ?? true));
	return outSymbol;
}