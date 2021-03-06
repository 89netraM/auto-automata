export type StepCallback<T> = (item: T, description?: string) => void;

export function descriptionNaturalList(items: Array<string>): string {
	if (items == null || items.length === 0) {
		return "";
	}
	else if (items.length === 1) {
		return items[0];
	}
	else if (items.length === 2) {
		return `${items[0]} and ${items[1]}`;
	}
	else {
		return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
	}
}